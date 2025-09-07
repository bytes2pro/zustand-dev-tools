# CI/CD

Two workflows:

- `ci.yml`: Lints, builds, and tests on PRs and pushes
- `release.yml`: Runs Changesets to create a version PR or publish to npm

## Setup

- Ensure `NPM_TOKEN` is added as a repository secret for publishing
- Node 20 and pnpm 9 are used by default
- If publishing scoped packages, confirm `NPM_TOKEN` has rights to that scope/org

## Caching

- pnpm cache is enabled via `setup-node`
