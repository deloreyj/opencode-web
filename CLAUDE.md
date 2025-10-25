# CLAUDE.md - LLM Context for Repository

## Stack
React 19 + Vite + Hono + Cloudflare Workers + Tailwind v4 + shadcn/ui + Drizzle ORM + Vitest + Storybook 9

## Architecture

**Split TypeScript contexts:**
1. `src/react-app/` - React client
2. `src/worker/` - Cloudflare Workers (Hono)
3. `src/components/`, `src/lib/`, `src/hooks/` - Shared UI/utils

**tsconfig files:**
- `tsconfig.app.json` - includes: `src/react-app`, `src/components`, `src/hooks`, `src/lib`, `src/stories`
- `tsconfig.worker.json` - includes: `src/worker`
- Add new `src/*` dirs to `tsconfig.app.json` `include` array

**Paths:** All imports use `@/*` → `src/`

**Build output:**
- `dist/client/` - React static assets
- `dist/worker/` - Worker code
- Worker serves React + handles `/api/*`

## Commands

```bash
pnpm dev           # localhost:5173
pnpm storybook     # localhost:6006
pnpm check         # typecheck + dry-run deploy
pnpm test          # all 3 test suites
pnpm test:worker   # vitest.worker.config.ts
pnpm test:ui       # vitest.ui.config.ts
pnpm test:storybook # vitest.storybook.config.ts
pnpm build && pnpm deploy  # production deploy
```

## Storybook - ALWAYS create stories for UI components

**Template:**
```typescript
import type { Meta, StoryObj } from "@storybook/react-vite";
import { MyComponent } from "@/components/MyComponent";

const meta = {
  title: "Category/MyComponent",
  component: MyComponent,
  parameters: { layout: "centered" }, // or "fullscreen"
  tags: ["autodocs"],
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
```

**Post-modification:** Call `mcp__storybook-mcp__get_story_urls` to provide URLs

## Component Development Workflow

1. Check existing components/stories
2. If not found, use `search_items_in_registries` (shadcn MCP)
3. If found: `pnpm dlx shadcn@latest add <name>` + create stories
4. Always: Update stories, add tests, run `pnpm test:storybook` + `pnpm test:ui`, call `get_story_urls`

**shadcn install:** `pnpm dlx shadcn@latest add <component>`
**Layouts:** `src/components/layouts/` - prop-driven, generic
**Styling:** Tailwind v4, dark mode via `theme-provider.tsx`, use `cn()` from `@/lib/utils`

## API Development

**MCP servers:**
- `cloudflare-bindings` - manage CF resources
- `cloudflare-docs` - search docs

**Workflow:** Search CF docs first → create resource via MCP → update `wrangler.jsonc`

**Hono example:**
```typescript
import { Hono } from "hono";
const app = new Hono<{ Bindings: Env }>();
app.get("/api/endpoint", (c) => c.json({ data: "response" }));
```

**Types:** `src/types/` shared between frontend/backend

**Mock data generators:**
- Create strongly-typed generator functions for all data types
- Use faker.js for realistic mock data
- Place generators in `src/types/` alongside type definitions
- Support partial overrides for test flexibility
- Update generators whenever schemas/types change

Example:
```typescript
import { faker } from "@faker-js/faker";

export const generateUser = (overrides: Partial<User> = {}): User => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  createdAt: faker.date.past().toISOString(),
  ...overrides,
});
```

## Data Storage

**Choosing a data store:**

**Durable Objects (preferred for scoped data):**
- Use when data belongs to a clear container scope (workspace, user, account, org, etc.)
- Zero-latency (co-located compute/storage)
- Strongly consistent, transactional SQLite
- PITR (30-day backup)
- DB-per-container patterns via `idFromName()`
- Same pricing as D1
- Limitations: less observability, more complex management

**D1 (app-level relational data):**
- Use for global relational data that doesn't fit a container scope
- Globally replicated SQLite
- Works with Drizzle ORM
- Limitations: 10 GB per database, requires sharding to scale beyond

**KV (simple key-value storage):**
- Use for config data, heavy read/low write patterns, eventual consistency acceptable
- No schema, JSON mode available
- Limitations: cannot query, only list keys or read single key

**Durable Objects + Drizzle ORM Setup:**

1. Install: `pnpm add drizzle-orm && pnpm add -D drizzle-kit`

2. `wrangler.jsonc`:
```jsonc
{
  "durable_objects": {
    "bindings": [{ "name": "MY_DO", "class_name": "MyDO", "script_name": "worker-app-boilerplate" }]
  },
  "migrations": [{ "tag": "v1", "new_sqlite_classes": ["MyDO"] }]
}
```

3. Schema `src/db/schema.ts`:
```typescript
import { sqliteTable, int, text } from "drizzle-orm/sqlite-core";
export const users = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  email: text().notNull().unique(),
});
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

4. `drizzle.config.ts`:
```typescript
import { defineConfig } from "drizzle-kit";
export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "sqlite",
  driver: "durable-sqlite",
});
```

5. DO class with RPC methods (NOT fetch):
```typescript
import { DurableObject } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/durable-sqlite";
import { migrate } from "drizzle-orm/durable-sqlite/migrator";
import * as schema from "@/db/schema";
import migrations from "../../../drizzle/migrations";

export class MyDO extends DurableObject {
  private db;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.db = drizzle(ctx.storage, { schema, logger: false });
    ctx.blockConcurrencyWhile(async () => await migrate(this.db, migrations));
  }

  async createUser(data: NewUser): Promise<User> {
    const [user] = await this.db.insert(schema.users).values(data).returning();
    return user;
  }

  async getUser(id: number): Promise<User | undefined> {
    return await this.db.query.users.findFirst({ where: (u, { eq }) => eq(u.id, id) });
  }
}
```

6. Migrations: `pnpm drizzle-kit generate` (auto-applied in constructor)

7. Type sharing: Export from `src/db/schema.ts`, import in both contexts
   - Add `src/db` to `tsconfig.app.json` `include`

8. Worker access via RPC:
```typescript
import { Hono } from "hono";
const app = new Hono<{ Bindings: Env }>();

app.post("/api/users", async (c) => {
  const stub = c.env.MY_DO.get(c.env.MY_DO.idFromName("shared-db"));
  const user = await stub.createUser(await c.req.json());
  return c.json({ user });
});

app.get("/api/users/:id", async (c) => {
  const stub = c.env.MY_DO.get(c.env.MY_DO.idFromName("shared-db"));
  const user = await stub.getUser(parseInt(c.req.param("id")));
  return user ? c.json({ user }) : c.json({ error: "Not found" }, 404);
});

// DB-per-user: idFromName(`user:${userId}`)
```

**Rules:**
- Use RPC methods (public async), NOT fetch handlers
- Bundle DB ops in single RPC call
- Use `ctx.blockConcurrencyWhile()` for migrations
- Schema in `src/db/schema.ts`
- Types via `$inferSelect` / `$inferInsert`
- Reuse stubs for E-order semantics

## Config

**wrangler.jsonc:**
- `main: src/worker/index.ts`
- `assets.directory: dist/client`
- No top-level env - scope commands to `staging` or `production`
- Verify production changes with user

**Package manager:** pnpm
**Barrel files:** Avoid
**File format:** Prefer `.jsonc` for comments
**Updates:** Maintain CLAUDE.md + AGENTS.md on pattern changes
