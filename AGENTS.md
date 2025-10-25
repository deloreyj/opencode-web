# AGENTS.md - AI Coding Assistant Context

## Stack
React 19, Vite, Hono, CF Workers, Tailwind v4, shadcn/ui, Drizzle ORM, Vitest, Storybook 9

## Architecture

**Split TS contexts:**
- `src/react-app/` - client
- `src/worker/` - Worker/Hono
- `src/components/`, `src/lib/`, `src/hooks/` - shared

**tsconfigs:**
- `tsconfig.app.json` includes: `src/react-app`, `src/components`, `src/hooks`, `src/lib`, `src/stories`
- `tsconfig.worker.json` includes: `src/worker`
- Add new `src/*` to `tsconfig.app.json` `include`

**Paths:** `@/*` → `src/`
**Output:** `dist/client/` (React), `dist/worker/` (Worker serves React + `/api/*`)

## Commands

```bash
pnpm dev           # :5173
pnpm storybook     # :6006
pnpm check
pnpm test          # all suites
pnpm test:worker
pnpm test:ui
pnpm test:storybook
pnpm build && pnpm deploy
```

## Storybook - Always create for UI

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

## Components

1. Check existing
2. Search shadcn: `pnpm dlx shadcn@latest add <name>`
3. Create stories, tests, run `pnpm test:storybook` + `pnpm test:ui`

**Layouts:** `src/components/layouts/` - prop-driven
**Styling:** Tailwind v4, `cn()` from `@/lib/utils`

## API

**Hono:**
```typescript
import { Hono } from "hono";
const app = new Hono<{ Bindings: Env }>();
app.get("/api/endpoint", (c) => c.json({ data }));
```

**Types:** `src/types/` shared

**Mock generators:**
- Create for all types using faker.js
- Place in `src/types/`, support `Partial<T>` overrides
- Update when schemas change

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

**Choose based on data scope:**

**DO (Durable Objects):** Data with container scope (user, workspace, account). Zero latency, consistent, PITR. Limitations: less observability, more complex

**D1:** App-level relational data. Global SQLite. Limitations: 10 GB max, requires sharding

**KV:** Config, heavy read/low write, eventual consistency ok. Limitations: no queries, list/read only

**Typically prefer DO if data belongs to a clear container scope.**

**DO + Drizzle Setup:**

```bash
pnpm add drizzle-orm && pnpm add -D drizzle-kit
```

**wrangler.jsonc:**
```jsonc
{
  "durable_objects": {
    "bindings": [{ "name": "MY_DO", "class_name": "MyDO", "script_name": "worker-app-boilerplate" }]
  },
  "migrations": [{ "tag": "v1", "new_sqlite_classes": ["MyDO"] }]
}
```

**Schema `src/db/schema.ts`:**
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

**drizzle.config.ts:**
```typescript
import { defineConfig } from "drizzle-kit";
export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "sqlite",
  driver: "durable-sqlite",
});
```

**DO with RPC (NOT fetch):**
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
}
```

**Migrations:** `pnpm drizzle-kit generate`

**Types:** Export from `src/db/schema.ts`, add `src/db` to `tsconfig.app.json` `include`

**Worker RPC:**
```typescript
app.post("/api/users", async (c) => {
  const stub = c.env.MY_DO.get(c.env.MY_DO.idFromName("shared-db"));
  return c.json({ user: await stub.createUser(await c.req.json()) });
});

// DB-per-user: idFromName(`user:${userId}`)
```

**Rules:**
- RPC methods (public async), NOT fetch
- Bundle DB ops in single RPC
- `ctx.blockConcurrencyWhile()` for migrations
- Schema: `src/db/schema.ts`
- Types: `$inferSelect` / `$inferInsert`

## Config

**wrangler.jsonc:** `main: src/worker/index.ts`, `assets.directory: dist/client`
No top-level env - scope to `staging`/`production`

**pnpm** only, avoid barrel files, prefer `.jsonc`, update docs on changes
