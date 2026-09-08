import { chromium } from '@playwright/test';
import { gameLevels } from '../../levels';

/**
 * Генератор OG-баннера (превью ссылки в Telegram/VK) — 1200×630 @2x → public/og-image.png.
 * Стиль — «постерный нуар» сайта: кремовый фон, жёсткая смещённая тень заголовка,
 * двойные линии (как у подвала), бордовый штамп с числом дел (считается из levels).
 *
 * Перезапускать при смене числа уровней или бренда: `npm run generate-og`.
 */

const OUT_PATH = 'public/og-image.png';

/** Та же плюрализация, что в SiteFooter («дело/дела/дел»). */
function pluralCases(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'дело';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'дела';
  return 'дел';
}

const casesCount = gameLevels.length;
const casesWord = pluralCases(casesCount).toUpperCase();

// Логотип — те же фигуры, что в GameLogo.tsx / public/favicon.svg.
const LOGO_SVG = `
  <svg class="logo" viewBox="0 0 100 100" role="img" aria-label="Следоку">
    <rect x="4" y="4" width="92" height="92" rx="14" fill="none" stroke="#2a2a2a" stroke-width="6"/>
    <line x1="50" y1="10" x2="50" y2="90" stroke="#2a2a2a" stroke-width="5" stroke-linecap="round"/>
    <line x1="10" y1="50" x2="90" y2="50" stroke="#2a2a2a" stroke-width="5" stroke-linecap="round"/>
    <line x1="33" y1="33" x2="84" y2="84" stroke="#2a2a2a" stroke-width="9" stroke-linecap="round"/>
    <circle cx="22" cy="22" r="15" fill="#faf8f4" stroke="#2a2a2a" stroke-width="6"/>
    <g stroke="#b91c1c" stroke-width="4" stroke-linecap="round">
      <line x1="15" y1="15" x2="29" y2="29"/>
      <line x1="29" y1="15" x2="15" y2="29"/>
    </g>
  </svg>`;

const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; overflow: hidden; }
  body {
    font-family: system-ui, 'Segoe UI', Roboto, sans-serif;
    background: #faf8f4;
    position: relative;
  }
  .frame {
    position: absolute;
    inset: 28px;
    border: 4px double #2a2a2a;
    border-radius: 24px;
  }
  .stamp {
    position: absolute;
    top: 64px;
    right: 72px;
    transform: rotate(-8deg);
    border: 5px double #8a2f28;
    border-radius: 12px;
    padding: 10px 24px;
    color: #8a2f28;
    font-weight: 800;
    font-size: 44px;
    line-height: 1.05;
    text-align: center;
    opacity: 0.9;
  }
  .stamp small {
    display: block;
    font-size: 19px;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    margin-top: 2px;
  }
  .wrap {
    position: absolute;
    inset: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 72px;
    padding: 0 64px;
  }
  .logo { width: 280px; height: 280px; flex-shrink: 0; }
  .col { display: flex; flex-direction: column; align-items: flex-start; gap: 24px; }
  .title {
    font-size: 118px;
    line-height: 1;
    font-weight: 800;
    letter-spacing: 0.01em;
    color: #2a2a2a;
    /* Жёсткая смещённая тень без блюра — фирменный приём pulp-постера (STYLE-GUIDE). */
    text-shadow: 7px 7px 0 #3a2a20;
  }
  .tagline {
    font-size: 30px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #8a2f28;
  }
  .sub {
    font-size: 27px;
    color: #6b6760;
    border-top: 3px double rgba(17, 17, 17, 0.35);
    padding-top: 16px;
  }
</style>
</head>
<body>
  <div class="frame"></div>
  <div class="stamp">${casesCount}<small>${casesWord}</small></div>
  <div class="wrap">
    ${LOGO_SVG}
    <div class="col">
      <div class="title">Следоку</div>
      <div class="tagline">судоку в обёртке детектива</div>
      <div class="sub">Расставляйте подозреваемых по уликам</div>
    </div>
  </div>
</body>
</html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2 });
await page.setContent(html);

// Геометрическая самопроверка: ничего не вылезает за рамку и колонки не наезжают друг на друга.
const geometry = await page.evaluate(() => {
  const frame = document.querySelector('.frame')!.getBoundingClientRect();
  const logo = document.querySelector('.logo')!.getBoundingClientRect();
  const col = document.querySelector('.col')!.getBoundingClientRect();
  const stamp = document.querySelector('.stamp')!.getBoundingClientRect();
  const colEl = document.querySelector('.col') as HTMLElement;
  return {
    body: { w: document.body.scrollWidth, h: document.body.scrollHeight },
    frame,
    logo,
    col,
    stamp,
    colOverflowX: colEl.scrollWidth - colEl.clientWidth,
  };
});

const problems: string[] = [];
if (geometry.body.w !== 1200 || geometry.body.h !== 630) problems.push(`body ${geometry.body.w}×${geometry.body.h} ≠ 1200×630`);
if (geometry.logo.right > geometry.col.left) problems.push('логотип наезжает на текстовую колонку');
if (geometry.col.right > geometry.frame.right - 20) problems.push(`колонка вылезает за рамку: ${geometry.col.right} > ${geometry.frame.right - 20}`);
if (geometry.stamp.top < 32 || geometry.stamp.right > 1168 || geometry.stamp.bottom > 598)
  problems.push(`штамп за рамкой: ${JSON.stringify(geometry.stamp)}`);
if (geometry.colOverflowX > 0) problems.push(`текст колонки шире контейнера на ${geometry.colOverflowX}px`);
if (problems.length > 0) {
  console.error('OG-баннер: проблемы вёрстки:\n' + problems.map((p) => `  - ${p}`).join('\n'));
  console.error(JSON.stringify(geometry, null, 2));
  await browser.close();
  process.exit(1);
}

await page.screenshot({ path: OUT_PATH });
await browser.close();

const { readFile } = await import('node:fs/promises');
const png = await readFile(OUT_PATH);
// IHDR: ширина — смещение 16, высота — 20 (big-endian uint32).
const width = png.readUInt32BE(16);
const height = png.readUInt32BE(20);
console.log(`OK: ${OUT_PATH} — ${width}×${height}, ${(png.length / 1024).toFixed(0)} КБ, ${casesCount} ${casesWord.toLowerCase()} в штампе.`);
