# Руководство по разработке

Данный раздел будет развиваться.

### Команды для запуска проекта локально

* `yarn install` — установка зависимостей.

* `yarn build` — сборка библиотеки.

* `yarn lint:js` — проверка стиля кода.

### Maintenance toolchain

Use Node 22.22.1+ or Node 24 and Yarn Classic 1.22.22. Run `yarn install --frozen-lockfile --ignore-scripts`, then `yarn run check`. Lint is read-only; `yarn lint:fix` is the explicit opt-in fixer. The browser regression uses `yarn playwright install chromium` followed by `yarn test:browser` and only visits an intercepted synthetic test origin.

The root library keeps its Bridge 2 / VKUI 5 peer ranges and its existing API. Development fixtures pin compatible React 18, Bridge 2 and VKUI 5 versions. The independent example applications and their lockfiles are unchanged and have not been certified by these root-library checks.

ESLint stays on 9 because the current React ESLint plugin does not declare ESLint 10 support. TypeScript stays on 6.0 because typescript-eslint declares a compiler peer range below 6.1. A newer major for either must be migrated and tested as a compatible toolchain, not installed with peer checks disabled. The obsolete shared VK ESLint 3 configuration is replaced by explicit flat TypeScript/React rules. Yarn remains Classic to preserve the existing lockfile format.

The isolated path-parameter tests can also run without dependencies on Node 24: `node --test tests/params.test.ts`. SSR tests verify importing the public entry without browser globals; creating a browser router still requires a browser. Browser navigation tests do not replace real VK client checks for host gestures or Bridge capabilities.

`yarn run check` (including the `run` keyword) invokes the repository script;
`yarn check` is Yarn Classic's unrelated built-in integrity command. The package
smoke packs the actual distribution and imports a bundled consumer without DOM
globals. Browser CI also checks forwarded link refs/render callbacks and repeated
throttle toggles. The root toolchain retains legacy public generic types (`any`,
`Object`, `{}`) rather than narrowing the declared consumer API during lint migration.
Two pre-existing effect-dependency warnings in RouterProvider/useLinkClickHandler
remain visible; the check does not claim these architectural effects were redesigned.
