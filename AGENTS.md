# AGENTS.md - AI Coding Assistant Context

## Stack
- React 19 + Vite 6 with Tailwind CSS v4, shadcn/ui, AI Elements, TanStack Query, Motion
- Cloudflare Workers running Hono 4 with `nodejs_compat` enabled
- Durable Objects (`Sandbox` class) backed by the container image in `Dockerfile.sandbox`
- TypeScript 5.8 across React + Worker contexts, Vitest 3.2, Storybook 9, Playwright UI smoke tests
- pnpm workspace (single package) – no npm/yarn

## Project Purpose
OpenCode Web is the chat UI for the OpenCode local coding assistant. The Worker serves the client bundle, proxies API requests to whichever OpenCode runtime is active, and coordinates sandboxed container workspaces so teams can iterate locally and verify the same changes in the cloud.

## Architecture
- **Split TS contexts**
  - `src/react-app/` → client entry + routing/pages
  - `src/components/`, `src/hooks/`, `src/lib/`, `src/types/` → shared UI/state/type code
  - `src/worker/` → Cloudflare Worker + Durable Objects (`Sandbox`)
- **Build outputs**
  - `dist/client/` – Vite bundle served as static assets
  - `dist/worker/` – Worker bundle deployed via Wrangler
- **Paths** – `@/*` resolves to `src/`
- **tsconfig**
  - `tsconfig.app.json` includes: `src/react-app`, `src/components`, `src/hooks`, `src/lib`, `src/types`, `src/stories`
  - `tsconfig.worker.json` targets `src/worker`
  - Add any new `src/*` directory to `tsconfig.app.json` `include`

## Key Directories
- `src/components/ai-elements/` – streamed message renderers, artifacts, chain-of-thought, etc.
- `src/components/ui/` + `blocks/` + `layouts/` – shadcn-based primitives and composite pieces
- `src/hooks/` – SSE + query hooks (`use-opencode-events`, `use-streaming-updates`, etc.)
- `src/lib/` – pure helpers (`message-cache-utils`, logging, client wrappers)
- `src/react-app/` – Vite entry (`main.tsx`), chat page, test setup
- `src/worker/` – Worker app (`index.ts`), sandbox RPC bridge, utility helpers
- `stories/` – Storybook stories for every reusable component/layout
- `scripts/` – dev orchestrators (`dev-all.mjs`, `start-opencode-server.mjs`)
- `src/internal-scripts/` – long-running dev helpers (git diff server)

## Commands
```bash
pnpm install          # set up dependencies
pnpm dev              # start OpenCode CLI, git diff server, Vite on :7777
pnpm dev:vite         # Vite dev server only (uses :7777 from vite.config.ts)
pnpm dev:opencode     # just the local OpenCode CLI wrapper
pnpm storybook        # Storybook on :6006
pnpm lint             # eslint flat config
pnpm check            # typecheck + staging bundle + wrangler dry-run
pnpm test             # build:staging + worker/ui/storybook vitest suites
pnpm test:worker      # Vitest worker config
pnpm test:ui          # Vitest React UI config
pnpm test:storybook   # Vitest Storybook stories config
pnpm build:staging    # tsc -b + Vite build with CLOUDFLARE_ENV=staging
pnpm build:production # production build (sets CLOUDFLARE_ENV=production)
pnpm preview          # serve built client after build:staging
pnpm deploy           # wrangler deploy (uses wrangler.jsonc)
```

### Development Notes
- `pnpm dev` requires the `opencode` CLI in `$PATH`; the helper script checks and prints installation guidance.
- The dev script launches the local OpenCode CLI, the git diff helper (`src/internal-scripts/git-diff-server.js`), and the Vite dev server so local development mirrors the sandbox stack.
- Vite listens on port **7777** (see `vite.config.ts`). Update documentation/tests if you change it.
- Configure the client ⇄ Worker connection with `VITE_OPENCODE_URL` and `wrangler.jsonc` `vars.OPENCODE_URL`.

## Development Environments
- **Local dev server** – Runs OpenCode CLI, Worker proxy, and Vite on the developer workstation for rapid iteration.
- **Sandbox container** – Runs the same Hono Worker + supporting services inside the `Sandbox` Durable Object container image for cloud verification.
- Implement features locally first, then deploy to the sandbox container and confirm parity. Keep server endpoints consistent so both environments can be exercised with the same tooling.

## Components & Storybook
1. Check for existing components/stories before adding new ones.
2. For shadcn primitives run `pnpm dlx shadcn@latest add <component>`.
3. Every shared UI component/layout needs a Storybook story in `stories/`.
4. Story template:
```typescript
import type { Meta, StoryObj } from "@storybook/react-vite";
import { MyComponent } from "@/components/MyComponent";

const meta = {
  title: "Category/MyComponent",
  component: MyComponent,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { args: {} };
```
5. After UI changes run `pnpm test:storybook` and `pnpm test:ui`.

## Testing & Quality
- `pnpm test` builds the app (staging env) before executing the three Vitest configs—prefer targeted `pnpm test:<suite>` during iteration.
- UI tests use `happy-dom`/`jsdom`; Worker tests run in Cloudflare Workers pool via `@cloudflare/vitest-pool-workers`.
- Playwright is available for browser automation but not required by default.
- Lint with `pnpm lint`. Fix warnings before submitting patches.

## API & Data
- Worker entry: `src/worker/index.ts` builds a Hono app that proxies OpenCode SSE + REST for both local and sandbox environments.
- Durable Object: `src/worker/container-worker.ts` + `Sandbox` class coordinate sandboxed workspaces and long-lived sessions.
- Wrangler configuration (`wrangler.jsonc`) binds the `SANDBOX` DO, container image, and environment variables (`OPENCODE_URL`, `SANDBOX_HOSTNAME`). Update migrations when adding new DO classes.
- Shared types live under `src/types/`; generate mock data alongside types using `@faker-js/faker` with override support.
- Keep RPC-style methods on DO classes; do not expose `fetch` handlers directly.

## Style & Process
- Use `cn()` from `@/lib/utils` for Tailwind class composition; keep components prop-driven.
- Avoid barrel files; import from explicit paths.
- Prefer `.jsonc` configs when comments are needed.
- Never commit secrets—use Wrangler secrets or environment-specific `vars`.
- When you introduce new patterns or modify shared workflows, update **both** `AGENTS.md` and `CLAUDE.md` accordingly.
