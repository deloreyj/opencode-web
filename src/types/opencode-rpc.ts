import type { RpcTarget } from "capnweb";
import type { 
  Agent, 
  Config, 
  Provider,
  Session, 
  Project, 
  PathInfo,
  PromptRequest,
  MessagesResponse,
} from "./opencode-schemas";

/**
 * Main OpenCode RPC API
 * This interface defines all methods available over RPC
 */
export interface OpencodeRpcApi extends RpcTarget {
  // ===== App APIs =====
  getAgents(): Promise<Agent[]>;
  
  // ===== Config APIs =====
  getConfig(): Promise<Config>;
  getProviders(): Promise<{ 
    providers: Provider[], 
    default: Record<string, string> 
  }>;
  
  // ===== Project APIs =====
  listProjects(): Promise<Project[]>;
  getCurrentProject(): Promise<Project>;
  
  // ===== Path APIs =====
  getPath(): Promise<PathInfo>;
  
  // ===== Session APIs =====
  listSessions(): Promise<Session[]>;
  getSession(id: string): Promise<Session>;
  createSession(title: string): Promise<Session>;
  deleteSession(id: string): Promise<boolean>;
  
  // ===== Message APIs =====
  getMessages(sessionId: string): Promise<MessagesResponse>;
  sendPrompt(sessionId: string, request: PromptRequest): Promise<void>;
  abortSession(sessionId: string): Promise<boolean>;
}

/**
 * Type helper for RPC method results
 */
export type RpcResult<T> = Promise<T>;
