# Full-Stack Worker App Boilerplate

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/deloreyj/worker-app-boilerplate/tree/main)

## 🚀 Technology Stack

### Frontend
- [**React 19**](https://react.dev/) - Modern UI library with cutting-edge features
- [**Vite**](https://vite.dev/) - Lightning-fast build tooling and dev server
- [**Tailwind CSS v4**](https://tailwindcss.com/) - Utility-first CSS framework
- [**shadcn/ui**](https://ui.shadcn.com/) - High-quality, accessible component library
- [**Storybook 9**](https://storybook.js.org/) - Component development and documentation

### Backend
- [**Hono**](https://hono.dev/) - Ultralight, modern backend framework
- [**Cloudflare Workers**](https://developers.cloudflare.com/workers/) - Edge computing platform for global deployment

### Testing & Quality
- [**Vitest**](https://vitest.dev/) - Fast unit test framework (3 separate test suites)
- [**Playwright**](https://playwright.dev/) - Reliable end-to-end testing via Storybook
- **TypeScript** - Full type safety across frontend and backend
- **ESLint** - Code quality and consistency

## ✨ Key Features

- 🔥 Hot Module Replacement (HMR) for rapid development
- 🎨 Component-driven development with Storybook
- 📦 Full TypeScript support with shared types
- 🧪 Comprehensive testing: unit, integration, and visual tests
- 🎯 API routes with Hono's elegant routing
- 🔄 Dual-context build system (frontend + backend)
- ⚡ Zero-config deployment to Cloudflare's global network
- 🔎 Built-in observability to monitor your Worker
- 🌓 Dark mode support out of the box
- ♿ Accessible components from shadcn/ui + Radix UI

## 📐 Architecture

This project uses a **dual-context build system** with three separate TypeScript contexts:

1. **React App** (`src/react-app/`) - Client-side React application
2. **Worker** (`src/worker/`) - Cloudflare Workers backend (Hono API)
3. **Shared Code** (`src/components/`, `src/lib/`, `src/hooks/`) - Reusable UI components and utilities

The Worker serves the React app as static assets and handles API routes under `/api/*`.

**Path Aliases**: All imports use `@/*` aliases pointing to `src/`:
```typescript
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
```

For detailed architecture documentation, see [CLAUDE.md](./CLAUDE.md) and [AGENTS.md](./AGENTS.md).

<!-- dash-content-end -->

## Getting Started

### Prerequisites

This project uses **pnpm** as the package manager. Install it globally if you haven't already:

```bash
npm install -g pnpm
```

### Installation

Install dependencies:

```bash
pnpm install
```

## Development

### Primary Workflows

Start the main development server (frontend + backend):

```bash
pnpm dev
```

Your application will be available at [http://localhost:5173](http://localhost:5173).

Start Storybook for component development:

```bash
pnpm storybook
```

Storybook will be available at [http://localhost:6006](http://localhost:6006).

### Code Quality

Type check your code:

```bash
pnpm check
```

Lint your code:

```bash
pnpm lint
```

### Testing

Run all tests (builds first, then runs all 3 test suites):

```bash
pnpm test
```

Run individual test suites:

```bash
pnpm test:worker     # Backend/API tests
pnpm test:ui         # React component unit tests
pnpm test:storybook  # Storybook visual/interaction tests
```

## Component Development

This project follows a systematic component-driven development workflow:

1. **Check existing components** - Review component files and Storybook stories
2. **Compose or extend** - Build from existing components or add variants
3. **Search shadcn registry** - Find pre-built components if needed
4. **Add tests and stories** - Always update Storybook and add tests

Add new shadcn/ui components:

```bash
pnpm dlx shadcn@latest add <component-name>
```

Components are installed to `src/components/ui/` and can be customized directly.

For detailed workflow, see [CLAUDE.md](./CLAUDE.md#component-development).

## Production

Build your project for production:

```bash
pnpm build
```

Preview your build locally:

```bash
pnpm preview
```

Deploy to Cloudflare Workers:

```bash
pnpm deploy
```

Monitor your deployed worker:

```bash
npx wrangler tail
```

## Project Documentation

- [CLAUDE.md](./CLAUDE.md) - Detailed guide for Claude Code AI assistant
- [AGENTS.md](./AGENTS.md) - General AI coding assistant guide

## Additional Resources

### Framework & Libraries
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vite.dev/guide/)
- [Hono Documentation](https://hono.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Storybook Documentation](https://storybook.js.org/docs)
- [Vitest Documentation](https://vitest.dev/)

### Cloudflare Platform
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Workers Assets Documentation](https://developers.cloudflare.com/workers/static-assets/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)

## Environment Configuration

This project uses environment-specific configurations in `wrangler.jsonc`:

- **Staging**: `pnpm deploy` (defaults to staging environment)
- **Production**: Requires explicit configuration and verification

All Wrangler commands should be scoped to an environment (typically `staging`).

## Contributing

When contributing to this project:

1. Follow the component development workflow outlined in [CLAUDE.md](./CLAUDE.md)
2. Always add Storybook stories for UI components
3. Write tests for new features
4. Run `pnpm check` and `pnpm lint` before committing
5. Ensure all tests pass with `pnpm test`

## License

See [LICENSE](./LICENSE) file for details.
