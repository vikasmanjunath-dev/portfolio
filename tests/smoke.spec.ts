import { test, expect } from '@playwright/test';

test('home renders, 3D optional: Zen mode keeps the page usable', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('vm.zen', '1'));
  await page.goto('/');
  await expect(page.locator('h1#h1')).toContainText('verify');
  await expect(page.locator('html')).toHaveClass(/zen/);
  await expect(page.locator('#work')).toBeAttached();
});

test('keyboard modes: V toggles Verify, Z toggles Zen, ⌘K opens the palette', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('vm.zen', '1'));
  await page.goto('/');
  await page.waitForFunction(() => document.documentElement.classList.contains('js'));
  const html = page.locator('html');
  await page.keyboard.press('v'); await expect(html).toHaveClass(/verify/);
  await page.keyboard.press('v'); await expect(html).not.toHaveClass(/verify/);
  await page.keyboard.press('z'); await expect(html).not.toHaveClass(/zen/);
  await page.keyboard.press('ControlOrMeta+k'); await expect(page.getByRole('dialog', { name: 'Command palette' })).toBeVisible();
  await page.keyboard.press('Escape'); await expect(page.getByRole('dialog', { name: 'Command palette' })).toBeHidden();
});

test('?for=judge presets the visitor switch', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('vm.zen', '1'));
  await page.goto('/?for=judge');
  await expect(page.locator('html')).toHaveAttribute('data-aud', 'judge');
  await expect(page.getByRole('button', { name: 'Judge' })).toHaveAttribute('aria-pressed', 'true');
});

test('contact form posts JSON (mocked) and confirms', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('vm.zen', '1'));
  let body: Record<string, string> | null = null;
  await page.route('https://formsubmit.co/**', async (r) => { body = r.request().postDataJSON(); await r.fulfill({ json: { success: 'true' } }); });
  await page.goto('/');
  await page.getByLabel('Your name').fill('Test Recruiter');
  await page.getByLabel('Your email').fill('test@example.com');
  await page.getByLabel('Message').fill('Hello, smoke test.');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByText('Sent. I will reply by email.')).toBeVisible();
  expect(body).toMatchObject({ name: 'Test Recruiter', email: 'test@example.com' });
});

test('honeypot: a filled hidden field never reaches the network', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('vm.zen', '1'));
  let hit = false; await page.route('https://formsubmit.co/**', (r) => { hit = true; r.abort(); });
  await page.goto('/');
  await page.getByLabel('Your name').fill('Bot'); await page.getByLabel('Your email').fill('b@x.io'); await page.getByLabel('Message').fill('spam');
  await page.locator('input[name=_honey]').evaluate((e: HTMLInputElement) => { e.value = 'x'; e.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.getByRole('button', { name: 'Send message' }).click();
  expect(hit).toBe(false);
});

test('essay permalink, RSS feed and a case page with the run box', async ({ page, request }) => {
  await page.goto('/writing/parity/');
  await expect(page.locator('h1')).toContainText('103 times out of 500');
  const feed = await (await request.get('/feed.xml')).text();
  expect(feed.match(/<item>/g)?.length).toBe(6);
  await page.goto('/work/finos/');
  await expect(page.locator('#run')).toBeVisible();
});

test('unknown route returns the honest 404', async ({ page }) => {
  await page.goto('/nope/');
  await expect(page.locator('h1')).toContainText('failed verification');
});

test('evidence ledger filters by class and exposes JSON', async ({ page, request }) => {
  await page.goto('/evidence/');
  const all = await page.getByRole('status').filter({ hasText: 'claims' }).first().innerText();
  await page.getByRole('button', { name: /Self-reported/ }).click();
  const some = await page.getByRole('status').filter({ hasText: 'claims' }).first().innerText();
  expect(some).not.toBe(all);
  const j = await (await request.get('/evidence.json')).json();
  expect(j.total).toBe(j.claims.length);
  expect(j.counts.ok + j.counts.doc + j.counts.self).toBe(j.total);
});

test('brief page carries the captioned tour video', async ({ page, request }) => {
  await page.goto('/brief/');
  await expect(page.locator('video#tour, #tour video')).toHaveCount(1);
  await expect(page.locator('#tour track[kind="captions"]')).toHaveAttribute('src', '/tour.vtt');
  expect((await request.get('/tour.mp4')).status()).toBe(200);
  expect(await (await request.get('/tour.vtt')).text()).toContain('WEBVTT');
});

test('JD matcher ranks projects and names honest gaps', async ({ page }) => {
  await page.goto('/match/');
  await page.getByRole('button', { name: 'Try a sample' }).click();
  await expect(page.locator('.vclaim').first()).toBeVisible();
  await expect(page.getByText('Asked for, not in my projects')).toBeVisible();
  await expect(page.locator('.limits .fchip', { hasText: 'kubernetes' })).toBeVisible();
  await expect(page.locator('.limits .fchip', { hasText: 'postgresql' })).toHaveCount(0);
});

test('certificates page filters, searches and opens a certificate image', async ({ page }) => {
  await page.goto('/certificates/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Every certificate');
  const note = page.locator('.lab-note').first();
  await expect(note).toContainText('63 of 63');
  await page.getByRole('button', { name: /Participation · 18/ }).click();
  await expect(note).toContainText('18 of 63');
  await page.getByLabel('Search certificates').fill('IPL');
  await expect(note).toContainText('1 of 63');
  await page.getByRole('button', { name: /Open certificate: IPL Auction/ }).click();
  const dlg = page.getByRole('dialog');
  await expect(dlg.locator('img')).toBeVisible();
  await expect(dlg.locator('img')).toHaveAttribute('alt', /IPL Auction/);
  await page.keyboard.press('Escape');
  await expect(dlg).toBeHidden();
});
