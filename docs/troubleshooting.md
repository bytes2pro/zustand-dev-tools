# Troubleshooting

## Build fails: missing peer dependency

Install peer deps in your consumer app. In this repo, peer deps are not bundled.

## Type declarations missing

Ensure `d.ts` generation is enabled (tsup `--dts` or `tsc --emitDeclarationOnly`).

## Next.js client/server errors

Only mark files that use browser APIs with `'use client'`. Keep server-safe files separate.

## Vue or Solid bundling issues

Verify `external` configuration excludes framework runtime from bundles and types are emitted.

## E404 when publishing scoped packages

If CI logs show `E404 Not Found - PUT https://registry.npmjs.org/@scope%2fpackage - Not found`:

- Ensure your npm scope is correct and consistent across packages and docs:

```bash
pnpm set-scope -- --scope @your-scope
```

- Verify `NPM_TOKEN` is set in repo secrets and has publish rights to `@your-scope`.
- For public scoped packages, ensure `publishConfig.access: "public"` in each `package.json`.

> Please raise an issue if you think we missed anything important in this template.
