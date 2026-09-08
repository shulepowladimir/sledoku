import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const SITE_URL = 'https://sledoku.vercel.app/';

/** Размеры PNG из заголовка IHDR: ширина — смещение 16, высота — 20 (big-endian uint32). */
function pngSize(path: string): { width: number; height: number } {
  const buf = readFileSync(path);
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error(`${path} — не PNG`);
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

async function metaContent(page: Page, selector: string): Promise<string | null> {
  return page.locator(selector).getAttribute('content');
}

test.describe('мета-теги для шеринга (OG/Twitter)', () => {
  test('index.html carries description, canonical and OG/Twitter tags', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle('Следоку');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /судоку/i);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', SITE_URL);

    const expected: Array<[string, string, string]> = [
      ['property', 'og:type', 'website'],
      ['property', 'og:site_name', 'Следоку'],
      ['property', 'og:locale', 'ru_RU'],
      ['property', 'og:url', SITE_URL],
      ['property', 'og:image', `${SITE_URL}og-image.png`],
      ['name', 'twitter:card', 'summary_large_image'],
      ['name', 'twitter:image', `${SITE_URL}og-image.png`],
    ];
    for (const [attr, key, value] of expected) {
      await expect(page.locator(`meta[${attr}="${key}"]`)).toHaveAttribute('content', value);
    }

    // Текстовые теги — непустые (точные формулировки меняются, пустыми быть не должны).
    for (const selector of [
      'meta[property="og:title"]',
      'meta[property="og:description"]',
      'meta[name="twitter:title"]',
      'meta[name="twitter:description"]',
    ]) {
      const content = await metaContent(page, selector);
      expect(content, selector).toBeTruthy();
      expect(content!.length, selector).toBeGreaterThan(10);
    }
  });

  test('declared og:image dimensions match the actual PNG', async ({ page }) => {
    await page.goto('/');

    const { width, height } = pngSize('public/og-image.png');
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', String(width));
    await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', String(height));
    // Превью «large image» в Telegram требует сторону ≥ 600px и разумный вес.
    expect(width).toBeGreaterThanOrEqual(1200);
    expect(height).toBeGreaterThanOrEqual(630);
  });
});
