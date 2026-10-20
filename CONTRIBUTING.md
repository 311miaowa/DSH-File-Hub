# Contributing

## Requirements

- Node.js 22 or newer
- A DeepSeek Harness Web profile for manual UI verification

## Checks

The plugin has no build step and no third-party runtime dependencies.

```text
npm run check
npm test
```

`npm run check` syntax-checks the Host and browser bundles. `npm test` runs the
pure-function tests and the Host integration tests.

## Development

- `index.js`: Host index, authenticated routes, and the `file_hub` tool.
- `core.js`: pure path, extraction, folding, fingerprint, and search helpers.
- `client.js`: Web panel, page-index UI, and user actions.
- `cordis.patch.yml`: bundle entry.

After changing `client.js`, refresh the Harness page with `Ctrl+F5`; there is no
watcher or build artifact in this repository.

Please keep the security properties intact:

- no arbitrary path API;
- no shell construction from file names or user text;
- path containment and symlink checks before opening or reading a target;
- only authenticated Host/Origin-checked routes;
- bounded request bodies, file reads, and rendered excerpts.

## Pull requests

Keep changes focused, add or update tests for behavior changes, and describe
the verification you performed. By contributing, you agree that your
contribution is licensed under the repository's MIT License.
