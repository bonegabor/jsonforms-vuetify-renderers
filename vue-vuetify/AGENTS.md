# Repository Guidelines

## Project Structure & Module Organization
Source renderers live in `src`, grouped by feature areas such as `src/controls`, `src/array`, `src/layouts`, and `src/additional`. Shared helpers sit in `src/util`, while global styles and theme assets are under `src/styles`. Entry points `src/index.ts` and `src/renderers.ts` define the public surface and feed the Rollup build that publishes bundles to `lib/`. Unit tests mirror the renderer layout under `tests/unit/<area>`, and `tests/index.ts` registers renderers for specs.

## Build, Test, and Development Commands
- `npm run build` – runs the Rollup pipeline (ESM/CJS/CSS) after cleaning `lib/`.
- `npm run watch` – Rollup watch mode; keep it active when iterating on renderers to catch bundling issues quickly.
- `npm run test` – executes Jest via `vue-cli-service test:unit`; pass `--watch` or `--runInBand` for focused runs (e.g., `npm run test -- BooleanControlRenderer.spec.ts`).

## Coding Style & Naming Conventions
Follow the ESLint rules in `.eslintrc.js` (`plugin:vue/essential`, TypeScript, Prettier). Use two-space indentation, single quotes, and avoid semantically unnecessary comments. Name Vue components in PascalCase, helpers in camelCase, and renderer classes with the `Renderer` suffix. Run `npx prettier --write "src/**/*.ts"` (or an editor integration) before committing.

## Testing Guidelines
Specs use Jest with Vue Test Utils and live next to the subject renderer (e.g., `tests/unit/controls/BooleanControlRenderer.spec.ts`). Match `describe` names to the renderer, assert JSON Forms bindings (schema, uischema, data), and prefer focused DOM queries or snapshots over broad matches. Run targeted tests before pushing to keep suites fast.

## Commit & Pull Request Guidelines
Use Conventional Commits (`feat`, `fix`, `chore`, etc.) with succinct scopes, e.g., `fix: align radio control`. Each PR should summarize the renderer or utility touched, link related issues, describe UI impact, and include screenshots or schema snippets when visual output changes. Confirm `npm run build` and `npm run test` succeed locally before requesting review.

## Additional Tips
Leverage `useVuetifyControl` and helpers in `src/util` instead of re-implementing control glue. Shared assets belong under `src/styles`, and any new renderer should be exported through `src/renderers.ts` so the Rollup bundles stay in sync.
