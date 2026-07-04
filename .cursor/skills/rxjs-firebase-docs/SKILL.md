---
name: rxjs-firebase-docs
description: >-
  Build and deploy the rxjs.dev documentation site to Firebase Hosting using the
  Firebase MCP (`.cursor/mcp.json`). Guides login, project setup, build, deploy, and
  URL verification. Use when the user asks to deploy docs, publish rxjs.dev, set
  up Firebase hosting, preview documentation changes, or verify a docs deployment.
---

# RxJS Firebase Docs Deploy

Use the **Firebase MCP** (`firebase`, configured in [`.cursor/mcp.json`](../../../.cursor/mcp.json)) for auth and environment. **You run each step** — the user only completes Google sign-in when `firebase_login` prompts.

## Agent workflow

### 1. Check environment

Call **`firebase_get_environment`** (MCP server: `firebase`).

Note `Authenticated User`, `Active Project ID`, and `Project Directory`.

### 2. Authenticate (if needed)

If no authenticated user, call **`firebase_login`**. Tell the user:

_"Complete Google sign-in in the browser prompt — I'll continue automatically."_

Re-check with **`firebase_get_environment`** until a user is listed.

### 3. Point MCP at rxjs.dev

Call **`firebase_update_environment`** with:

| Field            | Value                                                           |
| ---------------- | --------------------------------------------------------------- |
| `project_dir`    | Absolute path to `apps/rxjs.dev` (must contain `firebase.json`) |
| `active_project` | User's Firebase project ID                                      |

If `active_project` is unknown:

1. Call **`firebase_list_projects`** and offer matching projects, **or**
2. Ask the user once for their project ID

Persist the choice by writing `apps/rxjs.dev/.firebaserc.local`:

```json
{ "projects": { "default": "<project-id>" } }
```

New project? User creates one in [Firebase Console](https://console.firebase.google.com/) (enable Hosting), or call **`firebase_create_project`**. For first-time Hosting setup, read **`firebase_read_resources`** with `firebase://guides/init/hosting`.

### 4. Build

From repo root (request **network** permission; may take several minutes):

```sh
.cursor/skills/rxjs-firebase-docs/scripts/build.sh
```

`FIREBASE_DOCS_MODE` controls the Angular configuration: `next` (default), `stable`, or `archive`.

### 5. Deploy

rxjs.dev uses **`firebase.preview.json`** (personal/single-site hosting). The MCP **`firebase_deploy`** tool reads `firebase.json` (production multi-site config), so deploy via the skill script instead — it shares MCP/CLI credentials:

```sh
.cursor/skills/rxjs-firebase-docs/scripts/deploy-hosting.sh
```

If **`firebase_deploy`** is used elsewhere, pass `{ "only": "hosting" }` and poll **`firebase_deploy_status`** with the returned `jobId`.

### 6. Verify

Report both URLs from script output:

- `https://<project>.web.app`
- `https://<project>.firebaseapp.com`

Optionally call **`firebase_get_project`** to confirm the active project. Spot-check `/` and one API page.

## Firebase MCP tools

| Tool                          | When                                                                |
| ----------------------------- | ------------------------------------------------------------------- |
| `firebase_get_environment`    | Start of every deploy; verify auth, project, project_dir            |
| `firebase_login`              | No authenticated user                                               |
| `firebase_update_environment` | Set `project_dir` → `apps/rxjs.dev`, set `active_project`           |
| `firebase_list_projects`      | User needs to pick a project                                        |
| `firebase_get_project`        | Confirm active project after setup                                  |
| `firebase_read_resources`     | First-time Hosting setup (`firebase://guides/init/hosting`)         |
| `firebase_deploy`             | Not used for rxjs.dev (wrong config file) — use `deploy-hosting.sh` |
| `firebase_deploy_status`      | Poll async MCP deploy jobs                                          |

## Do not

- Hand the user a manual firebase CLI checklist
- Deploy upstream production `rxjs.dev` / `rxjs-dev` target without explicit request
- Commit `.firebaserc.local` or `FIREBASE_TOKEN`
- Use `firebase.json` for personal deploys — it targets production `stable` hosting

## Reference

- Preview hosting config: [`apps/rxjs.dev/firebase.preview.json`](../../../apps/rxjs.dev/firebase.preview.json)
- Production hosting config: [`apps/rxjs.dev/firebase.json`](../../../apps/rxjs.dev/firebase.json) (CI/upstream only)
