import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PUBLIC_ROUTES } from './helpers';

const WIDTHS = [360, 430, 820, 1366, 1920];

test.describe('layout e acessibilidade das páginas públicas', () => {
  for (const route of PUBLIC_ROUTES) {
    test(`axe + sem rolagem horizontal: ${route}`, async ({ page }) => {
      const slug = route.replace(/[^a-z0-9]+/gi, '_') || 'home';
      for (const w of WIDTHS) {
        await page.setViewportSize({ width: w, height: 900 });
        await page.goto(route);
        await page.waitForLoadState('networkidle');
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow, `rolagem horizontal em ${w}px`).toBeLessThanOrEqual(0);
        if (w === 360 || w === 1366) await page.screenshot({ path: `shots/${slug}-${w}.png`, fullPage: true });
      }
      await page.setViewportSize({ width: 1366, height: 900 });
      await page.goto(route);
      const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      const bad = res.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(bad.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
    });
  }
});
