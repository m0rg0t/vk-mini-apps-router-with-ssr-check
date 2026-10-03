import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { build } from 'esbuild';

const output = await mkdtemp(path.join(tmpdir(), 'router-package-'));
const [pack] = JSON.parse(execFileSync('npm', ['pack', '--ignore-scripts', '--json', '--cache', path.join(output, 'npm-cache'), '--pack-destination', output], { encoding: 'utf8' }));
assert.ok(pack.files.some(file => file.path === 'dist/index.js'));
assert.ok(pack.files.some(file => file.path === 'dist/index.d.ts'));
assert.ok(!pack.files.some(file => /^(tests|examples|node_modules)\//.test(file.path)));
execFileSync('tar', ['-xzf', path.join(output, pack.filename), '-C', output]);
const manifest = JSON.parse(await readFile(path.join(output, 'package/package.json'), 'utf8'));
assert.equal(manifest.name, '@vkontakte/vk-mini-apps-router');
const bundled = path.join(output, 'ssr.cjs');
await build({ entryPoints: [path.join(output, 'package', manifest.main)], outfile: bundled,
  bundle: true, platform: 'node', format: 'cjs', nodePaths: [path.resolve('node_modules')],
});
assert.equal(typeof globalThis.window, 'undefined');
const api = createRequire(import.meta.url)(bundled);
for (const name of ['RouterProvider', 'createHashRouter', 'createBrowserRouter', 'createHashParamRouter', 'useRouteNavigator', 'withRouter']) {
  assert.equal(typeof api[name], 'function', name);
}
assert.equal(typeof api.RouterLink.render, 'function');
assert.equal(api.getInitialLocation(), undefined);
await mkdir('test-results', { recursive: true });
await writeFile('test-results/package.json', JSON.stringify({ name: manifest.name, integrity: pack.integrity,
  files: pack.files.map(file => file.path), exports: Object.keys(api).sort() }, null, 2));
console.log('Packed library consumer and SSR import passed');
