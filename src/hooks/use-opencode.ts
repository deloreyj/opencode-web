/**
 * React hooks for interacting with OpenCode server
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOpencodeClient } from "@/hooks/use-opencode-client";
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
  AuthSetRequest,
} from "@/types/opencode-schemas";

/**
 * Query key factory for OpenCode queries
 */
export const opencodeKeys = {
  all: ["opencode"] as const,

  // App
  agents: () => [...opencodeKeys.all, "agents"] as const,

  // Project
  projects: () => [...opencodeKeys.all, "projects"] as const,
  currentProject: () => [...opencodeKeys.all, "current-project"] as const,

  // Path
  path: () => [...opencodeKeys.all, "path"] as const,

  // Config
  config: () => [...opencodeKeys.all, "config"] as const,
  providers: () => [...opencodeKeys.all, "providers"] as const,

  // Sessions
  sessions: () => [...opencodeKeys.all, "sessions"] as const,
  session: (id: string) => [...opencodeKeys.sessions(), id] as const,
  sessionChildren: (id: string) => [...opencodeKeys.session(id), "children"] as const,

  // Messages
  messages: (sessionId: string) => [...opencodeKeys.session(sessionId), "messages"] as const,
  message: (sessionId: string, messageId: string) =>
    [...opencodeKeys.messages(sessionId), messageId] as const,

  // Files
  fileStatus: (path?: string) => [...opencodeKeys.all, "file-status", path] as const,
};

// ========================================
// App Hooks
// ========================================

/**
 * Hook to write a log entry
 */
export function useAppLog() {
  const client = useOpencodeClient();
  return useMutation({
    mutationFn: async (request: LogRequest) => {
      const { data, error } = await client.app.log(request);
      if (error) throw error;
      return data;
    },
  });
}

/**
 * Hook to get available agents
 */
export function useAgents() {
  const client = useOpencodeClient();
  return useQuery({
    queryKey: opencodeKeys.agents(),
    queryFn: async () => {
      const { data, error } = await client.app.agents();
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ========================================
// Project Hooks
// ========================================

/**
 * Hook to list all projects
 */
export function useProjects() {
  const client = useOpencodeClient();
  return useQuery({
    queryKey: opencodeKeys.projects(),
    queryFn: async () => {
      const { data, error } = await client.project.list();
      if (error) throw error;
      return data;
    },
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to get current project
 */
export function useCurrentProject() {
  const client = useOpencodeClient();
  return useQuery({
    queryKey: opencodeKeys.currentProject(),
    queryFn: async () => {
      const { data, error } = await client.project.current();
      if (error) throw error;
      return data;
    },
    staleTime: 60 * 1000, // 1 minute
  });
}

// ========================================
// Path Hooks
// ========================================

/**
 * Hook to get current path
 */
export function usePath() {
  const client = useOpencodeClient();
  return useQuery({
    queryKey: opencodeKeys.path(),
    queryFn: async () => {
      const { data, error } = await client.path.get();
      if (error) throw error;
      return data;
    },
    staleTime: 60 * 1000, // 1 minute
  });
}

// ========================================
// Config Hooks
// ========================================

/**
 * Hook to get OpenCode configuration
 */
export function useOpencodeConfig() {
  const client = useOpencodeClient();
  return useQuery({
    queryKey: opencodeKeys.config(),
    queryFn: async () => {
      const { data, error } = await client.config.get();
      if (error) throw error;
      return data;
    },
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to get available providers
 */
export function useProviders() {
  const client = useOpencodeClient();
  return useQuery({
    queryKey: opencodeKeys.providers(),
    queryFn: async () => {
      const { data, error } = await client.config.providers();
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ========================================
// Session Hooks
// ========================================

/**
 * Hook to list all sessions
 */
export function useSessions() {
  const client = useOpencodeClient();
  return useQuery({
    queryKey: opencodeKeys.sessions(),
    queryFn: async () => {
      const { data, error } = await client.session.list();
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 1000, // 5 seconds
  });
}

/**
 * Hook to get a specific session
 */
export function useSession(sessionId: string | undefined) {
  const client = useOpencodeClient();
  return useQuery({
    queryKey: sessionId ? opencodeKeys.session(sessionId) : [],
    queryFn: async () => {
      if (!sessionId) return null;
      const { data, error } = await client.session.get({
        path: { id: sessionId },
      });
      if (error) throw error;
      return data;
    },
    enabled: !!sessionId,
  });
}

/**
 * Hook to get child sessions
 */
export function useSessionChildren(sessionId: string | undefined) {
  const client = useOpencodeClient();
  return useQuery({
    queryKey: sessionId ? opencodeKeys.sessionChildren(sessionId) : [],
    queryFn: async () => {
      if (!sessionId) return [];
      const { data, error } = await client.session.children({
        path: { id: sessionId },
      });
      if (error) throw error;
      return data;
    },
    enabled: !!sessionId,
  });
}

/**
 * Hook to create a new session
 */
export function useCreateSession() {
  const client = useOpencodeClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateSessionRequest) => {
      const { data, error } = await client.session.create({
        body: request,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: opencodeKeys.sessions() });
    },
  });
}

/**
 * Hook to delete a session
 */
export function useDeleteSession() {
  const client = useOpencodeClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { data, error } = await client.session.delete({
        path: { id: sessionId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: opencodeKeys.sessions() });
    },
  });
}

/**
 * Hook to update a session
 */
export function useUpdateSession() {
  const client = useOpencodeClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { sessionId: string; request: UpdateSessionRequest }) => {
      const { data, error } = await client.session.update({
        path: { id: params.sessionId },
        body: params.request,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: opencodeKeys.session(variables.sessionId) });
      queryClient.invalidateQueries({ queryKey: opencodeKeys.sessions() });
    },
  });
}

/**
 * Hook to initialize a session (create AGENTS.md)
 */
export function useInitSession() {
  const client = useOpencodeClient();
  return useMutation({
    mutationFn: async (params: { sessionId: string; request: InitRequest }) => {
      const { data, error } = await client.session.init({
        path: { id: params.sessionId },
        body: params.request,
      });
      if (error) throw error;
      return data;
    },
  });
}

/**
 * Hook to abort a session
 */
export function useAbortSession() {
  const client = useOpencodeClient();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { data, error } = await client.session.abort({
        path: { id: sessionId },
      });
      if (error) throw error;
      return data;
    },
  });
}

/**
 * Hook to share a session
 */
export function useShareSession() {
  const client = useOpencodeClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { data, error } = await client.session.share({
        path: { id: sessionId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: opencodeKeys.session(sessionId) });
    },
  });
}

/**
 * Hook to unshare a session
 */
export function useUnshareSession() {
  const client = useOpencodeClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { data, error } = await client.session.unshare({
        path: { id: sessionId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: opencodeKeys.session(sessionId) });
    },
  });
}

/**
 * Hook to summarize a session
 */
export function useSummarizeSession() {
  const client = useOpencodeClient();
  return useMutation({
    mutationFn: async (params: { sessionId: string; request: SummarizeRequest }) => {
      const { data, error } = await client.session.summarize({
        path: { id: params.sessionId },
        body: params.request,
      });
      if (error) throw error;
      return data;
    },
  });
}

// ========================================
// Message Hooks
// ========================================

/**
 * Hook to get messages for a session
 */
export function useMessages(sessionId: string | undefined) {
  const client = useOpencodeClient();
  return useQuery({
    queryKey: sessionId ? opencodeKeys.messages(sessionId) : [],
    queryFn: async () => {
      if (!sessionId) return [];
      console.log('[useMessages] Fetching messages for session:', sessionId);
      const { data, error } = await client.session.messages({
        path: { id: sessionId },
      });
      console.log('[useMessages] Response - data:', data, 'error:', error);
      if (error) {
        console.error('[useMessages] Error fetching messages:', error);
        throw error;
      }
      console.log('[useMessages] Returning data:', Array.isArray(data) ? `array with ${data.length} messages` : typeof data);
      return data;
    },
    enabled: !!sessionId,
    refetchInterval: false, // Use SSE for real-time updates instead
  });
}

/**
 * Hook to get a specific message
 */
export function useMessage(sessionId: string | undefined, messageId: string | undefined) {
  const client = useOpencodeClient();
  return useQuery({
    queryKey: sessionId && messageId ? opencodeKeys.message(sessionId, messageId) : [],
    queryFn: async () => {
      if (!sessionId || !messageId) return null;
      const { data, error } = await client.session.message({
        path: { id: sessionId, message_id: messageId },
      });
      if (error) throw error;
      return data;
    },
    enabled: !!(sessionId && messageId),
  });
}

/**
 * Hook to send a prompt message
 */
export function useSendMessage() {
  const client = useOpencodeClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { sessionId: string; request: PromptRequest }) => {
      const { data, error } = await client.session.prompt({
        path: { id: params.sessionId },
        body: params.request,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: opencodeKeys.messages(variables.sessionId),
      });
    },
  });
}

/**
 * Hook to send a command
 */
export function useSendCommand() {
  const client = useOpencodeClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { sessionId: string; request: CommandRequest }) => {
      const { data, error } = await client.session.command({
        path: { id: params.sessionId },
        body: params.request,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: opencodeKeys.messages(variables.sessionId),
      });
    },
  });
}

/**
 * Hook to run a shell command
 */
export function useShellCommand() {
  const client = useOpencodeClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { sessionId: string; request: ShellRequest }) => {
      const { data, error } = await client.session.shell({
        path: { id: params.sessionId },
        body: params.request,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: opencodeKeys.messages(variables.sessionId),
      });
    },
  });
}

/**
 * Hook to revert a message
 */
export function useRevertMessage() {
  const client = useOpencodeClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { sessionId: string; request: RevertRequest }) => {
      const { data, error } = await client.session.revert({
        path: { id: params.sessionId },
        body: params.request,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: opencodeKeys.messages(variables.sessionId),
      });
      queryClient.invalidateQueries({
        queryKey: opencodeKeys.session(variables.sessionId),
      });
    },
  });
}

/**
 * Hook to unrevert messages
 */
export function useUnrevertMessage() {
  const client = useOpencodeClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { data, error } = await client.session.unrevert({
        path: { id: sessionId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({
        queryKey: opencodeKeys.messages(sessionId),
      });
      queryClient.invalidateQueries({
        queryKey: opencodeKeys.session(sessionId),
      });
    },
  });
}

// ========================================
// File Search Hooks
// ========================================

/**
 * Hook to search for text in files
 */
export function useTextSearch() {
  const client = useOpencodeClient();
  return useMutation({
    mutationFn: async (request: TextSearchRequest) => {
      const { data, error } = await client.find.text({ query: request });
      if (error) throw error;
      return data;
    },
  });
}

/**
 * Hook to find files by name
 */
export function useFileSearch() {
  const client = useOpencodeClient();
  return useMutation({
    mutationFn: async (request: FileSearchRequest) => {
      const { data, error } = await client.find.files({ query: request });
      if (error) throw error;
      return data;
    },
  });
}

/**
 * Hook to find workspace symbols
 */
export function useSymbolSearch() {
  const client = useOpencodeClient();
  return useMutation({
    mutationFn: async (request: SymbolSearchRequest) => {
      const { data, error } = await client.find.symbols({ query: request });
      if (error) throw error;
      return data;
    },
  });
}

// ========================================
// File Hooks
// ========================================

/**
 * Hook to read a file
 */
export function useFileRead() {
  const client = useOpencodeClient();
  return useMutation({
    mutationFn: async (request: FileReadRequest) => {
      const { data, error } = await client.file.read({ query: request });
      if (error) throw error;
      return data;
    },
  });
}

/**
 * Hook to get file status
 */
export function useFileStatus(path?: string) {
  const client = useOpencodeClient();
  return useQuery({
    queryKey: opencodeKeys.fileStatus(path),
    queryFn: async () => {
      const { data, error } = await client.file.status({
        query: path ? { path } : undefined
      });
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 1000, // 5 seconds
  });
}

// ========================================
// Auth Hooks
// ========================================

/**
 * Hook to set authentication credentials
 */
export function useAuthSet() {
  const client = useOpencodeClient();
  return useMutation({
    mutationFn: async (params: { providerId: string; request: AuthSetRequest }) => {
      const { data, error } = await client.auth.set({
        path: { id: params.providerId },
        body: params.request,
      });
      if (error) throw error;
      return data;
    },
  });
}

// ========================================
// Permission Hooks
// ========================================

/**
 * Hook to respond to a permission request
 */
export function usePermissionResponse() {
  const client = useOpencodeClient();
  return useMutation({
    mutationFn: async (params: {
      sessionId: string;
      permissionId: string;
      response: PermissionResponse;
    }) => {
      const { data, error } = await client.postSessionByIdPermissionsByPermissionId({
        path: { id: params.sessionId, permission_id: params.permissionId },
        body: params.response,
      });
      if (error) throw error;
      return data;
    },
  });
}

// ========================================
// Session Usage Hooks
// ========================================

export interface SessionUsage {
  totalCost: number;
  totalTokens: {
    input: number;
    output: number;
    reasoning: number;
    cache: {
      read: number;
      write: number;
    };
  };
}

/**
 * Hook to calculate session usage (cost and tokens) from messages
 * Aggregates data from all assistant messages in the session
 */
export function useSessionUsage(sessionId: string | undefined): SessionUsage | null {
  const { data: messages } = useMessages(sessionId);

  if (!messages || messages.length === 0) {
    return null;
  }

  // Aggregate usage from all assistant messages
  const usage = messages.reduce<SessionUsage>(
    (acc, msg) => {
      // Only count assistant messages
      if (msg.info.role !== "assistant") {
        return acc;
      }

      // Assistant messages have cost and tokens
      const assistantMsg = msg.info;

      return {
        totalCost: acc.totalCost + (assistantMsg.cost || 0),
        totalTokens: {
          input: acc.totalTokens.input + (assistantMsg.tokens?.input || 0),
          output: acc.totalTokens.output + (assistantMsg.tokens?.output || 0),
          reasoning: acc.totalTokens.reasoning + (assistantMsg.tokens?.reasoning || 0),
          cache: {
            read: acc.totalTokens.cache.read + (assistantMsg.tokens?.cache?.read || 0),
            write: acc.totalTokens.cache.write + (assistantMsg.tokens?.cache?.write || 0),
          },
        },
      };
    },
    {
      totalCost: 0,
      totalTokens: {
        input: 0,
        output: 0,
        reasoning: 0,
        cache: {
          read: 0,
          write: 0,
        },
      },
    }
  );

  return usage;
}
