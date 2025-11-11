# OpenCode Web

A modern web interface for [OpenCode](https://opencode.ai) - an AI coding assistant that runs locally. Built with React 19, deployed to Cloudflare Workers edge network.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/deloreyj/opencode-web/tree/main)

## 🎯 What is This?

**OpenCode Web** is a chat-based web UI for interacting with OpenCode, providing:

- 💬 **Real-time streaming responses** via Server-Sent Events (SSE)
- 🔄 **Live message updates** as the AI types
- 🎨 **Rich message rendering** with markdown, code blocks, reasoning, and tool calls
- 📱 **Mobile-first responsive design** with drawer navigation
- 🌓 **Dark mode support** with system preference detection
- 🔌 **Direct connection** to your local OpenCode server

The app connects to OpenCode running on your machine and provides a polished chat interface for code assistance, file editing, and project management.

## 🚀 Technology Stack

### Frontend
- [**React 19**](https://react.dev/) - Modern UI library with cutting-edge features
- [**Vite**](https://vite.dev/) - Lightning-fast build tooling and dev server
- [**TanStack Query**](https://tanstack.com/query) - Powerful data fetching and caching
- [**Tailwind CSS v4**](https://tailwindcss.com/) - Utility-first CSS framework
- [**shadcn/ui**](https://ui.shadcn.com/) - High-quality, accessible component library
- [**AI Elements**](https://www.aielements.com/) - Pre-built AI chat UI components
- [**Storybook 9**](https://storybook.js.org/) - Component development and documentation

### Backend
- [**Hono**](https://hono.dev/) - Ultralight, modern backend framework
- [**Cloudflare Workers**](https://developers.cloudflare.com/workers/) - Edge computing platform for global deployment
- [**OpenCode SDK**](https://opencode.ai) - Official TypeScript SDK for OpenCode API

### Real-time & State Management
- **Server-Sent Events (SSE)** - Real-time message streaming from OpenCode
- **React Query Cache** - In-place message updates for instant UI feedback
- **Type-safe event handling** - Fully typed SSE events from OpenCode SDK

## ✨ Key Features

### Chat Interface
- 💬 **Real-time streaming** - Messages appear as they're generated
- 🔄 **Live updates** - Text updates in-place as AI types (no waiting for completion)
- 📝 **Rich formatting** - Markdown, code blocks, syntax highlighting
- 🧠 **Reasoning display** - See the AI's thought process
- 🔧 **Tool call visualization** - View file reads, edits, and bash commands
- 📎 **File attachments** - Attach files to your messages
- 🎯 **Agent selection** - Switch between different AI agents
- 🤖 **Model selection** - Choose from available AI models

### Developer Experience
- 🔥 **Hot Module Replacement** - Instant updates during development
- 🎨 **Component-driven** - Storybook for isolated component development
- 📦 **Type-safe** - Full TypeScript with OpenCode SDK types
- 🧪 **Well-tested** - 41 passing tests covering critical paths
- 🔄 **Pure functions** - Testable, composable utility functions
- 🎯 **Type guards** - No `any` types, full type inference

### Production Ready
- ⚡ **Edge deployment** - Deploy to Cloudflare's global network
- 🌍 **Low latency** - Serve from 300+ cities worldwide
- 🔒 **Secure** - Runs on Cloudflare Workers runtime
- 📊 **Observable** - Built-in monitoring and analytics
- 🚀 **Zero-config** - Simple one-command deployment

## 📐 Architecture

### Dual-Context Build System

Three separate TypeScript contexts:

1. **React App** (`src/react-app/`) - Client-side chat interface
2. **Worker** (`src/worker/`) - Cloudflare Workers backend (Hono API + SSE proxy)
3. **Shared Code** (`src/components/`, `src/lib/`, `src/hooks/`) - Reusable UI and utilities

The Worker serves the React app as static assets and proxies API requests to your local OpenCode server.

### Real-time Streaming Architecture

```
OpenCode Server → Worker (SSE Proxy) → Browser (EventSource) → React Query Cache → UI
```

1. **OpenCode emits events** - `message.updated`, `message.part.updated`, `session.idle`
2. **Worker proxies SSE** - Forwards events from OpenCode to browser
3. **Browser receives events** - `useOpencodeEvents` hook manages EventSource connection
4. **Cache updates in-place** - Pure functions update React Query cache directly
5. **UI re-renders** - React automatically updates when cache changes

### Type Safety

All types derived from OpenCode SDK:
- `Message`, `Part`, `Event` types from `@opencode-ai/sdk/client`
- Custom `MessageWithParts` interface matching API responses
- Type guards for safe event handling: `isMessageUpdatedEvent`, `isTextPart`, etc.
- Zero `any` types in production code

**Path Aliases**: All imports use `@/*` → `src/`:
```typescript
import { Button } from "@/components/ui/button"
import { useOpencodeEvents } from "@/hooks/use-opencode-events"
import { upsertMessage } from "@/lib/message-cache-utils"
```

## Getting Started

### Prerequisites

1. **OpenCode** - Install and run OpenCode locally: [opencode.ai](https://opencode.ai)
2. **pnpm** - Package manager:
   ```bash
   npm install -g pnpm
   ```

### Installation

```bash
pnpm install
```

### Development

Start the development server:

```bash
pnpm dev
```

Your app will be available at [http://localhost:5173](http://localhost:5173).

### Component Development

Start Storybook for isolated component development:

```bash
pnpm storybook
```

Storybook will be available at [http://localhost:6006](http://localhost:6006).

## Project Structure

```
src/
├── react-app/          # React application entry and pages
│   ├── pages/          # Page components (ChatPage, etc.)
│   └── *.test.ts       # Test files
├── components/         # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── ai-elements/    # AI chat UI components
│   └── chat/           # Chat-specific components
├── hooks/              # React hooks
│   ├── use-opencode.ts              # API queries and mutations
│   ├── use-opencode-events.ts       # SSE connection management
│   ├── use-streaming-updates.ts     # Real-time cache updates
│   └── opencode-event-utils.ts      # Event parsing utilities
├── lib/                # Utility functions
│   └── message-cache-utils.ts       # Pure cache update functions
├── types/              # TypeScript types
│   ├── opencode-events.ts           # SSE event types
│   ├── opencode-messages.ts         # Message types
│   └── opencode-schemas.ts          # Zod schemas
├── worker/             # Cloudflare Workers backend
│   └── index.ts        # Hono API + SSE proxy
└── stories/            # Storybook stories
```

## Code Quality

### Testing

Run all tests:
```bash
pnpm test
```

Run individual test suites:
```bash
pnpm test:worker     # Backend/API tests
pnpm test:ui         # React component unit tests (41 tests)
pnpm test:storybook  # Storybook visual/interaction tests
```

### Type Checking

```bash
pnpm check
```

Runs TypeScript compiler in dry-run mode across all contexts.

### Linting

```bash
pnpm lint
```

## Component Development Workflow

1. **Check existing components** - Review `src/components/` and Storybook
2. **Search AI Elements** - Check [aielements.com](https://www.aielements.com/) for chat UI components
3. **Search shadcn/ui** - Check [ui.shadcn.com](https://ui.shadcn.com/) for general components
4. **Add component**:
   ```bash
   pnpm dlx shadcn@latest add <component>
   pnpm dlx ai-elements@latest add <component>
   ```
5. **Create story** - Always add Storybook story for new components
6. **Write tests** - Add tests to `src/react-app/`
7. **Run tests** - `pnpm test:ui` and `pnpm test:storybook`

## Production Deployment

Build for production:
```bash
pnpm build:production
```

Deploy to Cloudflare Workers:
```bash
pnpm deploy
```
