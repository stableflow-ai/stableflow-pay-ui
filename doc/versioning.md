# Versioning

Public packages share one version. `main` keeps the latest stable version. Prerelease publishes do not leave a prerelease number on `main`.

A package with `"private": true` is not published and stays at `0.0.0`. `@stableflow/pay-widgets` is public and stays on the same version as `@stableflow/pay-ui`. `pnpm release` publishes every package under `packages/` that is not private.

The unpublished placeholder is `0.0.0`.

Until `1.0.0`:

- patch: fixes that do not change the public API
- minor: new components, props, icons, or className slots
- breaking changes also increment minor
- major is not used

## Channels

Run `pnpm release <channel>` from a clean worktree. The script does not push.

| Channel | Version | npm dist-tag | git tag |
| --- | --- | --- | --- |
| `latest` | `x.y.z` | `latest` | `x.y.z` |
| `rc` | `x.y.z-rc-<hash>-<YYYYMMDD>` | `rc` | same as the version |
| `beta` | `x.y.z-beta-<hash>-<YYYYMMDD>` | `beta` | same as the version |
| `experimental` | `0.0.0-experimental-<hash>-<YYYYMMDD>` | `experimental-<hash>-<YYYYMMDD>` | same as the version |

`<hash>` is the last 10 characters of `git rev-parse HEAD`. The date is UTC `YYYYMMDD`. If those 10 characters are all digits, the script prefixes `h` so the prerelease identifier stays valid semver.

`pnpm release latest patch|minor|major` increments the stable core. The first latest release from `0.0.0` is always `0.0.1`.

`pnpm release rc` and `pnpm release beta` use the next patch after the current stable core unless `--base x.y.z` is set.

`experimental` does not bump `x.y.z`. npm rejects a dist-tag that is valid semver, so the dist-tag drops the leading `0.0.0-`. Install an experimental build by its exact version.

For `rc`, `beta`, and `experimental`, the script commits `release: <version>`, tags it, publishes, then commits `chore: restore package version to <stable>`.

`--dry-run` prints the version, dist-tag, and git tag without writing files or publishing.

Publishing requires an npm login that can publish public packages under `@stableflow`.
