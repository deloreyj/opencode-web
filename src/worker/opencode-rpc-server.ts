import { RpcTarget } from "capnweb";
import { createOpencodeClient } from "@opencode-ai/sdk/client";
import type { OpencodeRpcApi } from "../types/opencode-rpc";
import type { PromptRequest } from "../types/opencode-schemas";

/**
 * OpenCode RPC Server
 * Implements the RPC API by proxying to the OpenCode SDK client
 */
export class OpencodeRpcServer extends RpcTarget implements OpencodeRpcApi {
  private client: ReturnType<typeof createOpencodeClient>;
  
  constructor(opencodeBaseUrl: string) {
    super();
    
    console.log("[RPC Server] Initializing with base URL:", opencodeBaseUrl);
    
    this.client = createOpencodeClient({
      baseUrl: opencodeBaseUrl,
      throwOnError: false,
    });
  }
  
  // ===== App APIs =====
  
  async getAgents() {
    console.log("[RPC] getAgents()");
    const { data, error } = await this.client.app.agents();
    if (error) throw error;
    return data!;
  }
  
  // ===== Config APIs =====
  
  async getConfig() {
    console.log("[RPC] getConfig()");
    const { data, error } = await this.client.config.get();
    if (error) throw error;
    return data!;
  }
  
  async getProviders() {
    console.log("[RPC] getProviders()");
    const { data, error } = await this.client.config.providers();
    if (error) throw error;
    return data!;
  }
  
  // ===== Project APIs =====
  
  async listProjects() {
    console.log("[RPC] listProjects()");
    const { data, error } = await this.client.project.list();
    if (error) throw error;
    return data!;
  }
  
  async getCurrentProject() {
    console.log("[RPC] getCurrentProject()");
    const { data, error } = await this.client.project.current();
    if (error) throw error;
    return data!;
  }
  
  // ===== Path APIs =====
  
  async getPath() {
    console.log("[RPC] getPath()");
    const { data, error } = await this.client.path.get();
    if (error) throw error;
    return data as any;
  }
  
  // ===== Session APIs =====
  
  async listSessions() {
    console.log("[RPC] listSessions()");
    const { data, error } = await this.client.session.list();
    if (error) throw error;
    return data!;
  }
  
  async getSession(id: string) {
    console.log("[RPC] getSession()", id);
    const { data, error } = await this.client.session.get({ path: { id } });
    if (error) throw error;
    return data!;
  }
  
  async createSession(title: string) {
    console.log("[RPC] createSession()", title);
    const { data, error } = await this.client.session.create({ 
      body: { title } 
    });
    if (error) throw error;
    return data!;
  }
  
  async deleteSession(id: string) {
    console.log("[RPC] deleteSession()", id);
    const { data, error } = await this.client.session.delete({ path: { id } });
    if (error) throw error;
    return data!;
  }
  
  // ===== Message APIs =====
  
  async getMessages(sessionId: string) {
    console.log("[RPC] getMessages()", sessionId);
    const { data, error } = await this.client.session.messages({ 
      path: { id: sessionId } 
    });
    if (error) throw error;
    return data!;
  }
  
  async sendPrompt(sessionId: string, request: PromptRequest) {
    console.log("[RPC] sendPrompt()", sessionId, request);
    const { error } = await this.client.session.prompt({ 
      path: { id: sessionId },
      body: request
    });
    if (error) throw error;
  }
  
  async abortSession(sessionId: string) {
    console.log("[RPC] abortSession()", sessionId);
    const { data, error } = await this.client.session.abort({ 
      path: { id: sessionId } 
    });
    if (error) throw error;
    return data!;
  }
}
