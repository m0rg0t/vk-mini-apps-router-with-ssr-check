import assert from 'node:assert/strict';
import { test } from 'node:test';

test('public entry imports without window or document', async () => {
  assert.equal(typeof window, 'undefined');
  assert.equal(typeof document, 'undefined');
  const router = await import('../src/index');
  assert.equal(typeof router.createBrowserRouter, 'function');
  assert.equal(typeof router.createHashRouter, 'function');
  assert.equal(router.getInitialLocation(), undefined);
});


test('public provider renders on the server without browser globals', async () => {
  const { createElement } = await import('react');
  const { renderToString } = await import('react-dom/server');
  const { createMemoryHistory, createRouter } = await import('@remix-run/router');
  const { RouterProvider, RouterLink } = await import('../src/index');
  const router = createRouter({ history: createMemoryHistory({ initialEntries: ['/'] }),
    routes: [{ id: 'home', path: '/', view: 'main', panel: 'home' }] }).initialize();
  try {
    const html = renderToString(createElement(RouterProvider,
      { router, useBridge: false, children: createElement(RouterLink, { to: '/next', children: 'SSR content' }) }));
    assert.match(html, /SSR content/);
    assert.match(html, /href="\/next"/);
  } finally { router.dispose(); }
});
