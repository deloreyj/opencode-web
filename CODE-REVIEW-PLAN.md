# 🧹 OpenCode Web Systematic Code Review Plan

**Created**: November 10, 2025  
**Status**: Phase 1 Complete ✅  
**Total Files Analyzed**: 224 TypeScript files

---

## 📊 Summary of Issues Found

| Category | Critical | High | Medium | Low | Total |
|----------|----------|------|--------|-----|-------|
| **Dead Code** | 1 | 1 | 5 | 3 | 10 |
| **Hacks & One-offs** | 6 | 8 | 12 | 4 | 30 |
| **Duplication** | 3 | 6 | 8 | 2 | 19 |
| **Code Smells** | 8 | 12 | 15 | 8 | 43 |
| **TOTAL** | **18** | **27** | **40** | **17** | **102** |

---

## 🎯 Phase 1: Quick Wins & Critical Fixes (Week 1) ✅
**Goal**: Remove dead code, fix critical type safety issues, standardize logging  
**Status**: Complete  
**Actual Effort**: ~3 hours  
**Branch**: `chore/phase-1-quick-wins`

### 1.1 Dead Code Removal ✅
- [x] **Delete `src/hooks/use-streaming-message.ts`** (142 lines) - Confirmed unused
- [x] **Relocate test files** from `src/react-app/` to proper locations:
  - [x] Move `opencode-event-utils.test.ts` → `src/hooks/`
  - [x] Move `message-cache-utils.test.ts` → `src/lib/`
  - [x] Move `use-streaming-updates.test.ts` → `src/hooks/`

### 1.2 Logging (Reverted) ❌
- [x] ~~Replace console with logger utility~~ **Reverted**
- [x] Decided logger provided zero value (just a pass-through)
- [x] Kept console.log/error/warn directly
- [x] Cloudflare Workers observability captures console natively

### 1.3 Critical Deduplication ✅
- [x] **Remove duplicate error utilities in `opencode-app.ts`** (lines 27-121, 98 lines removed)
  - [x] Delete local `createErrorResponse()` function
  - [x] Delete local `getErrorStatusCode()` function
  - [x] Import from centralized utilities

### 1.4 Type Safety Critical Fixes ✅
- [x] **Fix worker process type assertions**
  - [x] Created `ProcessWithOutput` interface for stdout/stderr
  - [x] `src/worker/workspaces-app.ts:428` - Proper type casting
- [x] **Fix status type mismatch**
  - [x] Updated `workspaceMetadata` Map to use `WorkspaceStatus` enum
  - [x] Removed `as any` assertions (lines 287, 338)
- [x] **Replace `@ts-ignore` with proper types**
  - [x] `src/worker/utils/proxyToWorkspaceSandbox.ts` - Extended RequestInit with duplex type

**Actual Impact**: 
- ✅ Removed 240+ lines of dead/duplicate code
- ✅ Fixed 5 critical type safety issues (all `as any` and `@ts-ignore`)
- ✅ All tests passing, type check clean, build successful
- ✅ Kept console.log/error/warn (logger abstraction removed as it provided no value)

**Commits**: 7 commits on `chore/phase-1-quick-wins`

---

## 🔧 Phase 2: Component Extraction & Refactoring (Week 2)
**Goal**: Break up large components, reduce complexity  
**Status**: Not Started  
**Estimated Effort**: 12-16 hours

### 2.1 Split `prompt-input.tsx` (1,380 lines)
Create new directory structure: `src/components/ai-elements/prompt-input/`
- [ ] `contexts.tsx` - Extract contexts and providers
- [ ] `components/FilePreview.tsx`
- [ ] `components/MentionsList.tsx`
- [ ] `components/PromptTextarea.tsx`
- [ ] `components/ToolbarActions.tsx`
- [ ] `hooks/usePromptState.ts`
- [ ] `utils.ts`
- [ ] `index.tsx` - Main export (200-300 lines max)
- [ ] Update `tsconfig.app.json` to include new subdirectory

### 2.2 Refactor `ChatPage.tsx` (915 lines)
Create new directory structure: `src/react-app/pages/ChatPage/`
- [ ] `DiffViewPanel.tsx` - Diff view logic + UI
- [ ] `ConversationPanel.tsx` - Chat messages + streaming
- [ ] `SettingsPanel.tsx` - Model/agent selection
- [ ] `hooks/useChatState.ts` - Consolidate state management
- [ ] `hooks/useSessionSync.ts` - Session selection logic
- [ ] `index.tsx` - Layout coordinator (200-300 lines max)

### 2.3 Fix Complex useEffect Dependencies
- [ ] **ChatPage.tsx lines 341-377** - Consolidate 4 interdependent useEffects
  - Option A: Merge into single useEffect with proper deps
  - Option B: Extract into custom `useSessionState` hook with useReducer
- [ ] **use-streaming-updates.ts:58-60** - Remove ref mutation in useEffect
  - Use proper state management instead of ref mutation

### 2.4 Add Error Boundaries
- [ ] Create `src/components/ErrorBoundary.tsx`
- [ ] Create `src/components/RouteErrorBoundary.tsx` with reset capability
- [ ] Wrap ChatPage with error boundary
- [ ] Wrap AI Elements with error boundaries

**Expected Impact**:
- Break 2,295 lines into ~12 focused files (<300 lines each)
- Reduce cognitive complexity by 60%
- Add crash protection

---

## 🏗️ Phase 3: Architecture Improvements (Week 3)
**Goal**: Create shared abstractions, reduce duplication  
**Status**: Not Started  
**Estimated Effort**: 16-20 hours

### 3.1 Workspace Operations Abstraction
Current: Every endpoint in `workspaces-app.ts` duplicates "local" vs "sandbox" branching.

- [ ] Create `src/worker/services/WorkspaceService.ts`
```typescript
class WorkspaceService {
  async executeGitOperation(workspaceId: string, operation: GitOperation): Promise<Result>
  async stageFiles(workspaceId: string, files: string[]): Promise<Result>
  async unstageFiles(workspaceId: string, files: string[]): Promise<Result>
  async getDiff(workspaceId: string): Promise<DiffResult>
  async getStatus(workspaceId: string): Promise<StatusResult>
}
```
- [ ] Refactor endpoints to use service:
  - [ ] `POST /stage-all` (lines 438-503)
  - [ ] `POST /diff` (lines 507-571)
  - [ ] `POST /status` (lines 574-625)
  - [ ] `POST /stage` (lines 628-683)
  - [ ] `POST /unstage` (lines 686-741)

### 3.2 React Query Patterns
Current: 15+ mutations with identical pattern in `use-opencode.ts` (778 lines).

- [ ] Create `src/hooks/factories/createMutationHook.ts`
```typescript
function createMutationHook<TParams, TResult>(
  mutationFn: (client: OpencodeClient, params: TParams) => Promise<Result<TResult>>,
  invalidationKeys: QueryKey[]
) { /* ... */ }
```
- [ ] Split `use-opencode.ts` into domain-specific hooks:
  - [ ] `src/hooks/opencode/use-opencode-sessions.ts` - Session CRUD
  - [ ] `src/hooks/opencode/use-opencode-messages.ts` - Message operations
  - [ ] `src/hooks/opencode/use-opencode-files.ts` - File operations
  - [ ] `src/hooks/opencode/use-opencode-git.ts` - Git operations
  - [ ] `src/hooks/opencode/index.ts` - Re-export all

### 3.3 Constants Extraction
- [ ] Create `src/lib/constants.ts`
```typescript
export const PORTS = {
  VITE_DEV: 7777,
  OPENCODE_CLI: 4096,
  WORKSPACE: 8080,
  GIT_DIFF: 4097,
} as const;

export const TIMEOUTS = {
  WORKSPACE_HEALTH_CHECK: 3000,
  WORKSPACE_VERIFY: 2000,
  PROCESS_KILL: 5000,
} as const;

export const STALE_TIMES = {
  SESSIONS: 60000,
  MESSAGES: 5000,
  WORKSPACE_STATUS: 5000,
} as const;

export const DEFAULT_MODEL = {
  PROVIDER: "anthropic",
  NAME: "claude-3-5-sonnet-20241022",
} as const;
```
- [ ] Replace all magic numbers throughout codebase

### 3.4 Test Utilities
- [ ] Create `src/test-utils/fixtures.ts`
```typescript
export function createMockOpencodeEvent(overrides?: Partial<OpencodeEvent>): OpencodeEvent
export function createMockSession(overrides?: Partial<Session>): Session
export function createMockMessage(overrides?: Partial<Message>): Message
```
- [ ] Replace all `as any` in test files with proper fixtures

**Expected Impact**:
- Eliminate ~500 lines of duplicated code
- Create 8-10 reusable abstractions
- Improve type safety in tests

---

## 🎨 Phase 4: Type Safety & Code Quality (Week 4)
**Goal**: Eliminate remaining type bypasses, improve TypeScript strictness  
**Status**: Not Started  
**Estimated Effort**: 10-12 hours

### 4.1 Type Definitions
- [ ] Create `src/worker/types/hono-context.ts`
```typescript
export type WorkerContext = Context<{
  Bindings: {
    SANDBOX: DurableObjectNamespace;
    OPENCODE_URL: string;
    SANDBOX_HOSTNAME: string;
  };
}>;
```
- [ ] Replace all `c: any` and `env: any` in worker files
- [ ] Add explicit return types to all exported functions

### 4.2 Error Handling Standardization
- [ ] Replace all `catch (error)` with `catch (error: unknown)`
- [ ] Create `src/lib/error-guards.ts`
```typescript
export function isErrorWithMessage(error: unknown): error is { message: string }
export function isErrorWithStatus(error: unknown): error is { status: number }
export function getErrorMessage(error: unknown): string
```
- [ ] Use error guards instead of `as any` assertions

### 4.3 Event Type Completion
- [ ] Fix incomplete event types causing `as any`:
  - [ ] `src/hooks/use-streaming-message.ts:112` - Add `messageID` to event properties
  - [ ] `src/react-app/pages/ChatPage.tsx:447` - Fix File type (add `name` property)

### 4.4 Workspace Metadata Persistence
- [ ] **Critical**: Fix in-memory `workspaceMetadata` Map (lines 18-26 of `workspaces-app.ts`)
- [ ] Implement persistent storage using Durable Object storage
- [ ] Create migration plan for existing workspaces
- [ ] Add state recovery on Worker restart

**Expected Impact**:
- Eliminate all `as any` assertions (~26 occurrences)
- Remove `@ts-ignore` comment (1 occurrence)
- Fix critical data persistence issue
- Improve error handling consistency

---

## 🚀 Phase 5: Performance & Polish (Week 5)
**Goal**: Optimize bundle size, query efficiency, final cleanup  
**Status**: Not Started  
**Estimated Effort**: 8-10 hours

### 5.1 Code Splitting
- [ ] Lazy load ChatPage: `const ChatPage = lazy(() => import('./pages/ChatPage'))`
- [ ] Lazy load large components:
  - [ ] `prompt-input` (1,380 lines)
  - [ ] `DiffViewer` components
  - [ ] Storybook-only components
- [ ] Analyze bundle with `pnpm build:staging && npx vite-bundle-visualizer`

### 5.2 Query Optimization
- [ ] Review all `queryClient.invalidateQueries()` calls in `use-opencode.ts`
- [ ] Make invalidations more granular:
  - Instead of `{ queryKey: ["sessions"] }` → `{ queryKey: ["sessions", sessionId] }`
  - Add exact matching where appropriate
- [ ] Add `staleTime` configuration review

### 5.3 Prop Drilling Reduction
- [ ] Consider context for deeply drilled props in ChatPage:
  - [ ] Git staging handlers (`handleStageFile`, `handleUnstageFile`, `isStaging`)
  - [ ] Session management (`sessions`, `currentSessionId`, `onSelectSession`)
- [ ] Alternative: Compose props with spread operators

### 5.4 Final Cleanup
- [ ] Remove any remaining TODO comments (document or fix)
- [ ] Run `pnpm lint --fix` on entire codebase
- [ ] Run full test suite: `pnpm test`
- [ ] Update documentation (AGENTS.md, CLAUDE.md) with new patterns

**Expected Impact**:
- Reduce initial bundle size by ~20-30%
- Reduce unnecessary network requests
- Improve code maintainability

---

## 📋 Execution Strategy

### Working Approach
1. **Create feature branch for each phase**: `chore/phase-1-quick-wins`, etc.
2. **Work file-by-file within each phase** - commit frequently
3. **Run tests after each file change**: `pnpm test:ui` or `pnpm test:worker`
4. **Run type checking**: `pnpm check` before committing
5. **Merge phase branches to main** after validation

### Safety Checks
Before completing each phase, verify:
- [ ] All tests passing: `pnpm test`
- [ ] Type checking clean: `pnpm check`
- [ ] Linting clean: `pnpm lint`
- [ ] Dev server runs: `pnpm dev`
- [ ] Storybook builds: `pnpm storybook`
- [ ] Production build succeeds: `pnpm build:production`

### Documentation Updates
After each phase, update:
- [ ] `AGENTS.md` - New patterns, architecture decisions
- [ ] `CLAUDE.md` - Context for future AI assistance
- [ ] `DEVELOPMENT.md` - New conventions, utilities

---

## 📈 Success Metrics

| Metric | Before | Target | Current | Measured At |
|--------|--------|--------|---------|-------------|
| Dead code (LOC) | ~300 | 0 | - | Phase 1 |
| Console statements | 100+ | 0 (use logger) | - | Phase 1 |
| `as any` assertions | 26+ | <5 | - | Phase 4 |
| Avg file size (LOC) | ~180 | ~150 | - | Phase 2 |
| Files >500 lines | 3 | 0 | - | Phase 2 |
| Duplicated code blocks | 19 | <5 | - | Phase 3 |
| Test coverage | ? | Document | - | Phase 5 |
| Bundle size | ? | -20% | - | Phase 5 |

---

## 🎯 Recommended Priority

If time is limited, prioritize in this order:
1. **Phase 1** (Critical) - Remove dead code, fix type safety, standardize logging
2. **Phase 4** (High) - Fix workspace metadata persistence (data loss risk!)
3. **Phase 2** (High) - Break up large files (maintainability)
4. **Phase 3** (Medium) - Create abstractions (reduce duplication)
5. **Phase 5** (Low) - Performance optimization (nice-to-have)

---

## ⏱️ Total Estimated Effort

| Phase | Effort | Status |
|-------|--------|--------|
| Phase 1: Quick Wins | 6-8 hours | Not Started |
| Phase 2: Components | 12-16 hours | Not Started |
| Phase 3: Architecture | 16-20 hours | Not Started |
| Phase 4: Type Safety | 10-12 hours | Not Started |
| Phase 5: Performance | 8-10 hours | Not Started |
| **Total** | **52-66 hours** | **~2 weeks** |

---

## 📝 Notes & Decisions

### Phase Completion Notes
Add notes here as each phase is completed...

### Blockers & Issues
Track any blockers encountered during cleanup...

### Deferred Items
Items that were identified but deferred for later...

---

**Last Updated**: November 10, 2025
