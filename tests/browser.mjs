import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
await mkdir('test-results', { recursive: true });
const evidence = [];

const bundle = await build({
  entryPoints: ['tests/browser-fixture.tsx'],
  bundle: true, write: false, format: 'iife', platform: 'browser',
});
const browser = await chromium.launch();
try {
  for (const factory of ['createBrowserRouter', 'createHashRouter']) {
    const page = await browser.newPage();
    await page.route('http://router.test/**', route => route.fulfill({
      contentType: 'text/html', body: '<!doctype html><title>Local router fixture</title>',
    }));
    await page.goto('http://router.test/');
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
    const paths = await page.evaluate(async name => {
      const router = window.factories[name]([
        { path: '/', view: 'main', panel: 'home' },
        { path: '/next/:id', view: 'main', panel: 'next' },
      ]);
      const visited = [router.state.location.pathname];
      await router.navigate('/next/42?tab=details');
      visited.push(router.state.location.pathname + router.state.location.search);
      const waitFor = path => new Promise(resolve => {
        const unsubscribe = router.subscribe(state => {
          if (state.location.pathname === path) { unsubscribe(); resolve(); }
        });
      });
      const back = waitFor('/');
      await router.navigate(-1);
      await back;
      visited.push(router.state.location.pathname);
      const forward = waitFor('/next/42');
      await router.navigate(1);
      await forward;
      visited.push(router.state.location.pathname + router.state.location.search);
      router.dispose();
      return visited;
    }, factory);
    assert.deepEqual(paths, ['/', '/next/42?tab=details', '/', '/next/42?tab=details']);
    evidence.push({ factory, paths });
    await page.screenshot({ path: `test-results/${factory}.png` });
    await page.close();
    console.log(`${factory}: navigate/back/forward passed`);
  }
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('http://router.test/**', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Component regressions</title>' }));
  await page.goto('http://router.test/');
  await page.addScriptTag({ content: bundle.outputFiles[0].text });
  await page.evaluate(() => { window.renderHarness(); window.renderLinks(); });
  await page.getByText('Go next', { exact: true }).click();
  await page.getByText('Current next', { exact: true }).waitFor();
  assert.equal(await page.evaluate(() => window.linkRef.current?.tagName), 'A');
  assert.equal(await page.locator('a').getAttribute('class').then(value => value.includes('active-link')), true);
  for (let index = 0; index < 4; index++) {
    await page.getByRole('button', { name: 'Toggle throttle' }).click();
    await page.getByRole('button', { name: 'Change value' }).click();
    await page.waitForFunction(expected => document.querySelector('output').textContent === expected, index % 2 ? 'first' : 'second');
  }
  assert.deepEqual(errors, []);
  await page.screenshot({ path: 'test-results/components.png' });
  evidence.push({ components: 'link ref/render props/navigation and repeated throttle toggles', errors });
  await page.close();
} finally {
  await writeFile('test-results/navigation.json', JSON.stringify(evidence, null, 2));
  await browser.close();
}
