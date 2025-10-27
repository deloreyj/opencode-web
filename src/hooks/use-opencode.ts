/**
 * React hooks for interacting with OpenCode server
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { opencodeClient } from "@/lib/opencode-client";
import type { ChatMessageInput } from "@/lib/opencode-client";

/**
 * Query key factory for OpenCode queries
 */
export const opencodeKeys = {
  all: ["opencode"] as const,
  sessions: () => [...opencodeKeys.all, "sessions"] as const,
  session: (id: string) => [...opencodeKeys.sessions(), id] as const,
  messages: (sessionId: string) =>
    [...opencodeKeys.session(sessionId), "messages"] as const,
  config: () => [...opencodeKeys.all, "config"] as const,
  providers: () => [...opencodeKeys.all, "providers"] as const,
  serverInfo: () => [...opencodeKeys.all, "server-info"] as const,
};

/**
 * Hook to get server info (config)
 */
export function useServerInfo() {
  return useQuery({
    queryKey: opencodeKeys.serverInfo(),
    queryFn: async () => {
      const { data, error } = await opencodeClient.config.get();
      if (error) throw error;
      return data;
    },
    staleTime: 60 * 1000, // 1 minute
  });
}

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
 * Hook to create a new session
 */
export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { title?: string; parentID?: string }) => {
      const { data, error } = await opencodeClient.session.create({
        body: params,
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
 * Hook to send a chat message
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      sessionId: string;
      message: ChatMessageInput;
    }) => {
      const { data, error } = await opencodeClient.session.prompt({
        path: { id: params.sessionId },
        body: params.message,
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
