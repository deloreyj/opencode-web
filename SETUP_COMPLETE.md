# ✅ Setup Complete: OpenCode Web Local Development

Your local development environment for OpenCode Web is now fully configured!

## 🎉 What's Installed

### Core Dependencies
- ✅ **@opencode-ai/sdk** (v0.15.18) - TypeScript SDK for OpenCode server
- ✅ **@tanstack/react-query** (v5.90.5) - Server state management
- ✅ **@ai-sdk/react** (v2.0.80) - Vercel AI SDK React hooks
- ✅ **ai** (v5.0.80) - Vercel AI SDK core
- ✅ **nanoid** - ID generation
- ✅ **zod** - Schema validation

### AI Elements Components (11 components)
All installed in `src/components/ai-elements/`:
- Conversation (with scroll management)
- Message (with avatars)
- PromptInput (with attachments, model selector)
- Response (markdown rendering)
- Actions (copy, retry buttons)
- Sources (collapsible citations)
- Reasoning (AI reasoning display)
- Loader
- Branch (message versions)
- Suggestion (quick suggestions)
- Shimmer (loading effect)

### Storybook Stories (11 stories)
All in `src/stories/ai-elements/`:
- ✅ Conversation.stories.tsx
- ✅ Message.stories.tsx
- ✅ PromptInput.stories.tsx
- ✅ Response.stories.tsx
- ✅ Actions.stories.tsx
- ✅ Sources.stories.tsx
- ✅ Reasoning.stories.tsx
- ✅ Loader.stories.tsx
- ✅ Branch.stories.tsx
- ✅ Suggestion.stories.tsx
- ✅ **Chatbot.stories.tsx** (full working example)

## 🛠️ What's Configured

### Scripts (`scripts/`)
- **start-opencode-server.mjs** - Starts OpenCode server on port 4096
- **dev-all.mjs** - Starts both OpenCode and Vite concurrently

### Package.json Scripts
```json
{
  "dev": "node scripts/dev-all.mjs",           // Start all servers
  "dev:vite": "vite",                          // Start only Vite
  "dev:opencode": "node scripts/start-opencode-server.mjs"  // Start only OpenCode
}
```

### OpenCode Integration (`src/`)
- **lib/opencode-client.ts** - SDK client singleton with type exports
- **hooks/use-opencode.ts** - React hooks for all OpenCode operations:
  - `useServerInfo()` - Get server status
  - `useSessions()` - List sessions
  - `useSession(id)` - Get specific session
  - `useMessages(sessionId)` - Get session messages
  - `useCreateSession()` - Create new session
  - `useSendMessage()` - Send chat message
  - `useDeleteSession()` - Delete session
  - `useOpencodeConfig()` - Get config
  - `useProviders()` - Get AI providers
- **components/opencode-status.tsx** - Connection status indicator

### Environment Configuration
- **.env.local** - Local development settings
- **.env.example** - Template for new developers
- Environment variables:
  - `VITE_OPENCODE_URL` - OpenCode server URL
  - `OPENCODE_PORT` - Server port (4096)
  - `OPENCODE_HOSTNAME` - Server hostname (127.0.0.1)

### TanStack Query Setup
- Configured in `src/react-app/main.tsx`
- Default options:
  - 1 minute stale time
  - 5 minute garbage collection
  - 3 retries
  - No refetch on window focus

### Theme Configuration
- **Cloudflare brand colors** applied in `src/react-app/index.css`
- Colors mapped to shadcn theme:
  - Primary: Cloudflare Orange (#F6821F)
  - Secondary: Light Gray (#f5f5f5)
  - Accent: Light Orange (#FBAD41)
  - Blue: Cloudflare Blue (#0051c3)
- Both light and dark mode configured

## 📁 Project Structure

```
opencode-web/
├── scripts/
│   ├── start-opencode-server.mjs  ← Starts OpenCode server
│   └── dev-all.mjs                ← Starts all servers together
├── src/
│   ├── react-app/
│   │   ├── main.tsx               ← TanStack Query provider
│   │   ├── App.tsx
│   │   └── index.css              ← Cloudflare theme colors
│   ├── components/
│   │   ├── ai-elements/           ← 11 AI UI components
│   │   ├── ui/                    ← shadcn components
│   │   └── opencode-status.tsx    ← Connection indicator
│   ├── hooks/
│   │   └── use-opencode.ts        ← OpenCode React hooks
│   ├── lib/
│   │   └── opencode-client.ts     ← OpenCode SDK client
│   └── stories/
│       └── ai-elements/           ← 11 Storybook stories
├── .env.local                     ← Local config (gitignored)
├── .env.example                   ← Config template
├── QUICKSTART.md                  ← 5-minute setup guide
├── DEVELOPMENT.md                 ← Detailed dev guide
└── REQUIREMENTS.md                ← Architecture documentation
```

## 🚀 How to Run

### Start Everything (Recommended)
```bash
pnpm dev
```
This starts:
- OpenCode server at http://127.0.0.1:4096
- Vite dev server at http://localhost:5173

Press `Ctrl+C` to stop both servers.

### Verify Installation
1. **Check OpenCode server**: http://127.0.0.1:4096/doc
2. **Check React app**: http://localhost:5173
3. **Check Storybook**: `pnpm storybook` → http://localhost:6006

## 🧪 Test the Integration

Add this to any component:

```tsx
import { OpencodeStatus } from "@/components/opencode-status";

function MyComponent() {
  return (
    <div>
      <OpencodeStatus />  {/* Shows connection status */}
    </div>
  );
}
```

Or use the hooks:

```tsx
import { useSessions } from "@/hooks/use-opencode";

function MyComponent() {
  const { data: sessions, isLoading } = useSessions();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {sessions?.map(s => <div key={s.id}>{s.title}</div>)}
    </div>
  );
}
```

## 📚 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Get running in 5 minutes
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Detailed development guide
- **[REQUIREMENTS.md](./REQUIREMENTS.md)** - Full architecture & design
- **[OpenCode Docs](https://opencode.ai/docs/)** - Official OpenCode documentation

## 🎨 View the UI Components

Start Storybook to see all components:

```bash
pnpm storybook
```

Then navigate to:
- **AI Elements** section to see all 11 components
- **Chatbot Example** to see the full integration

## ⚡ Key Features

✅ **Type-safe SDK** - Full TypeScript support with auto-generated types
✅ **React Hooks** - Easy-to-use hooks for all OpenCode operations
✅ **TanStack Query** - Automatic caching, refetching, and state management
✅ **Storybook** - Visual component development and testing
✅ **Cloudflare Branding** - Orange/blue theme throughout
✅ **Hot Module Replacement** - Instant updates during development
✅ **Concurrent Servers** - Run OpenCode + Vite together seamlessly

## 🔧 Common Commands

```bash
# Development
pnpm dev                # Start all servers
pnpm dev:vite          # Start only Vite
pnpm dev:opencode      # Start only OpenCode
pnpm storybook         # View UI components

# Testing
pnpm test              # Run all tests
pnpm test:ui           # UI tests
pnpm test:worker       # Worker tests

# Building
pnpm build:staging     # Build for staging
pnpm build:production  # Build for production
pnpm deploy            # Deploy to Cloudflare
```

## 🐛 Troubleshooting

**OpenCode won't start?**
```bash
opencode --version     # Check installation
lsof -i :4096         # Check if port is in use
```

**Can't connect?**
```bash
curl http://127.0.0.1:4096/doc  # Test server
cat .env.local | grep OPENCODE  # Check config
```

See [DEVELOPMENT.md](./DEVELOPMENT.md) for more troubleshooting.

## ✨ Next Steps

1. **Explore Storybook** - `pnpm storybook` to see all UI components
2. **Test the hooks** - Add `<OpencodeStatus />` to your app
3. **Read the docs** - Check out [DEVELOPMENT.md](./DEVELOPMENT.md)
4. **Build features** - Use the chatbot example as a starting point
5. **Deploy** - When ready, follow [REQUIREMENTS.md](./REQUIREMENTS.md) for production

## 🎯 Ready to Build!

Everything is set up. Run `pnpm dev` and start building your OpenCode Web application!

For questions or issues, refer to:
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Detailed documentation
- [OpenCode Docs](https://opencode.ai/docs/) - Official API reference
- The Storybook examples at http://localhost:6006
