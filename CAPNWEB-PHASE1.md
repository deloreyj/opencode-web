# Cap'n Web Phase 1 Implementation Complete! 🎉

## What We Built

Successfully integrated **Cap'n Web RPC** into the OpenCode Web application using HTTP batch mode. This allows multiple RPC calls to be bundled into a single HTTP request, significantly reducing network latency.

## Files Created

### 1. Type Definitions
- **`src/types/opencode-rpc.ts`** - RPC API interface defining all available methods

### 2. Server Implementation
- **`src/worker/opencode-rpc-server.ts`** - RPC server that implements OpencodeRpcApi by proxying to OpenCode SDK

### 3. Client Implementation
- **`src/lib/opencode-rpc-client.ts`** - HTTP batch RPC session factory
- **`src/lib/opencode-rpc-context.tsx`** - React context for RPC state management

### 4. Test Page
- **`src/react-app/pages/RpcTestPage.tsx`** - Test interface to validate RPC integration

## Files Modified

### Worker Setup
- **`src/worker/index.ts`** - Added `/api/opencode-rpc` endpoint for direct mode
- **`src/worker/workspaces-app.ts`** - Added `/:workspaceId/opencode-rpc` endpoint for workspace mode

### App Setup
- **`src/react-app/App.tsx`** - Added route switcher to access RPC test page
- **`src/react-app/pages/ChatPage.tsx`** - Fixed missing import (workspaceStatusKeys)

### Dependencies
- **`package.json`** - Added `capnweb` package

## How to Test

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Access the RPC Test Page

Navigate to: `http://localhost:7777/#rpc-test`

### 3. What to Test

1. **Select a workspace** from the dropdown (or create one)
2. Click **"Refetch All (Batch)"** button
3. **Open DevTools Network tab** and observe:
   - Should see a SINGLE HTTP POST to `/api/workspaces/{id}/opencode-rpc` or `/api/opencode-rpc`
   - This one request contains 4 RPC calls:
     - `getAgents()`
     - `getConfig()`
     - `getProviders()`
     - `listSessions()`
4. All four data sections should populate simultaneously
5. **Try creating a session** - should batch create + refetch in one request
6. **Try deleting a session** - should batch delete + refetch in one request

### Expected Network Behavior

**Before (HTTP REST):** 4 separate requests
```
GET /api/workspaces/{id}/opencode/app/agents
GET /api/workspaces/{id}/opencode/config
GET /api/workspaces/{id}/opencode/config/providers
GET /api/workspaces/{id}/opencode/session
```

**After (Cap'n Web RPC):** 1 batched request
```
POST /api/workspaces/{id}/opencode-rpc
  Body: [JSON-encoded batch of 4 RPC calls]
  Response: [JSON-encoded batch of 4 results]
```

## Architecture

### Client → Server Flow

```
React Component
  ↓
useRpcData() hook
  ↓
createRpcSession(workspaceId)
  ↓
newHttpBatchRpcSession<OpencodeRpcApi>(url)
  ↓
Queue multiple RPC calls (no await)
  ↓
await Promise.all([...calls])
  ↓
SINGLE HTTP POST with batch
  ↓
Hono app.all("/api/.../opencode-rpc")
  ↓
newWorkersRpcResponse(request, OpencodeRpcServer)
  ↓
OpencodeRpcServer proxies to OpenCode SDK
  ↓
Return batch results
```

### Key Benefits

1. **Reduced Latency** - 1 round trip instead of 4
2. **Type Safety** - Full TypeScript inference across RPC boundary
3. **Simple API** - Just call methods like `api.getAgents()`
4. **Automatic Batching** - Cap'n Web handles serialization/deserialization

## API Examples

### Batch Fetching (The Magic!)

```typescript
import { createRpcSession } from "@/lib/opencode-rpc-client";

// Create a batch session
using api = createRpcSession(workspaceId);

// Queue up calls (don't await!)
const agentsPromise = api.getAgents();
const configPromise = api.getConfig();
const sessionsPromise = api.listSessions();

// NOW await - sends ONE HTTP request!
const [agents, config, sessions] = await Promise.all([
  agentsPromise,
  configPromise,
  sessionsPromise
]);
```

### Promise Pipelining (Future Enhancement)

```typescript
// Create and immediately use the result - still one round trip!
const newSession = api.createSession("My Session");
const messages = api.getMessages(newSession.id); // Uses promise directly!

const [session, msgs] = await Promise.all([newSession, messages]);
```

## Next Steps (Phase 2)

### Option A: Migrate ChatPage to RPC
Replace React Query hooks with RPC context in the main chat interface

### Option B: Add WebSocket Support
Implement persistent WebSocket RPC sessions for long-lived connections

### Option C: Add Server→Client Callbacks
Replace SSE with bidirectional RPC for real-time updates

## Debugging

### Enable RPC Logging

Both client and server log RPC calls:
- **Client:** `[RPC Client]` and `[RPC Context]` prefixes
- **Server:** `[RPC Server]` and `[RPC]` prefixes

Check browser console and worker logs for detailed traces.

### Common Issues

1. **"No workspace selected"** - Make sure to select a workspace in the test UI
2. **404 on RPC endpoint** - Verify worker deployed correctly with new RPC routes
3. **CORS errors** - Should not happen since RPC is same-origin
4. **Type errors** - Make sure `OpencodeRpcApi` interface matches server implementation

## Rollback Plan

If needed, revert these changes:
1. Remove RPC routes from worker files
2. Remove `capnweb` from package.json
3. Delete new RPC files (listed above)
4. ChatPage still uses React Query - unaffected!

## Success Criteria ✅

- [x] Build completes without errors
- [x] RPC server compiles and mounts correctly
- [x] RPC client can create batch sessions
- [x] Test page renders and allows interaction
- [ ] Network tab shows batched requests (needs runtime test)
- [ ] All 4 API calls return data successfully (needs runtime test)

---

**Ready to test!** Run `npm run dev` and navigate to `http://localhost:7777/#rpc-test` 🚀
