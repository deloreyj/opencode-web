/**
 * React hooks for interacting with OpenCode server
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { opencodeClient } from "@/lib/opencode-client";
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
  return useMutation({
    mutationFn: async (request: LogRequest) => {
      const { data, error } = await opencodeClient.app.log(request);
      if (error) throw error;
      return data;
    },
  });
}

/**
 * Hook to get available agents
 */
export function useAgents() {
  return useQuery({
    queryKey: opencodeKeys.agents(),
    queryFn: async () => {
      const { data, error } = await opencodeClient.app.agents();
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
  return useQuery({
    queryKey: opencodeKeys.projects(),
    queryFn: async () => {
      const { data, error } = await opencodeClient.project.list();
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
  return useQuery({
    queryKey: opencodeKeys.currentProject(),
    queryFn: async () => {
      const { data, error } = await opencodeClient.project.current();
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
  return useQuery({
    queryKey: opencodeKeys.path(),
    queryFn: async () => {
      const { data, error } = await opencodeClient.path.get();
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
  return useQuery({
    queryKey: opencodeKeys.config(),
    queryFn: async () => {
      const { data, error } = await opencodeClient.config.get();
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
  return useQuery({
    queryKey: opencodeKeys.providers(),
    queryFn: async () => {
      const { data, error } = await opencodeClient.config.providers();
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
  return useQuery({
    queryKey: opencodeKeys.sessions(),
    queryFn: async () => {
      const { data, error } = await opencodeClient.session.list();
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
  return useQuery({
    queryKey: sessionId ? opencodeKeys.session(sessionId) : [],
    queryFn: async () => {
      if (!sessionId) return null;
      const { data, error } = await opencodeClient.session.get({
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
  return useQuery({
    queryKey: sessionId ? opencodeKeys.sessionChildren(sessionId) : [],
    queryFn: async () => {
      if (!sessionId) return [];
      const { data, error } = await opencodeClient.session.children({
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateSessionRequest) => {
      const { data, error } = await opencodeClient.session.create({
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { data, error } = await opencodeClient.session.delete({
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { sessionId: string; request: UpdateSessionRequest }) => {
      const { data, error } = await opencodeClient.session.update({
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
  return useMutation({
    mutationFn: async (params: { sessionId: string; request: InitRequest }) => {
      const { data, error } = await opencodeClient.session.init({
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
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { data, error } = await opencodeClient.session.abort({
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { data, error } = await opencodeClient.session.share({
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { data, error } = await opencodeClient.session.unshare({
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
  return useMutation({
    mutationFn: async (params: { sessionId: string; request: SummarizeRequest }) => {
      const { data, error } = await opencodeClient.session.summarize({
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
  return useQuery({
    queryKey: sessionId ? opencodeKeys.messages(sessionId) : [],
    queryFn: async () => {
      if (!sessionId) return [];
      const { data, error } = await opencodeClient.session.messages({
        path: { id: sessionId },
      });
      if (error) throw error;
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
  return useQuery({
    queryKey: sessionId && messageId ? opencodeKeys.message(sessionId, messageId) : [],
    queryFn: async () => {
      if (!sessionId || !messageId) return null;
      const { data, error } = await opencodeClient.session.message({
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { sessionId: string; request: PromptRequest }) => {
      const { data, error } = await opencodeClient.session.prompt({
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { sessionId: string; request: CommandRequest }) => {
      const { data, error } = await opencodeClient.session.command({
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { sessionId: string; request: ShellRequest }) => {
      const { data, error } = await opencodeClient.session.shell({
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { sessionId: string; request: RevertRequest }) => {
      const { data, error } = await opencodeClient.session.revert({
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { data, error } = await opencodeClient.session.unrevert({
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
  return useMutation({
    mutationFn: async (request: TextSearchRequest) => {
      const { data, error } = await opencodeClient.find.text({ query: request });
      if (error) throw error;
      return data;
    },
  });
}

/**
 * Hook to find files by name
 */
export function useFileSearch() {
  return useMutation({
    mutationFn: async (request: FileSearchRequest) => {
      const { data, error } = await opencodeClient.find.files({ query: request });
      if (error) throw error;
      return data;
    },
  });
}

/**
 * Hook to find workspace symbols
 */
export function useSymbolSearch() {
  return useMutation({
    mutationFn: async (request: SymbolSearchRequest) => {
      const { data, error } = await opencodeClient.find.symbols({ query: request });
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
  return useMutation({
    mutationFn: async (request: FileReadRequest) => {
      const { data, error } = await opencodeClient.file.read({ query: request });
      if (error) throw error;
      return data;
    },
  });
}

/**
 * Hook to get file status
 */
export function useFileStatus(path?: string) {
  return useQuery({
    queryKey: opencodeKeys.fileStatus(path),
    queryFn: async () => {
      const { data, error } = await opencodeClient.file.status({
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
  return useMutation({
    mutationFn: async (params: { providerId: string; request: AuthSetRequest }) => {
      const { data, error } = await opencodeClient.auth.set({
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
  return useMutation({
    mutationFn: async (params: {
      sessionId: string;
      permissionId: string;
      response: PermissionResponse;
    }) => {
      const { data, error } = await opencodeClient.postSessionByIdPermissionsByPermissionId({
        path: { id: params.sessionId, permission_id: params.permissionId },
        body: params.response,
      });
      if (error) throw error;
      return data;
    },
  });
}
