import { newHttpBatchRpcSession, type RpcStub } from "capnweb";
import type { OpencodeRpcApi } from "@/types/opencode-rpc";

/**
 * Get the RPC endpoint URL based on workspace ID
 */
function getRpcUrl(workspaceId: string | null): string {
  if (workspaceId) {
    return `/api/workspaces/${workspaceId}/opencode-rpc`;
  }
  return "/api/opencode-rpc";
}

/**
 * Create a new HTTP batch RPC session
 * Each session batches all RPC calls until the first await
 * 
 * Usage:
 * ```ts
 * using api = createRpcSession(workspaceId);
 * 
 * // Queue up calls (don't await yet!)
 * const agentsPromise = api.getAgents();
 * const configPromise = api.getConfig();
 * const sessionsPromise = api.listSessions();
 * 
 * // NOW await - single HTTP request!
 * const [agents, config, sessions] = await Promise.all([
 *   agentsPromise,
 *   configPromise,
 *   sessionsPromise
 * ]);
 * ```
 */
export function createRpcSession(workspaceId: string | null): RpcStub<OpencodeRpcApi> {
  const url = getRpcUrl(workspaceId);
  console.log("[RPC Client] Creating batch session for:", url);
  return newHttpBatchRpcSession<OpencodeRpcApi>(url);
}

/**
 * Type helper for RPC session with disposal
 */
export type RpcSession = RpcStub<OpencodeRpcApi> & Disposable;
