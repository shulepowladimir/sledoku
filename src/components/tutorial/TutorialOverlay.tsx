import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTutorialStore, watchTutorial, isStepConditionSatisfied } from '../../state/tutorialStore';
import { useGameStore } from '../../state/gameStore';
import { useIsMobile } from '../../hooks/useIsMobile';
import type { TutorialStep, TooltipSide } from '../../types/tutorial';

/** One spotlight hole per target element (expanded by a small padding).
 *  The tooltip anchor is the UNION of these rects. */
function resolveSpotlights(step: TutorialStep): DOMRect[] {
  const t = step.target;
  const PAD = 6;
  const expand = (r: DOMRect): DOMRect => new DOMRect(r.left - PAD, r.top - PAD, r.width + PAD * 2, r.height + PAD * 2);
  if (t.kind === 'none') return [];
  if (t.kind === 'selector') {
    const el = document.querySelector(t.selector);
    return el ? [expand(el.getBoundingClientRect())] : [];
  }
  const ids = t.kind === 'cell' ? [t.cellId] : t.cellIds;
  const rects: DOMRect[] = [];
  for (const id of ids) {
    const el = document.querySelector(`[data-testid="cell-${id}"]`);
    if (el) rects.push(expand(el.getBoundingClientRect()));
  }
  return rects;
}

function unionRect(rects: DOMRect[]): DOMRect | null {
  if (rects.length === 0) return null;
  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;
  for (const r of rects) {
    left = Math.min(left, r.left);
    top = Math.min(top, r.top);
    right = Math.max(right, r.right);
    bottom = Math.max(bottom, r.bottom);
  }
  return new DOMRect(left, top, right - left, bottom - top);
}

/** Estimated tooltip box used for viewport fitting (max-width 340 + borders + margin of error
 *  for the longest copy — lesson texts run up to ~3 paragraphs). */
const TOOLTIP_W = 372;
const TOOLTIP_H = 380;
const VIEWPORT_PAD = 12;
const GAP = 16;

function clampNumber(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function tooltipIntersects(left: number, top: number, r: DOMRect): boolean {
  return left < r.right && left + TOOLTIP_W > r.left && top < r.bottom && top + TOOLTIP_H > r.top;
}

function tooltipOverlapArea(left: number, top: number, r: DOMRect): number {
  const w = Math.min(left + TOOLTIP_W, r.right) - Math.max(left, r.left);
  const h = Math.min(top + TOOLTIP_H, r.bottom) - Math.max(top, r.top);
  return w > 0 && h > 0 ? w * h : 0;
}

/** Cell-target steps: the board must stay fully visible and every spotlighted or also-highlighted
 *  element must remain clickable (the tooltip sits above them in z-order). Anchor the card OUTSIDE
 *  the board+roster area — right of the roster panel first, then a chain of fallbacks, each
 *  rejected if it would overlap a clickable rect. */
function tooltipStyleForCells(union: DOMRect, avoid: DOMRect[]): React.CSSProperties {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const board = document.querySelector('.board')?.getBoundingClientRect();
  const roster = document.querySelector('.roster-panel')?.getBoundingClientRect();
  const clampTop = (top: number) => clampNumber(top, VIEWPORT_PAD, Math.max(VIEWPORT_PAD, H - VIEWPORT_PAD - TOOLTIP_H));
  const fitsWidth = (left: number) => left >= VIEWPORT_PAD && left + TOOLTIP_W <= W - VIEWPORT_PAD;

  const candidates: Array<[number, number]> = [];
  // 1. Right of the roster panel: neither board nor roster is covered.
  if (roster && fitsWidth(roster.right + GAP)) candidates.push([roster.right + GAP, clampTop(union.top)]);
  if (board) {
    // 2. Right of the board (over the roster) at three vertical offsets.
    if (fitsWidth(board.right + GAP)) {
      candidates.push([board.right + GAP, clampTop(board.top)]);
      candidates.push([board.right + GAP, clampTop(union.top + union.height / 2 - TOOLTIP_H / 2)]);
      candidates.push([board.right + GAP, clampTop(board.bottom - TOOLTIP_H)]);
    }
    // 3. Left of the board.
    if (fitsWidth(board.left - GAP - TOOLTIP_W)) candidates.push([board.left - GAP - TOOLTIP_W, clampTop(union.top)]);
    // 4. Below the board, horizontally centered on it.
    candidates.push([
      clampNumber(board.left + board.width / 2 - TOOLTIP_W / 2, VIEWPORT_PAD, W - VIEWPORT_PAD - TOOLTIP_W),
      clampTop(board.bottom + GAP),
    ]);
  }
  // 5. Bottom-right corner of the viewport.
  candidates.push([W - VIEWPORT_PAD - TOOLTIP_W, H - VIEWPORT_PAD - TOOLTIP_H]);

  for (const [left, top] of candidates) {
    if (!avoid.some((r) => tooltipIntersects(left, top, r))) return { left, top };
  }
  // Last resort: the candidate with the smallest overlap with clickable rects.
  let best = candidates[candidates.length - 1];
  let bestArea = Infinity;
  for (const [left, top] of candidates) {
    const area = avoid.reduce((sum, r) => sum + tooltipOverlapArea(left, top, r), 0);
    if (area < bestArea) {
      bestArea = area;
      best = [left, top];
    }
  }
  return { left: best[0], top: best[1] };
}

/** Selector-target steps: stick to the given side of the element, flipping/clamping into the viewport. */
function tooltipStyleForSelector(rect: DOMRect, side: TooltipSide): React.CSSProperties {
  const W = window.innerWidth;
  const H = window.innerHeight;
  if (side === 'top' || side === 'bottom') {
    const cx = rect.left + rect.width / 2;
    const wantBottom = side === 'bottom';
    const belowTop = rect.bottom + GAP;
    const aboveTop = rect.top - GAP - TOOLTIP_H;
    const belowFits = belowTop + TOOLTIP_H <= H - VIEWPORT_PAD;
    const aboveFits = aboveTop >= VIEWPORT_PAD;
    let top: number;
    if (wantBottom && belowFits) top = belowTop;
    else if (!wantBottom && aboveFits) top = aboveTop;
    else if (belowFits) top = belowTop;
    else if (aboveFits) top = aboveTop;
    else top = Math.max(VIEWPORT_PAD, Math.min(H - VIEWPORT_PAD - TOOLTIP_H, (H - TOOLTIP_H) / 2));
    const cxMin = VIEWPORT_PAD + TOOLTIP_W / 2;
    const cxMax = W - VIEWPORT_PAD - TOOLTIP_W / 2;
    const left = clampNumber(cx, cxMin, Math.max(cxMin, cxMax));
    return { left, top, transform: 'translateX(-50%)' };
  }
  const wantRight = side === 'right';
  const rightLeft = rect.right + GAP;
  const leftLeft = rect.left - GAP - TOOLTIP_W;
  const rightFits = rightLeft + TOOLTIP_W <= W - VIEWPORT_PAD;
  const leftFits = leftLeft >= VIEWPORT_PAD;
  let left: number;
  if (wantRight && rightFits) left = rightLeft;
  else if (!wantRight && leftFits) left = leftLeft;
  else if (rightFits) left = rightLeft;
  else if (leftFits) left = leftLeft;
  else left = (W - TOOLTIP_W) / 2;
  const cy = rect.top + rect.height / 2;
  const top = clampNumber(cy - TOOLTIP_H / 2, VIEWPORT_PAD, Math.max(VIEWPORT_PAD, H - VIEWPORT_PAD - TOOLTIP_H));
  return { left, top };
}

export function TutorialOverlay() {
  const active = useTutorialStore((s) => s.active);
  const steps = useTutorialStore((s) => s.steps);
  const stepIndex = useTutorialStore((s) => s.stepIndex);
  const next = useTutorialStore((s) => s.next);
  const prev = useTutorialStore((s) => s.prev);
  const player = useGameStore((s) => s.player);
  const isMobile = useIsMobile();
  const [tick, setTick] = useState(0);

  useEffect(() => watchTutorial(), []);

  useEffect(() => {
    const onResize = () => setTick((t) => t + 1);
    window.addEventListener('resize', onResize);
    // Spotlight holes use viewport coordinates (fixed overlay); the page scrolls on mobile
    // (board + roster accordion stack vertically), so the holes must follow the content.
    window.addEventListener('scroll', onResize, { passive: true, capture: true });
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, { capture: true } as EventListenerOptions);
    };
  }, []);

  const step: TutorialStep | undefined = useMemo(() => steps[stepIndex], [steps, stepIndex]);

  // Measure the targets; re-run on every game-state change (layout may shift), resize and
  // scroll (setTick — the fixed-overlay holes are in viewport coordinates).
  const tickRef = tick;
  const spotlights = useMemo(() => {
    void player;
    void tickRef;
    return step ? resolveSpotlights(step) : [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, player, tickRef]);

  // Rects of the also-highlighted auxiliary targets (e.g. the roster row or mode button the
  // step's action needs) — the tooltip placement must not cover them either.
  const alsoRects = useMemo(() => {
    void player;
    void tickRef;
    if (!step) return [];
    return (step.alsoSelectors ?? [])
      .map((selector) => document.querySelector(selector))
      .filter((el): el is Element => el != null)
      .map((el) => el.getBoundingClientRect());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, player, tickRef]);

  // Final tooltip position: cell-target steps use the board-aware placement (the board must stay
  // visible and every clickable target reachable); selector steps stick to the chosen side.
  // Mobile: the tooltip is pinned to a screen edge — the one OPPOSITE to the target (target in
  // the bottom half → tooltip on top, otherwise at the bottom), so the spotlighted element
  // stays visible (the roster accordion lives below the board on mobile).
  const tooltipPos = useMemo(() => {
    if (!step) return undefined;
    if (isMobile) {
      const union = unionRect(spotlights);
      const targetInBottomHalf = !!union && union.top + union.height / 2 > window.innerHeight / 2;
      return targetInBottomHalf
        ? ({ left: 12, right: 12, top: 12, bottom: 'auto' } as React.CSSProperties)
        : ({ left: 12, right: 12, bottom: 12, top: 'auto' } as React.CSSProperties);
    }
    if (spotlights.length === 0) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' } as React.CSSProperties;
    const union = unionRect(spotlights)!;
    if (step.target.kind === 'cell' || step.target.kind === 'cells') {
      return tooltipStyleForCells(union, [...spotlights, ...alsoRects]);
    }
    return tooltipStyleForSelector(union, step.tooltipSide ?? 'bottom');
  }, [step, spotlights, alsoRects, isMobile]);

  // Keep the spotlighted target clickable above the overlay via a z-index class.
  useEffect(() => {
    if (!step) return;
    const t = step.target;
    const els: Element[] = [];
    if (t.kind === 'selector') {
      const el = document.querySelector(t.selector);
      if (el) els.push(el);
    } else if (t.kind === 'cell' || t.kind === 'cells') {
      const ids = t.kind === 'cell' ? [t.cellId] : t.cellIds;
      for (const id of ids) {
        const el = document.querySelector(`[data-testid="cell-${id}"]`);
        if (el) els.push(el);
      }
    }
    els.forEach((el) => el.classList.add('tutorial-highlight'));
    // Mobile: the target may live far below the fold (roster accordion) or the tooltip can
    // cover it — bring the first spotlighted element into view whenever the step changes.
    if (isMobile && els.length > 0) {
      els[0].scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
    const alsoEls = (step.alsoSelectors ?? [])
      .map((selector) => document.querySelector(selector))
      .filter((el): el is Element => el != null);
    alsoEls.forEach((el) => el.classList.add('tutorial-highlight'));
    const accents = step.highlightCells ?? [];
    const accentEls = accents
      .map((id) => document.querySelector(`[data-testid="cell-${id}"]`))
      .filter((el): el is Element => el != null);
    accentEls.forEach((el) => el.classList.add('tutorial-accent'));
    return () => {
      els.forEach((el) => el.classList.remove('tutorial-highlight'));
      alsoEls.forEach((el) => el.classList.remove('tutorial-highlight'));
      accentEls.forEach((el) => el.classList.remove('tutorial-accent'));
    };
  }, [step, isMobile]);

  if (!active || !step) return null;

  const waitForAction = step.advance.kind !== 'next';
  // After stepping back onto an already-completed action step, offer "Далее" instead of
  // demanding the action be repeated (the board state already satisfies it).
  const conditionDone = waitForAction && isStepConditionSatisfied(step);

  // The tooltip is portaled to <body>: it must sit above the highlighted target cells
  // (z 2001 in the root stacking context), which is impossible inside the overlay (z 2000 context).
  const tooltip = (
    <div
      className="tutorial-tooltip"
      style={tooltipPos}
      data-testid="tutorial-tooltip"
    >
      <div className="tutorial-tooltip__header">
        <span className="tutorial-tooltip__title">{step.title}</span>
      </div>
      {(isMobile && step.textMobile ? step.textMobile : step.text).map((p, i) => (
        <p key={i} className="tutorial-tooltip__text">
          {p}
        </p>
      ))}
      <div className="tutorial-tooltip__actions">
        {stepIndex > 0 && (
          <button type="button" className="tutorial-tooltip__back" data-testid="tutorial-back" onClick={prev}>
            ‹ Назад
          </button>
        )}
        {waitForAction && !conditionDone && (
          <span className="tutorial-tooltip__hint">Выполните действие, чтобы продолжить</span>
        )}
        {(!waitForAction || conditionDone) && (
          <button type="button" className="tutorial-tooltip__next" data-testid="tutorial-next" onClick={next}>
            Далее
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="tutorial-overlay" data-testid={`tutorial-step-${step.id}`}>
      {/* Full-screen SVG dimmer with per-target holes cut by a mask. The dimmed rect receives
          pointer events only where it is painted (visiblePainted), so clicks pass through the
          holes to the highlighted targets below the overlay. */}
      <svg className="tutorial-overlay__mask" data-testid="tutorial-spotlight">
        <defs>
          <mask id="tutorial-spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {spotlights.map((r, i) => (
              <rect key={i} x={r.x} y={r.y} width={r.width} height={r.height} rx="12" fill="black" />
            ))}
          </mask>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="rgba(24, 20, 16, 0.72)" mask="url(#tutorial-spotlight-mask)" />
      </svg>
      {createPortal(tooltip, document.body)}
    </div>
  );
}
