import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { createRpcSession } from "./opencode-rpc-client";
import type { Agent, Config, Provider, Session } from "@/types/opencode-schemas";

interface RpcState {
  agents: Agent[] | null;
  config: Config | null;
  providers: { providers: Provider[], default: Record<string, string> } | null;
  sessions: Session[] | null;
  loading: boolean;
  error: Error | null;
}

interface RpcContextValue extends RpcState {
  refetchAll: () => Promise<void>;
  refetchSessions: () => Promise<void>;
  createSession: (title: string) => Promise<Session>;
  deleteSession: (id: string) => Promise<void>;
}

const RpcContext = createContext<RpcContextValue | null>(null);

/**
 * RPC Provider
 * Manages RPC state and provides batch fetching capabilities
 */
export function RpcProvider({ 
  children, 
  workspaceId 
}: { 
  children: ReactNode;
  workspaceId: string | null;
}) {
  const [state, setState] = useState<RpcState>({
    agents: null,
    config: null,
    providers: null,
    sessions: null,
    loading: false,
    error: null,
  });
  
  /**
   * ⭐ THIS IS THE MAGIC ⭐
   * Fetch all initial data in a SINGLE HTTP request using Cap'n Web batch
   */
  const refetchAll = useCallback(async () => {
    if (!workspaceId) {
      setState(s => ({ ...s, agents: null, config: null, providers: null, sessions: null }));
      return;
    }
    
    setState(s => ({ ...s, loading: true, error: null }));
    
    try {
      // Create an HTTP batch session
      using api = createRpcSession(workspaceId);
      
      // Queue up all the calls (don't await yet!)
      const agentsPromise = api.getAgents();
      const configPromise = api.getConfig();
      const providersPromise = api.getProviders();
      const sessionsPromise = api.listSessions();
      
      // NOW await all at once - this sends ONE HTTP request containing 4 RPC calls!
      console.log("[RPC Context] Fetching all data in batch...");
      const results = await Promise.all([
        agentsPromise,
        configPromise,
        providersPromise,
        sessionsPromise,
      ]);
      
      const [agents, config, providers, sessions] = results;
      
      console.log("[RPC Context] Batch complete!");
      
      setState({ 
        agents, 
        config, 
        providers, 
        sessions, 
        loading: false, 
        error: null 
      });
    } catch (error) {
      console.error("[RPC Context] Batch failed:", error);
      setState(s => ({ 
        ...s, 
        loading: false, 
        error: error as Error 
      }));
    }
  }, [workspaceId]);
  
  /**
   * Refetch just sessions (single RPC call)
   */
  const refetchSessions = useCallback(async () => {
    if (!workspaceId) return;
    
    setState(s => ({ ...s, loading: true }));
    try {
      using api = createRpcSession(workspaceId);
      const sessions = await api.listSessions();
      
      setState(s => ({ 
        ...s, 
        sessions, 
        loading: false, 
        error: null 
      }));
    } catch (error) {
      console.error("[RPC Context] Failed to fetch sessions:", error);
      setState(s => ({ 
        ...s, 
        loading: false, 
        error: error as Error 
      }));
    }
  }, [workspaceId]);
  
  /**
   * Create a session and refetch the list
   */
  const createSession = useCallback(async (title: string) => {
    if (!workspaceId) throw new Error("No workspace selected");
    
    setState(s => ({ ...s, loading: true }));
    try {
      using api = createRpcSession(workspaceId);
      
      // Create session and refetch list in one batch!
      const newSessionPromise = api.createSession(title);
      const sessionsPromise = api.listSessions();
      
      const [newSession, sessions] = await Promise.all([
        newSessionPromise,
        sessionsPromise,
      ]);
      
      setState(s => ({ 
        ...s, 
        sessions, 
        loading: false, 
        error: null 
      }));
      
      return newSession;
    } catch (error) {
      console.error("[RPC Context] Failed to create session:", error);
      setState(s => ({ 
        ...s, 
        loading: false, 
        error: error as Error 
      }));
      throw error;
    }
  }, [workspaceId]);
  
  /**
   * Delete a session and refetch the list
   */
  const deleteSession = useCallback(async (id: string) => {
    if (!workspaceId) throw new Error("No workspace selected");
    
    setState(s => ({ ...s, loading: true }));
    try {
      using api = createRpcSession(workspaceId);
      
      // Delete and refetch in one batch!
      const deletePromise = api.deleteSession(id);
      const sessionsPromise = api.listSessions();
      
      await Promise.all([deletePromise, sessionsPromise]);
      const sessions = await sessionsPromise;
      
      setState(s => ({ 
        ...s, 
        sessions, 
        loading: false, 
        error: null 
      }));
    } catch (error) {
      console.error("[RPC Context] Failed to delete session:", error);
      setState(s => ({ 
        ...s, 
        loading: false, 
        error: error as Error 
      }));
      throw error;
    }
  }, [workspaceId]);
  
  // Auto-fetch when workspace changes
  useEffect(() => {
    refetchAll();
  }, [refetchAll]);
  
  return (
    <RpcContext.Provider value={{
      ...state,
      refetchAll,
      refetchSessions,
      createSession,
      deleteSession,
    }}>
      {children}
    </RpcContext.Provider>
  );
}

/**
 * Hook to access RPC data and methods
 */
export function useRpcData() {
  const context = useContext(RpcContext);
  if (!context) {
    throw new Error("useRpcData must be used within RpcProvider");
  }
  return context;
}
