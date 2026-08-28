# NetGoat PM

Shared kanban for Grok Bot agents and humans. **GitHub issues are the only queue** — there is no parallel database of cards. Humans and agents look at the same issues, labels, and assignees on [`netgoat-xyz/pm`](https://github.com/netgoat-xyz/pm).

## Stack

- Next.js App Router (TypeScript)
- Tailwind CSS + [shadcn/ui](https://ui.shadcn.com) (dark zinc)
- [Auth.js v5](https://authjs.dev) with the GitHub provider (not Clerk)
- Octokit, using the signed-in user's GitHub access token
- Deployable on Vercel

## Board

Four columns, driven by exactly one `status:*` label per issue:

| Column | Label |
| --- | --- |
| Backlog | `status:backlog` |
| In progress | `status:in-progress` |
| Review | `status:review` |
| Done | `status:done` |

Owner labels (zero or more): `agent:swe`, `agent:qa`, `agent:research`, `agent:design`.

Issues with no `status:*` label render in Backlog. The first move (drag or **Move**) stamps the destination column's label. A move **removes every existing `status:*` label, then adds exactly the destination label**. Non-status labels are left untouched.

## Local development

```bash
npm install
cp .env.example .env.local
# fill in values (see below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in with GitHub. Non-members of `GITHUB_ORG` see an access-denied page instead of the board.

```bash
npm test
npm run build
```

Create missing board labels (does not delete GitHub defaults):

```bash
node scripts/ensure-labels.mjs
```

## Environment variables

| Name | Required | Notes |
| --- | --- | --- |
| `AUTH_SECRET` | yes | `npx auth secret` |
| `AUTH_GITHUB_ID` | yes | GitHub OAuth App client ID |
| `AUTH_GITHUB_SECRET` | yes | GitHub OAuth App client secret |
| `AUTH_URL` | yes | Canonical origin, e.g. `http://localhost:3000` or `https://your-app.vercel.app` |
| `GITHUB_ORG` | no | Defaults to `netgoat-xyz`. Board access is gated to this org. |
| `GITHUB_BOARD_REPO` | no | Defaults to `netgoat-xyz/pm`. Issues on this repo are the board. |
| `GITHUB_TOKEN` | no | Fallback for CI / `scripts/ensure-labels.mjs` only. **Not** used for board reads or moves. |

### GitHub OAuth App

1. Create an OAuth App in the `netgoat-xyz` org (or a personal app you trust).
2. Homepage URL: the same value as `AUTH_URL`.
3. Authorization callback URL: `{AUTH_URL}/api/auth/callback/github`.
4. The app requests `repo`, `read:org`, `read:user`, and `user:email` so the signed-in org member can read/write issues and labels on this private repo.

The board mutates GitHub **as the signed-in user**. Do not point a second GitHub mirror at this app.

## Vercel

1. Import `netgoat-xyz/pm` in Vercel.
2. Set the environment variables above for Production / Preview.
3. `AUTH_URL` should be the deployment origin (production domain, or the preview URL if you test a preview).
4. Deploy. Next.js is auto-detected; no extra `vercel.json` is required.

### Deployment Protection

Turn on **Vercel Authentication** (Deployment Protection) in the Vercel project in addition to this app's GitHub org gate:

1. Vercel dashboard → Project → **Settings** → **Deployment Protection**.
2. Enable **Vercel Authentication** (standard protection).
3. Keep the app's org membership check; Deployment Protection is a second lock on preview/production URLs, not a replacement for `GITHUB_ORG`.

## Auth model

- Unauthenticated requests to the board and `/api/issues/*` are redirected or rejected by `proxy.ts`.
- Signed-in users who are not active members of `GITHUB_ORG` get `/denied`, not the board.
- Octokit calls reuse `session.accessToken` from Auth.js. A repo-wide PAT is not the primary path.
