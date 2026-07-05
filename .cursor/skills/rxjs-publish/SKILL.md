---
name: rxjs-publish
description: >-
  Run the standard RxJS release (version bump, changelog, GitHub release) and
  publish packages to any npm registry. NPM_CONFIG_REGISTRY selects the target
  (e.g. a local Verdaccio instance); omit it for npmjs via CI. Use when
  releasing, publishing packages, Verdaccio, or cutting a stable version.
---

# RxJS Package Publish

Same flow as upstream: **`yarn release`** bumps versions, writes changelogs, and creates a **GitHub release**. Publishing is a separate step — CI handles npmjs.org; any other registry is selected via `NPM_CONFIG_REGISTRY`. The flow is registry-agnostic; Verdaccio is just one convenient local target for simulating a full release.

**Current focus: stable releases** (`latest` dist-tag, non-prerelease semver).

## Agent workflow

**You run each step.** Do not hand the user a command checklist.

### 1. Prerequisites

- `GH_TOKEN` or `GITHUB_TOKEN` with `repo` scope (required for a real release)
- Clean working tree on the release branch
- For a fork: pass `--gitRemote=origin` (defaults to upstream `ReactiveX/rxjs`)

### 2. Local registry setup (optional — Verdaccio)

If publishing to a local registry instead of waiting for CI/npmjs, use the repo's Verdaccio config ([`verdaccio.yaml`](../../../verdaccio.yaml), URL `http://localhost:4873`).

Check whether it is already running before starting it:

```sh
curl -sf http://localhost:4873/-/ping || echo "not running"
```

If not running, start it **in the background** (do not block on it):

```sh
npx verdaccio@6 --config verdaccio.yaml
```

Wait for the ping endpoint to respond before continuing.

**Auth (non-interactive).** Do not use `npm login` — it prompts and cannot run unattended. Create a user via the registry API and write the token to the gitignored `.npmrc.local`:

```sh
TOKEN=$(curl -sf -XPUT http://localhost:4873/-/user/org.couchdb.user:rxjs-local \
  -H 'content-type: application/json' \
  -d '{"name":"rxjs-local","password":"rxjs-local"}' | node -pe 'JSON.parse(require("fs").readFileSync(0)).token')
echo "//localhost:4873/:_authToken=${TOKEN}" > .npmrc.local
```

Skip user creation if `.npmrc.local` already contains a token for this registry (Verdaccio persists users in `.verdaccio/htpasswd`; re-running the same name/password re-issues a token).

Point npm at that config for the publish steps:

```sh
export NPM_CONFIG_USERCONFIG="$PWD/.npmrc.local"
```

### 3. Release + publish

From repo root (request **network** permission):

```sh
export GH_TOKEN=…                          # or GITHUB_TOKEN
export NPM_CONFIG_REGISTRY=http://localhost:4873   # omit for npmjs-only (CI publishes)
export NPM_CONFIG_TAG=latest               # stable; required when NPM_CONFIG_REGISTRY is set

yarn release --dryRun=false --gitRemote=origin --interactive=false
```

`--interactive=false` skips the changelog editor prompt; without it, `yarn release` opens an editor and an unattended run hangs. Only omit it when the user wants to hand-edit the changelog.

[`scripts/release.js`](../../../scripts/release.js) runs `prepare-packages`, bumps versions, creates the GitHub release, then — when `NPM_CONFIG_REGISTRY` is set — calls [`scripts/publish.js`](../../../scripts/publish.js) to push tarballs to that registry.

For an explicit stable version instead of conventional-commits inference:

```sh
yarn release --dryRun=false --gitRemote=origin --interactive=false --version 8.0.0
```

Dry-run first when unsure:

```sh
yarn release --dryRun=true --gitRemote=origin
```

### 4. npmjs.org (no local registry)

Omit `NPM_CONFIG_REGISTRY`. After `yarn release --dryRun=false`, the GitHub release triggers [`.github/workflows/publish.yml`](../../../.github/workflows/publish.yml), which runs `publish.js` against `https://registry.npmjs.org` with the `latest` tag for stable semver.

### 5. Verify (optional)

Always verify from a **temp directory** — never run `npm install` in the repo root (it corrupts the Yarn workspace):

```sh
cd "$(mktemp -d)"
npm init -y >/dev/null
npm install rxjs@latest --registry="$NPM_CONFIG_REGISTRY"
node -e "require('rxjs').of(1).subscribe(console.log)"
```

## Environment

| Variable                    | Purpose                                                               |
| --------------------------- | --------------------------------------------------------------------- |
| `GH_TOKEN` / `GITHUB_TOKEN` | GitHub API access for release creation                                |
| `NPM_CONFIG_REGISTRY`       | Target registry (e.g. `http://localhost:4873`); omit for npmjs via CI |
| `NPM_CONFIG_TAG`            | Dist-tag for non-CI publishes — use `latest` for stable               |
| `NPM_CONFIG_USERCONFIG`     | Point at `.npmrc.local` so publish auth stays out of `~/.npmrc`       |

CI derives the tag from the GitHub release semver (`latest` for stable, `next` for prerelease).

## Do not

- Skip `yarn release` and publish ad hoc (that bypasses version bump, changelog, and GitHub release — even for local test publishes, simulate the full release)
- Run `npm login` (interactive; use the token setup above)
- Run the verify `npm install` inside the repo
- Commit `.verdaccio/` or `.npmrc.local`

## Reference

- Release: [`scripts/release.js`](../../../scripts/release.js)
- Publish: [`scripts/publish.js`](../../../scripts/publish.js)
- CI: [`.github/workflows/publish.yml`](../../../.github/workflows/publish.yml)
