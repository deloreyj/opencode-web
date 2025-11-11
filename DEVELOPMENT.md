# Development Setup

This guide explains how to set up your local development environment for OpenCode Web.

## Prerequisites

1. **Node.js 18+** - [Download](https://nodejs.org/)
2. **pnpm** - Install with `npm install -g pnpm`
3. **OpenCode CLI** - Install with:
   ```bash
   curl -fsSL https://opencode.ai/install.sh | sh
   ```
   Or using npm:
   ```bash
   npm install -g @opencode-ai/cli
   ```

## Initial Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <your-repo>
   cd opencode-web
   pnpm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and configure (optional):
   - `VITE_OPENCODE_URL` - OpenCode server URL (default: http://127.0.0.1:4096)
   - `OPENCODE_PORT` - Port for OpenCode server (default: 4096)
   - `OPENCODE_HOSTNAME` - Hostname for OpenCode server (default: 127.0.0.1)
   - Optional: AI provider API keys (or use `opencode auth login`)

3. **Authenticate with AI providers:**
   ```bash
   opencode auth login
   ```
   This will prompt you to configure your preferred AI provider (Anthropic, OpenAI, etc.)

## Running the Development Environment

Start both OpenCode server and Vite dev server together:

```bash
pnpm dev
```

This starts:
- OpenCode server on http://127.0.0.1:4096
- Vite dev server on http://localhost:5173

Press `Ctrl+C` to stop both servers.

## Development URLs

- **React App**: http://localhost:5173
- **OpenCode API**: http://127.0.0.1:4096
- **OpenCode API Docs**: http://127.0.0.1:4096/doc
- **Storybook**: http://localhost:6006 (run with `pnpm storybook`)

## Project Structure

```
opencode-web/
├── src/
│   ├── react-app/          # React application entry
│   ├── worker/             # Cloudflare Worker (Hono API)
│   ├── components/         # Shared UI components
│   │   ├── ai-elements/    # Vercel AI SDK components
│   │   └── ui/             # shadcn/ui components
│   ├── hooks/              # React hooks
│   │   └── use-opencode.ts # OpenCode integration hooks
│   ├── lib/                # Utilities
│   │   └── opencode-client.ts # OpenCode SDK client
│   └── stories/            # Storybook stories
├── scripts/
│   └── dev-all.mjs         # Combined dev server script
└── .env.local              # Local environment variables
```

## Available Scripts

### Development
- `pnpm dev` - Start all development servers
- `pnpm storybook` - Start Storybook

### Testing
- `pnpm test` - Run all tests
- `pnpm test:ui` - Run UI component tests
- `pnpm test:worker` - Run Worker tests
- `pnpm test:storybook` - Run Storybook tests

### Building
- `pnpm build:staging` - Build for staging
- `pnpm build:production` - Build for production
- `pnpm preview` - Preview production build
- `pnpm check` - Type check and dry-run deploy

### Deployment
- `pnpm deploy` - Deploy to Cloudflare

## Using the OpenCode SDK

### Client Setup

The OpenCode client is configured in `src/lib/opencode-client.ts`:

```typescript
import { opencodeClient } from "@/lib/opencode-client";

// Check if server is available
const info = await opencodeClient.app.get();
```

### React Hooks

Use the provided hooks in `src/hooks/use-opencode.ts`:

```typescript
import { useSessions, useCreateSession, useSendMessage } from "@/hooks/use-opencode";

function MyComponent() {
  // List all sessions
  const { data: sessions, isLoading } = useSessions();

  // Create a new session
  const createSession = useCreateSession();
  const handleCreate = () => {
    createSession.mutate({ title: "My Session" });
  };

  // Send a message
  const sendMessage = useSendMessage();
  const handleSend = () => {
    sendMessage.mutate({
      sessionId: "session-id",
      message: {
        model: {
          providerID: "anthropic",
          modelID: "claude-3-5-sonnet-20241022"
        },
        parts: [{ type: "text", text: "Hello!" }]
      }
    });
  };

  return <div>{/* Your UI */}</div>;
}
```

### TanStack Query Integration

All OpenCode hooks use TanStack Query for:
- Automatic caching
- Background refetching
- Optimistic updates
- Error handling

Query keys are organized in `opencodeKeys`:

```typescript
import { opencodeKeys } from "@/hooks/use-opencode";

// Invalidate specific queries
queryClient.invalidateQueries({
  queryKey: opencodeKeys.sessions()
});
```

## Troubleshooting

### OpenCode server won't start

1. Check if OpenCode is installed:
   ```bash
   opencode --version
   ```

2. Check if port 4096 is already in use:
   ```bash
   lsof -i :4096
   ```

3. Try a different port:
   ```bash
   OPENCODE_PORT=4097 pnpm dev:opencode
   ```
   Update `.env.local` accordingly.

### Can't connect to OpenCode server

1. Check server is running:
   ```bash
   curl http://127.0.0.1:4096/doc
   ```

2. Check `.env.local` has correct URL:
   ```bash
   VITE_OPENCODE_URL=http://127.0.0.1:4096
   ```

3. Check browser console for errors

### Type errors with OpenCode SDK

The SDK types are generated from the OpenAPI spec. If you get type errors:

1. Make sure you're using the latest SDK version:
   ```bash
   pnpm update @opencode-ai/sdk
   ```

2. Import types from the client:
   ```typescript
   import type { Session, Message } from "@/lib/opencode-client";
   ```

## Next Steps

- Read [REQUIREMENTS.md](./REQUIREMENTS.md) for the full architecture
- Explore [Storybook](http://localhost:6006) for UI components
- Check [OpenCode docs](https://opencode.ai/docs/) for server API details
- Review example chatbot in `src/stories/ai-elements/Chatbot.stories.tsx`

## Production Deployment

For production deployment to Cloudflare:

1. The OpenCode server will run in a Cloudflare Container
2. The Worker will proxy requests to the container
3. Environment variables are managed through `wrangler.jsonc`

See [REQUIREMENTS.md](./REQUIREMENTS.md) for the full production architecture.
