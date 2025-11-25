/**
 * RPC Test Page
 * Simple page to test Cap'n Web RPC integration
 */

import { RpcProvider, useRpcData } from "@/lib/opencode-rpc-context";
import { useWorkspace } from "@/lib/workspace-context";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ai-elements/loader";
import { toast } from "sonner";

function RpcTestContent() {
  const { activeWorkspaceId } = useWorkspace();
  const { 
    agents, 
    config, 
    providers,
    sessions, 
    loading, 
    error,
    refetchAll,
    createSession,
    deleteSession,
  } = useRpcData();
  
  return (
    <div className="h-full overflow-auto">
      <div className="container mx-auto p-8">
        <h1 className="mb-6 font-bold text-3xl">Cap'n Web RPC Test</h1>
      
      <div className="mb-6 rounded-lg border p-4">
        <h2 className="mb-2 font-semibold text-xl">Status</h2>
        <p>Workspace: <strong>{activeWorkspaceId || "None"}</strong></p>
        <p>Loading: <strong>{loading ? "Yes" : "No"}</strong></p>
        {error && (
          <p className="text-red-600">Error: {error.message}</p>
        )}
      </div>
      
      <div className="mb-4 flex gap-2">
        <Button onClick={refetchAll} disabled={loading || !activeWorkspaceId}>
          Refetch All (Batch)
        </Button>
        <Button 
          onClick={async () => {
            try {
              await createSession("Test Session " + Date.now());
              toast.success("Session created!");
            } catch (err) {
              toast.error("Failed: " + (err as Error).message);
            }
          }}
          disabled={loading || !activeWorkspaceId}
        >
          Create Session
        </Button>
      </div>
      
      {loading && <Loader />}
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Agents */}
        <div className="rounded-lg border p-4">
          <h2 className="mb-4 font-semibold text-xl">Agents ({agents?.length ?? 0})</h2>
          {agents && (
            <ul className="space-y-2">
              {agents.map((agent) => (
                <li key={agent.name} className="rounded bg-muted p-2 text-sm">
                  {agent.name} <span className="text-muted-foreground">({agent.mode})</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Config */}
        <div className="rounded-lg border p-4">
          <h2 className="mb-4 font-semibold text-xl">Config</h2>
          {config && (
            <div className="space-y-1 text-sm">
              <p>Loaded: <strong>Yes</strong></p>
              <pre className="mt-2 overflow-auto rounded bg-muted p-2 text-xs">
                {JSON.stringify(config, null, 2)}
              </pre>
            </div>
          )}
        </div>
        
        {/* Providers */}
        <div className="rounded-lg border p-4">
          <h2 className="mb-4 font-semibold text-xl">Providers ({providers?.providers.length ?? 0})</h2>
          {providers && (
            <ul className="space-y-2">
              {providers.providers.map((provider) => (
                <li key={provider.id} className="rounded bg-muted p-2 text-sm">
                  {provider.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Sessions */}
        <div className="rounded-lg border p-4">
          <h2 className="mb-4 font-semibold text-xl">Sessions ({sessions?.length ?? 0})</h2>
          {sessions && (
            <ul className="space-y-2">
              {sessions.map((session) => (
                <li key={session.id} className="flex items-center justify-between rounded bg-muted p-2 text-sm">
                  <span>{session.title}</span>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={async () => {
                      try {
                        await deleteSession(session.id);
                        toast.success("Session deleted!");
                      } catch (err) {
                        toast.error("Failed: " + (err as Error).message);
                      }
                    }}
                  >
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}

export function RpcTestPage() {
  const { activeWorkspaceId } = useWorkspace();
  
  return (
    <RpcProvider workspaceId={activeWorkspaceId}>
      <RpcTestContent />
    </RpcProvider>
  );
}
