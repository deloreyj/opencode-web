# CLAUDE.md - LLM Context for Repository

## Quick Facts
- Name: **OpenCode Web** – web UI for the OpenCode local coding assistant
- Stack: React 19, Vite 6, Tailwind CSS v4, shadcn/ui, AI Elements, TanStack Query, Motion
- Backend: Hono 4 on Cloudflare Workers with Durable Objects (`Sandbox`), NodeJS compat; the same Worker app runs locally beside the OpenCode CLI and inside the sandbox container for cloud parity
- Tooling: TypeScript 5.8, pnpm, Vitest (worker/ui/storybook configs), Storybook 9, Playwright, eslint flat config
- Path alias: `@/*` → `src/`
- Client bundle served from `dist/client/`, Worker bundle from `dist/worker/`

## Repository Layout
- `src/react-app/` – Vite entry (`main.tsx`), pages (`pages/ChatPage.tsx`), React tests, global styles
- `src/components/` – shared UI (shadcn primitives in `ui/`, AI chat pieces in `ai-elements/`, layouts/blocks)
- `src/hooks/` – typed data fetching, SSE helpers (`use-opencode-events`, `use-streaming-updates`)
- `src/lib/` – pure utilities (message cache helpers, logger, workspace client)
- `src/types/` – shared types + Zod schemas, mock generators expected alongside types
- `src/worker/` – Worker entry (`index.ts`), container/Durable Object orchestration, API utilities
- `stories/` – Storybook stories for each reusable component/layout
- `scripts/` – `dev-all.mjs` (launch OpenCode CLI + git diff helper + Vite), `start-opencode-server.mjs`
- `src/internal-scripts/` – `git-diff-server.js` used during development

## Commands & Dev Workflow
```bash
pnpm install           # dependencies
pnpm dev               # start OpenCode CLI, git diff helper, Vite (port 7777)
pnpm dev:vite          # Vite only (port 7777 per vite.config.ts)
pnpm dev:opencode      # OpenCode CLI only
pnpm storybook         # Storybook on :6006
pnpm lint              # eslint flat config
pnpm check             # tsc + staging build + wrangler dry-run
pnpm test              # build:staging then worker/ui/storybook vitest suites
pnpm test:worker       # Worker tests (Cloudflare pool)
pnpm test:ui           # React unit tests (happy-dom/jsdom)
pnpm test:storybook    # Storybook interaction tests
pnpm build:staging     # staging build (sets CLOUDFLARE_ENV=staging)
pnpm build:production  # production build
pnpm preview           # serve built assets after build:staging
pnpm deploy            # wrangler deploy using wrangler.jsonc
```
- `pnpm dev` requires the `opencode` CLI in PATH; helper script prints install instructions if missing.
- Local dev exposes the git diff helper at `http://127.0.0.1:4097` alongside the Hono Worker proxy and Vite UI.
- Configure Worker ↔ client origins with `VITE_OPENCODE_URL` and `wrangler.jsonc` `vars.OPENCODE_URL`.

## Storybook & Component Expectations
- Every shared UI component/layout must have a Storybook story under `stories/`.
- Use the standard template:
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
- After UI changes run `pnpm test:storybook` and `pnpm test:ui`.
- Use `pnpm dlx shadcn@latest add <component>` for new shadcn primitives; never copy raw packages manually.

## Testing Guidance
- `pnpm test` is expensive because it triggers `pnpm build:staging` first; prefer targeted suites while iterating.
- Worker tests run inside the Cloudflare pool (`@cloudflare/vitest-pool-workers`).
- UI tests rely on `happy-dom`/`jsdom`; Storybook tests target stories under `stories/`.
- Playwright is available for manual smoke tests but not part of the default test command.

## Parallel Development Environments
- **Local dev server** – Runs OpenCode CLI, Hono Worker proxy, git diff helper, and Vite UI directly on the developer machine for rapid iteration.
- **Sandbox container** – Executes the same server stack inside the `Sandbox` Durable Object container image in Cloudflare’s environment so you can validate changes under production-like constraints.
- Typical flow: build and refine locally, then deploy to the sandbox container and confirm identical behavior against the shared Worker APIs.

## Worker, Data & Environment
- Worker entry: `src/worker/index.ts` defines the Hono app that proxies SSE + REST operations for both environments.
- Durable Object `Sandbox` (configured in `wrangler.jsonc`) manages per-workspace sandboxes and references the container image in `Dockerfile.sandbox`.
- Migrations for Durable Objects live in `wrangler.jsonc`. Tag new migrations and keep schema changes in sync with Worker logic.
- Shared types originate in `src/types/`; export `$inferSelect` / `$inferInsert` types from Drizzle schemas when DB tables are added.
- Update both `AGENTS.md` and `CLAUDE.md` whenever you adjust shared workflows, dev commands, or architectural patterns.

## Style & Process Rules
- Use `pnpm` only; avoid barrel files and keep imports explicit.
- Compose Tailwind classes with `cn()` from `@/lib/utils`; keep components prop-driven and theme-aware.
- Prefer `.jsonc` for configs that need comments.
- Do not commit secrets; rely on Wrangler secrets and env-specific `vars`.
- Document any new conventions promptly to keep this file authoritative.
