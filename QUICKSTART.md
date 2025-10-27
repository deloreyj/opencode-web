# Quick Start Guide

Get up and running with OpenCode Web in 5 minutes.

## Prerequisites

- Node.js 18+ and pnpm installed
- OpenCode CLI installed: `curl -fsSL https://opencode.ai/install.sh | sh`

## Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment template
cp .env.example .env.local

# 3. Authenticate with AI provider
opencode auth login https://opencode.cloudflare.dev

# 4. Start development servers
pnpm dev
```

That's it! The app is now running at http://localhost:5173

## What Just Happened?

`pnpm dev` starts two servers:

1. **OpenCode Server** (http://127.0.0.1:4096)
   - Headless AI coding agent
   - Exposes REST API and WebSocket endpoints
   - Handles LLM interactions

2. **Vite Dev Server** (http://localhost:5173)
   - React application with Hot Module Replacement
   - Connects to OpenCode server via SDK
   - Uses TanStack Query for state management

## Quick Test

Add this to any component to verify the connection:

```tsx
import { OpencodeStatus } from "@/components/opencode-status";

function MyComponent() {
  return <OpencodeStatus />;
}
```

You should see "OpenCode connected ✓" if everything is working.

## Available Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all servers (recommended) |
| `pnpm dev:vite` | Start only Vite |
| `pnpm dev:opencode` | Start only OpenCode server |
| `pnpm storybook` | View UI component library |
| `pnpm test` | Run all tests |
| `pnpm build:staging` | Build for staging |
| `pnpm deploy` | Deploy to Cloudflare |

## Project Structure

```
src/
├── react-app/              # React app entry point
├── components/
│   ├── ai-elements/        # Vercel AI SDK components (chatbot UI)
│   ├── ui/                 # shadcn/ui components
│   └── opencode-status.tsx # Connection status indicator
├── hooks/
│   └── use-opencode.ts     # React hooks for OpenCode API
└── lib/
    └── opencode-client.ts  # OpenCode SDK client singleton
```

## Example Usage

### List Sessions

```tsx
import { useSessions } from "@/hooks/use-opencode";

function SessionList() {
  const { data: sessions, isLoading } = useSessions();

  if (isLoading) return <div>Loading...</div>;

  return (
    <ul>
      {sessions?.map((session) => (
        <li key={session.id}>{session.title}</li>
      ))}
    </ul>
  );
}
```

### Create Session and Send Message

```tsx
import { useCreateSession, useSendMessage } from "@/hooks/use-opencode";

function ChatDemo() {
  const createSession = useCreateSession();
  const sendMessage = useSendMessage();

  const handleChat = async () => {
    // Create a session
    const session = await createSession.mutateAsync({
      title: "My Conversation"
    });

    // Send a message
    await sendMessage.mutateAsync({
      sessionId: session.id,
      message: {
        model: {
          providerID: "anthropic",
          modelID: "claude-3-5-sonnet-20241022"
        },
        parts: [{ type: "text", text: "Hello, OpenCode!" }]
      }
    });
  };

  return <button onClick={handleChat}>Start Chat</button>;
}
```

## Next Steps

- 📖 Read [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed setup
- 🎨 Explore [Storybook](http://localhost:6006) - `pnpm storybook`
- 🏗️ Review [REQUIREMENTS.md](./REQUIREMENTS.md) for architecture
- 📚 Check [OpenCode docs](https://opencode.ai/docs/) for API reference

## Troubleshooting

**OpenCode server won't start?**
```bash
# Check if installed
opencode --version

# Check if port is in use
lsof -i :4096
```

**Can't connect to server?**
```bash
# Verify server is running
curl http://127.0.0.1:4096/doc

# Check environment variable
cat .env.local | grep OPENCODE_URL
```

**Need help?**
- Check [DEVELOPMENT.md](./DEVELOPMENT.md) troubleshooting section
- View OpenCode server logs in your terminal
- Open browser DevTools to check network requests

## Production Deployment

For deploying to Cloudflare Workers + Containers:

```bash
# Build for production
pnpm build:production

# Deploy (requires Cloudflare account)
pnpm deploy
```

See [REQUIREMENTS.md](./REQUIREMENTS.md) for production architecture details.
