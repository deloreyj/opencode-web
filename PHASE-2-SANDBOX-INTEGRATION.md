# Phase 2: Sandbox Integration Requirements

## Overview

This document outlines the requirements for Phase 2 of the OpenCode Web project: integrating Cloudflare Sandbox SDK to enable secure, isolated code execution for the OpenCode agent within development sandboxes.

## Current State

### OpenCode Web (Phase 1)
- ✅ Mobile-first React 19 chat UI for OpenCode
- ✅ Cloudflare Workers backend (Hono) serving React app + proxying API requests
- ✅ Real-time SSE streaming from local OpenCode server
- ✅ Worker proxies requests to OpenCode at `http://127.0.0.1:4096` (dev) or `http://opencode-{env}:4096` (production)
- ✅ React app served as static assets from `dist/client/`

**Current Architecture:**
```
User → Cloudflare Worker (Hono) → Local OpenCode Server (CLI)
         ↓
    React App (static assets)
```

## Phase 2 Goals

### Primary Objectives

1. **Embed OpenCode in Sandbox SDK**
   - OpenCode server runs inside Sandbox containers on cloned repos
   - Minimal Hono API in container proxies OpenCode API
   - Enable cloning repos and running OpenCode agent on code in isolated containers

2. **Serve React App from Worker Edge**
   - React UI served from Cloudflare Worker via Workers Assets (fast, globally distributed)
   - Worker routes API requests to appropriate sandbox containers
   - Single React app manages all workspaces (not per-sandbox UIs)

3. **Maintain Development Simplicity**
   - Keep current local development workflow for rapid iteration
   - Production uses Sandboxes, development uses local OpenCode server

### Key Use Cases

1. **Clone-and-Code**: User provides a GitHub URL → System clones repo into Sandbox → OpenCode agent works on the code
2. **Isolated Workspaces**: Multiple users can work on different repos simultaneously in isolated containers
3. **Ephemeral Environments**: Spin up temporary dev environments with full OpenCode capabilities
4. **Edge Development**: Run development environments globally at the edge

## Architecture Design

### Phase 2 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ User (Browser)                                                   │
└──────────┬────────────────────────┬──────────────────────────────┘
           │                        │
           │ (React App)            │ (API Requests)
           │                        │
           ▼                        ▼
┌──────────────────────────────────────────────────────────────────┐
│ Cloudflare Worker (Edge)                                         │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Workers Assets                                              ││
│  │  - Serve React app (dist/client/)                          ││
│  │  - Fast edge delivery (300+ locations)                     ││
│  │  - Zero cold start for UI                                  ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Workspace Coordinator (Hono API)                            ││
│  │  - POST /api/workspaces (create)                           ││
│  │  - GET  /api/workspaces (list)                             ││
│  │  - DELETE /api/workspaces/:id (delete)                     ││
│  │  - ALL /api/workspaces/:id/* (proxy to sandbox)           ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                   │
└────────────────────────────────┬──────────────────────────────────┘
                                 │
                                 │ (Proxy API requests)
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ Sandbox Durable Object (per workspace)                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Container Runtime                                         │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │ OpenCode Server (port 4096)                         │ │  │
│  │  │  - Running on /workspace/repo/                      │ │  │
│  │  │  - Agent has full access to cloned code            │ │  │
│  │  │  - Provides OpenCode API endpoints                 │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │ Minimal API Proxy (port 3000)                       │ │  │
│  │  │  - Thin proxy to localhost:4096                     │ │  │
│  │  │  - SSE streaming passthrough                        │ │  │
│  │  │  - Health check endpoint                            │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  │                                                            │  │
│  │  /workspace/                                               │  │
│  │    └── repo/  (git cloned repository)                     │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Preview URL (for debugging/direct access):                     │
│    https://{workspace-id}.{worker-name}.{account}.workers.dev  │
└─────────────────────────────────────────────────────────────────┘
```

**Key Points:**
- **React app loads from edge** → Fast, no container needed
- **Worker proxies API calls** → Routes to correct sandbox
- **Container only runs compute** → OpenCode + minimal proxy
- **Single UI manages all workspaces** → Better UX than separate UIs

### Container Image Requirements

**Base Image:** Extend `@cloudflare/sandbox` base image (Ubuntu 22.04)

**Additional Dependencies:**
- OpenCode CLI (install via npm or download binary)
- Node.js 20 LTS (already included in base image)
- Git (already included in base image)
- Any additional OpenCode dependencies

**Services Running in Container:**
1. **OpenCode Server** - Port 4096
   - Started with `opencode serve --port 4096 --host 0.0.0.0`
   - Working directory: `/workspace/repo/`
   - Exposed via `sandbox.exposePort(4096)` (always available)
   - Worker routes OpenCode API calls directly to this preview URL

2. **Application Dev Servers** - Dynamic Ports
   - Ports exposed dynamically via `sandbox.exposePort(port, { name: "app" })`
   - Examples: Vite (5173), Next.js (3000), Create React App (3000), etc.
   - User can preview their application via these preview URLs
   - **No proxy needed** - Direct access to dev servers

### Dual-Mode Operation

**Development Mode (Local):**
```bash
pnpm dev
# → Vite dev server (localhost:5173)
# → Local OpenCode server (127.0.0.1:4096)
# → Fast HMR, no Docker required
```

**Production Mode (Sandbox):**
```bash
pnpm deploy
# → Worker serves React app from edge (Workers Assets)
# → Worker coordinates Sandboxes and proxies API requests
# → Each sandbox runs OpenCode + minimal proxy in container
```

## Technical Requirements

### 1. Sandbox SDK Integration

**Install Dependencies:**
```bash
cd opencode-web
pnpm add @cloudflare/sandbox
```

**Update wrangler.jsonc:**
```jsonc
{
  "durable_objects": {
    "bindings": [
      { "name": "SANDBOX", "class_name": "Sandbox", "script_name": "opencode-web" }
    ]
  }
}
```

### 2. Container Dockerfile

**Location:** `opencode-web/Dockerfile.sandbox`

**Requirements:**
- Extend FROM `cloudflare/sandbox:latest`
- Install OpenCode CLI
- Expose port 4096 (OpenCode server)
- Start OpenCode server on `0.0.0.0:4096`
- **No proxy needed** - Worker accesses OpenCode directly via preview URL
- **Do NOT bundle React app** (served by Worker edge)

**Note:** Dev server ports are exposed dynamically at runtime via `sandbox.exposePort()`, not in Dockerfile

### 3. Coordinator Worker

**Location:** `opencode-web/src/worker/index.ts` (extend existing worker)

**Responsibilities:**
- **Serve React app** via Workers Assets (existing functionality)
- Route API requests to appropriate sandbox
- Manage sandbox lifecycle:
  - `POST /api/workspaces` - Create new workspace (clone repo, start sandbox)
  - `GET /api/workspaces` - List all workspaces
  - `GET /api/workspaces/:id` - Get workspace details
  - `DELETE /api/workspaces/:id` - Delete workspace
  - `ALL /api/workspaces/:id/*` - Proxy all OpenCode API calls to sandbox
- Handle authentication/authorization (future)

**API Design:**

```typescript
// Create workspace
POST /api/workspaces
{
  "repoUrl": "https://github.com/user/repo",
  "branch": "main" // optional
}
Response:
{
  "id": "workspace-abc123",
  "status": "initializing",
  "apiUrl": "/api/workspaces/workspace-abc123" // All OpenCode API calls go here
}

// List workspaces
GET /api/workspaces
Response:
{
  "workspaces": [
    {
      "id": "workspace-abc123",
      "repoUrl": "https://github.com/user/repo",
      "apiUrl": "/api/workspaces/workspace-abc123",
      "status": "ready",
      "createdAt": "2025-10-28T20:00:00Z"
    }
  ]
}

// Get workspace details
GET /api/workspaces/:id
Response:
{
  "id": "workspace-abc123",
  "repoUrl": "https://github.com/user/repo",
  "apiUrl": "/api/workspaces/workspace-abc123",
  "status": "ready",
  "opencodeStatus": {
    "running": true,
    "port": 4096
  },
  "files": 234,
  "diskUsage": "45MB"
}

// Delete workspace
DELETE /api/workspaces/:id
Response: { "success": true }

// Proxy OpenCode API (example)
GET /api/workspaces/:id/sessions
→ Proxies to sandbox container at https://{sandbox-preview-url}/api/opencode/sessions
```

**Worker Routing Logic:**
```typescript
// In src/worker/index.ts
import { getSandbox } from "@cloudflare/sandbox";

app.all('/api/workspaces/:workspaceId/*', async (c) => {
  const workspaceId = c.req.param('workspaceId');
  const path = c.req.path.replace(`/api/workspaces/${workspaceId}`, '');

  // Get sandbox for this workspace using helper
  const sandbox = getSandbox(c.env.SANDBOX, workspaceId);

  // Get exposed ports (4096 is OpenCode server)
  const { ports } = await sandbox.getExposedPorts();
  const opencodePort = ports.find(p => p.port === 4096);

  if (!opencodePort) {
    return c.json({ error: 'OpenCode server not available' }, 503);
  }

  // Proxy request to OpenCode via preview URL
  const response = await fetch(`${opencodePort.exposedAt}${path}`, {
    method: c.req.method,
    headers: c.req.header(),
    body: c.req.raw.body
  });

  return response;
});
```

### 4. Sandbox Initialization Flow

**On Sandbox Creation:**

1. Coordinator receives `POST /api/workspaces` with `repoUrl`
2. Get/create Sandbox using `getSandbox` helper (already shown in step 3)
3. Initialize sandbox and clone repo:
   ```typescript
   import { getSandbox } from "@cloudflare/sandbox";

   const sandbox = getSandbox(env.SANDBOX, workspaceId);

   // Clone repo
   await sandbox.exec(`git clone ${repoUrl} /workspace/repo`);

   // Install dependencies (if needed)
   await sandbox.exec(`cd /workspace/repo && npm install`);

   // Container auto-starts OpenCode server on boot
   ```
4. Expose OpenCode port via preview URL:
   ```typescript
   // Expose OpenCode server (port 4096)
   const opencode = await sandbox.exposePort(4096, { name: 'opencode' });
   ```
5. Return workspace details with preview URLs:
   ```typescript
   return {
     id: workspaceId,
     status: 'ready',
     opencodeUrl: opencode.exposedAt,
     // Dev server URLs exposed later when user starts dev server
   };
   ```

### 5. React App Updates

**New Workspace Management UI:**

**Location:** `src/react-app/pages/WorkspacesPage.tsx`

**Features:**
- List all workspaces (cards with repo name, status)
- Create new workspace (form with GitHub URL input)
- Delete workspace (confirmation dialog)
- Switch between workspaces (updates OpenCode client base URL)

**New Components:**
- `WorkspaceCard` - Display workspace info
- `CreateWorkspaceDialog` - Form to create workspace
- `WorkspaceStatus` - Status badge (initializing, ready, error)

**New Hooks:**
- `useWorkspaces` - List workspaces query
- `useCreateWorkspace` - Create workspace mutation
- `useDeleteWorkspace` - Delete workspace mutation

### 6. Build System Updates

**New Build Scripts:**

```json
{
  "scripts": {
    "docker:build": "docker build -t opencode-web-sandbox -f Dockerfile.sandbox .",
    "docker:push": "docker tag opencode-web-sandbox $DOCKER_REGISTRY/opencode-web-sandbox:latest && docker push $DOCKER_REGISTRY/opencode-web-sandbox:latest"
  }
}
```

**Note:** No TypeScript compilation needed for container since OpenCode runs directly. React app is served by Worker edge.

### 7. Environment Variables

**Routing Strategy:**

Instead of using environment variables, the Worker supports both modes via different route patterns:

- **Direct mode:** `/api/opencode/*` → Routes to `OPENCODE_URL` (local server)
- **Workspace mode:** `/api/workspaces/:workspaceId/opencode/*` → Routes to workspace sandbox

The same Hono sub-app is mounted at both paths with different client factories.

**No additional wrangler.jsonc changes needed** - routing is handled via URL structure.

## Implementation Plan

### Phase 2.1: Foundation (Week 1)

1. **Setup Sandbox SDK**
   - [x] Install `@cloudflare/sandbox` dependency
   - [x] Update wrangler.jsonc with Durable Object bindings
   - [x] Create basic Dockerfile.sandbox extending base image
   - [x] Update documentation to reflect direct OpenCode access (no proxy)

### Phase 2.2: Core Integration (Week 2)

2. **Worker Updates**
   - [ ] Extend `src/worker/index.ts` with workspace management
   - [ ] Add workspace CRUD endpoints
   - [ ] Implement API proxying to sandboxes
   - [ ] Add sandbox lifecycle management
   - [ ] Add basic error handling

3. **Sandbox Initialization**
   - [ ] Implement git clone flow
   - [ ] Add OpenCode server startup logic
   - [ ] Implement port exposure (4096 for OpenCode, dynamic for dev servers)
   - [ ] Add health checks

4. **Testing**
   - [ ] Test workspace creation
   - [ ] Test repo cloning
   - [ ] Test OpenCode startup
   - [ ] Test preview URL access

### Phase 2.3: UI & Polish (Week 3)

5. **React App Updates**
   - [ ] Create WorkspacesPage component
   - [ ] Add workspace management hooks
   - [ ] Create workspace UI components
   - [ ] Add navigation between workspaces

6. **Documentation**
   - [ ] Update README.md
   - [ ] Create deployment guide
   - [ ] Add architecture diagrams
   - [ ] Document API endpoints

7. **Testing & Optimization**
   - [ ] End-to-end testing
   - [ ] Performance optimization
   - [ ] Error handling improvements
   - [ ] Production deployment test

## Key Decisions

### 1. Container vs Direct Execution
**Decision:** Use containers for isolation
**Rationale:**
- Security: Isolate user code and agent execution
- Multi-tenancy: Support multiple concurrent workspaces
- Consistency: Same environment dev-to-prod

### 2. Dual-Mode Operation
**Decision:** Keep local dev, use Sandboxes in production
**Rationale:**
- Fast iteration during development (no Docker overhead)
- Full isolation and scalability in production
- Environment var controls mode switching

### 3. React App Deployment
**Decision:** Serve React app from Worker edge, not from containers
**Rationale:**
- Ultra-fast page loads (edge delivery, zero cold start)
- Containers only run compute (API + OpenCode)
- Simpler container (no static asset serving)
- Better resource utilization (containers for compute, CDN for assets)
- Easier updates (redeploy Worker without rebuilding containers)

### 4. Workspace Persistence
**Decision:** Ephemeral workspaces (no long-term storage)
**Rationale:**
- Sandboxes are designed for temporary execution
- Use git for persistence (push changes to remote)
- Future: Add R2 backup for workspace snapshots

### 5. Authentication
**Decision:** Phase 2 starts with no auth, add later
**Rationale:**
- Focus on core functionality first
- Auth adds complexity
- Easy to add token-based auth to preview URLs later

## Open Questions

1. **OpenCode License**: Can we redistribute OpenCode binary in Docker image?
   - Alternative: Install from npm at runtime

2. **Resource Limits**: What limits for sandboxes?
   - CPU/memory quotas
   - Disk space per workspace
   - Max concurrent sandboxes per user

3. **Cleanup Strategy**: When to delete inactive sandboxes?
   - Time-based (e.g., 24 hours idle)
   - User-triggered only
   - Automatic on inactivity

4. **Error Recovery**: How to handle OpenCode crashes?
   - Auto-restart
   - Surface errors to user
   - Graceful degradation

5. **Workspace Selection UX**: How should users switch between workspaces?
   - Dropdown selector in header
   - Sidebar navigation
   - URL-based routing (/workspace/:id)

6. **Preview URL Access**: Should preview URLs be exposed to users?
   - For debugging only
   - Hidden by default
   - Optional "direct access" mode

## Success Metrics

### Technical Metrics
- [ ] Sandbox creation time < 30 seconds
- [ ] OpenCode startup time < 10 seconds
- [ ] API response time < 500ms (p95)
- [ ] Container cold start < 5 seconds

### Functional Metrics
- [ ] Successfully clone public repos
- [ ] OpenCode agent can read/edit files
- [ ] Real-time SSE streaming works in sandbox
- [ ] React app loads and functions correctly
- [ ] Multiple concurrent workspaces supported

### Developer Experience
- [ ] Local dev workflow unchanged
- [ ] Production deployment automated
- [ ] Clear error messages
- [ ] Easy to debug issues

## Future Enhancements (Phase 3+)

1. **Workspace Snapshots**: Save/restore workspace state to R2
2. **Custom Docker Images**: Let users define custom base images
3. **Collaborative Workspaces**: Multiple users in same sandbox
4. **Private Repos**: Support GitHub auth for private repos
5. **Resource Monitoring**: Dashboard for CPU/memory usage
6. **Auto-scaling**: Increase/decrease sandbox capacity based on load
7. **Custom Domains**: Map workspaces to user domains
8. **Workspace Templates**: Pre-configured environments for common stacks
9. **IDE Integration**: VSCode extension to connect to sandboxes
10. **Webhook Integration**: Trigger sandbox creation from GitHub events

## References

- [Cloudflare Sandbox SDK Docs](https://developers.cloudflare.com/sandbox/)
- [OpenCode API Docs](https://opencode.ai/docs/)
- [Hono Documentation](https://hono.dev/)
- [Durable Objects Guide](https://developers.cloudflare.com/durable-objects/)
- [Preview URLs Documentation](https://developers.cloudflare.com/sandbox/guides/preview-urls/)

## Related Documents

- `README.md` - Current architecture and setup
- `DEVELOPMENT.md` - Local development guide
- `CLAUDE.md` - LLM context and patterns
- `AGENTS.md` - Agent-specific guidance
