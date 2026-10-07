# anti-slop provenance

- Source: the `install-anti-slop` skill bundle, `assets/anti-slop`, copied on 2026-10-07 with its `scripts/install.mjs`.
- Upstream repository and commit: unknown. The bundle does not record them.
- Snapshot identity: 38 files. SHA-256 of the sorted per-file `sha256sum` listing (paths relative to the plugin root, taken before this file was added): `6b2fea11c5f0d97919c6c4792659041685d9d858de6b1029ef37bc580ef481d5`. The installed copy matched the bundle exactly.
- Installed plugins: generic `anti-slop` (`index.ts`). The Effect plugin (`effect/`) is copied but not registered, because `web/` does not depend on `effect`.
- Vendored: `vendor/eslint-stylistic` (see its own `UPSTREAM.md` and `LICENSE`).
- Deviations: none.
- Config: `web/.oxlintrc.json`; Oxlint and `@oxlint/plugins` pinned to 1.87.0 in `web/package.json`; decision in ADR-0005 (local docs).
