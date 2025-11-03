/**
 * OpenCode Client Utility
 *
 * Provides a type-safe client for interacting with the OpenCode API via Worker.
 * This proxies requests through the Cloudflare Worker to the OpenCode container.
 */

import type {
  Session,
  Message,
  Part,
  Config,
  Provider,
  Agent,
  SessionPromptData,
  SessionCommandData,
  TextPartInput,
  FilePartInput,
  AgentPartInput,
} from "@opencode-ai/sdk/client";
import type {
  CreateSessionRequest,
  UpdateSessionRequest,
  PromptRequest,
  CommandRequest,
  ShellRequest,
  RevertRequest,
  SummarizeRequest,
  InitRequest,
  PermissionResponse,
  LogRequest,
  TextSearchRequest,
  FileSearchRequest,
  SymbolSearchRequest,
  FileReadRequest,
  FileStatusRequest,
  AuthSetRequest,
  ProvidersResponse,
  MessageResponse,
  MessagesResponse,
  TextSearchResult,
  FileReadResponse,
  Project,
  PathInfo,
  FileStatus,
  Symbol,
} from "@/types/opencode-schemas";

// Export types for use throughout the app
export type {
  Session,
  Message,
  Part,
  Config,
  Provider,
  Agent,
  SessionPromptData,
  SessionCommandData,
  TextPartInput,
  FilePartInput,
  AgentPartInput,
  CreateSessionRequest,
  UpdateSessionRequest,
  PromptRequest,
  CommandRequest,
  ShellRequest,
  RevertRequest,
  SummarizeRequest,
  InitRequest,
  PermissionResponse,
  LogRequest,
  TextSearchRequest,
  FileSearchRequest,
  SymbolSearchRequest,
  FileReadRequest,
  FileStatusRequest,
  AuthSetRequest,
  ProvidersResponse,
  MessageResponse,
  MessagesResponse,
  TextSearchResult,
  FileReadResponse,
  Project,
  PathInfo,
  FileStatus,
  Symbol,
};

// Helper type for chat message input (SessionPromptData body)
export type ChatMessageInput = NonNullable<SessionPromptData["body"]>;

// Helper type for command input (SessionCommandData body)
export type CommandInput = NonNullable<SessionCommandData["body"]>;

/**
 * Helper to unwrap worker API responses
 * Worker returns { data } on success, { error } on failure
 */
async function unwrapResponse<T>(response: Response): Promise<{ data: T | null; error: unknown }> {
  try {
    const json = await response.json();
    if (!response.ok) {
      return { data: null, error: json.error || json };
    }
    return { data: json.data as T, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Get the base URL for OpenCode API requests
 * Returns direct mode or workspace-scoped URL based on active workspace
 */
function getBaseUrl(workspaceId: string | null): string {
  if (workspaceId) {
    return `/api/workspaces/${workspaceId}/opencode`;
  }
  return "/api/opencode";
}

/**
 * OpenCode API Client Factory
 * Creates a client that uses the appropriate URL based on workspace context
 */
export function createOpencodeClient(workspaceId: string | null) {
  const baseUrl = getBaseUrl(workspaceId);

  return {
    // ========================================
    // App APIs
    // ========================================
    app: {
      async log(body: LogRequest) {
        const response = await fetch(`${baseUrl}/app/log`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        return unwrapResponse(response);
      },
      async agents() {
        const response = await fetch(`${baseUrl}/app/agents`);
        return unwrapResponse<Agent[]>(response);
      },
    },

    // ========================================
    // Project APIs
    // ========================================
    project: {
      async list() {
        const response = await fetch(`${baseUrl}/project/list`);
        return unwrapResponse<Project[]>(response);
      },
      async current() {
        const response = await fetch(`${baseUrl}/project/current`);
        return unwrapResponse<Project>(response);
      },
    },

    // ========================================
    // Path APIs
    // ========================================
    path: {
      async get() {
        const response = await fetch(`${baseUrl}/path`);
        return unwrapResponse<PathInfo>(response);
      },
    },

    // ========================================
    // Config APIs
    // ========================================
    config: {
      async get() {
        const response = await fetch(`${baseUrl}/config`);
        return unwrapResponse<Config>(response);
      },
      async providers() {
        const response = await fetch(`${baseUrl}/config/providers`);
        return unwrapResponse<ProvidersResponse>(response);
      },
    },

    // ========================================
    // Session APIs
    // ========================================
    session: {
      async list() {
        const response = await fetch(`${baseUrl}/sessions`);
        return unwrapResponse<Session[]>(response);
      },
      async get({ path }: { path: { id: string } }) {
        const response = await fetch(`${baseUrl}/sessions/${path.id}`);
        return unwrapResponse<Session>(response);
      },
      async children({ path }: { path: { id: string } }) {
        const response = await fetch(`${baseUrl}/sessions/${path.id}/children`);
        return unwrapResponse<Session[]>(response);
      },
      async create({ body }: { body: CreateSessionRequest }) {
        const response = await fetch(`${baseUrl}/sessions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        return unwrapResponse<Session>(response);
      },
      async delete({ path }: { path: { id: string } }) {
        const response = await fetch(`${baseUrl}/sessions/${path.id}`, {
          method: "DELETE",
        });
        return unwrapResponse<boolean>(response);
      },
      async update({ path, body }: { path: { id: string }; body: UpdateSessionRequest }) {
        const response = await fetch(`${baseUrl}/sessions/${path.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        return unwrapResponse<Session>(response);
      },
      async init({ path, body }: { path: { id: string }; body: InitRequest }) {
        const response = await fetch(`${baseUrl}/sessions/${path.id}/init`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        return unwrapResponse<boolean>(response);
      },
      async abort({ path }: { path: { id: string } }) {
        const response = await fetch(`${baseUrl}/sessions/${path.id}/abort`, {
          method: "POST",
        });
        return unwrapResponse<boolean>(response);
      },
      async share({ path }: { path: { id: string } }) {
        const response = await fetch(`${baseUrl}/sessions/${path.id}/share`, {
          method: "POST",
        });
        return unwrapResponse<Session>(response);
      },
      async unshare({ path }: { path: { id: string } }) {
        const response = await fetch(`${baseUrl}/sessions/${path.id}/unshare`, {
          method: "POST",
        });
        return unwrapResponse<Session>(response);
      },
      async summarize({ path, body }: { path: { id: string }; body: SummarizeRequest }) {
        const response = await fetch(`${baseUrl}/sessions/${path.id}/summarize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        return unwrapResponse<boolean>(response);
      },
      async messages({ path }: { path: { id: string } }) {
        const response = await fetch(`${baseUrl}/sessions/${path.id}/messages`);
        return unwrapResponse<MessagesResponse>(response);
      },
      async message({ path }: { path: { id: string; message_id: string } }) {
        const response = await fetch(`${baseUrl}/sessions/${path.id}/messages/${path.message_id}`);
        return unwrapResponse<MessageResponse>(response);
      },
      async prompt({ path, body }: { path: { id: string }; body: PromptRequest }) {
        const response = await fetch(`${baseUrl}/sessions/${path.id}/prompt`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        return unwrapResponse(response);
      },
      async command({ path, body }: { path: { id: string }; body: CommandRequest }) {
        const response = await fetch(`${baseUrl}/sessions/${path.id}/command`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        return unwrapResponse(response);
      },
      async shell({ path, body }: { path: { id: string }; body: ShellRequest }) {
        const response = await fetch(`${baseUrl}/sessions/${path.id}/shell`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        return unwrapResponse(response);
      },
      async revert({ path, body }: { path: { id: string }; body: RevertRequest }) {
        const response = await fetch(`${baseUrl}/sessions/${path.id}/revert`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        return unwrapResponse<Session>(response);
      },
      async unrevert({ path }: { path: { id: string } }) {
        const response = await fetch(`${baseUrl}/sessions/${path.id}/unrevert`, {
          method: "POST",
        });
        return unwrapResponse<Session>(response);
      },
    },

    // ========================================
    // File Search APIs
    // ========================================
    find: {
      async text({ query }: { query: TextSearchRequest }) {
        const response = await fetch(`${baseUrl}/find/text`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(query),
        });
        return unwrapResponse<TextSearchResult[]>(response);
      },
      async files({ query }: { query: FileSearchRequest }) {
        const response = await fetch(`${baseUrl}/find/files`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(query),
        });
        return unwrapResponse<string[]>(response);
      },
      async symbols({ query }: { query: SymbolSearchRequest }) {
        const response = await fetch(`${baseUrl}/find/symbols`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(query),
        });
        return unwrapResponse<Symbol[]>(response);
      },
    },

    // ========================================
    // File APIs
    // ========================================
    file: {
      async read({ query }: { query: FileReadRequest }) {
        const response = await fetch(`${baseUrl}/file/read`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(query),
        });
        return unwrapResponse<FileReadResponse>(response);
      },
      async status({ query }: { query?: FileStatusRequest }) {
        const response = await fetch(`${baseUrl}/file/status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(query || {}),
        });
        return unwrapResponse<FileStatus[]>(response);
      },
    },

    // ========================================
    // Auth APIs
    // ========================================
    auth: {
      async set({ path, body }: { path: { id: string }; body: AuthSetRequest }) {
        const response = await fetch(`${baseUrl}/auth/${path.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        return unwrapResponse<boolean>(response);
      },
    },

    // ========================================
    // Event APIs (SSE)
    // ========================================
    event: {
      async subscribe() {
        try {
          const response = await fetch(`${baseUrl}/events`);
          if (!response.ok) {
            return { data: null, error: await response.json() };
          }
          // SSE endpoint returns stream directly, not wrapped
          return { data: { stream: response.body }, error: null };
        } catch (error) {
          return { data: null, error };
        }
      },
    },

    // ========================================
    // Permission APIs
    // ========================================
    async postSessionByIdPermissionsByPermissionId({
      path,
      body,
    }: {
      path: { id: string; permission_id: string };
      body: PermissionResponse;
    }) {
      const response = await fetch(`${baseUrl}/sessions/${path.id}/permissions/${path.permission_id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return unwrapResponse<boolean>(response);
    },
  };
}

/**
 * Helper function to check if the OpenCode server is available.
 */
export async function isServerAvailable(workspaceId: string | null = null): Promise<boolean> {
  try {
    const baseUrl = getBaseUrl(workspaceId);
    const response = await fetch(`${baseUrl}/config`, {
      method: "HEAD",
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Helper function to get server configuration.
 */
export async function getServerInfo(workspaceId: string | null = null) {
  try {
    const client = createOpencodeClient(workspaceId);
    const { data, error } = await client.config.get();
    if (error) {
      console.error("Failed to get server info:", error);
      return null;
    }
    return data;
  } catch (err) {
    console.error("Failed to connect to OpenCode server:", err);
    return null;
  }
}
