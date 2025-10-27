/**
 * Session Sidebar Component
 * Displays list of chat sessions with ability to create/select/delete
 */

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusIcon, MessageSquareIcon, Loader2 } from "lucide-react";
import type { Session } from "@/lib/opencode-client";
import { cn } from "@/lib/utils";

interface SessionSidebarProps {
  sessions: Session[];
  currentSessionId?: string;
  onSelectSession: (sessionId: string) => void;
  onCreateSession: () => void;
  isLoading?: boolean;
}

export function SessionSidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onCreateSession,
  isLoading,
}: SessionSidebarProps) {
  return (
    <div className="flex w-64 flex-col border-r bg-card">
      {/* Header */}
      <div className="border-b p-4">
        <Button
          onClick={onCreateSession}
          className="w-full"
          size="sm"
          disabled={isLoading}
        >
          <PlusIcon className="mr-2 size-4" />
          New Chat
        </Button>
      </div>

      {/* Sessions List */}
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <MessageSquareIcon className="size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No conversations yet
              </p>
              <p className="text-xs text-muted-foreground">
                Create a new chat to get started
              </p>
            </div>
          ) : (
            sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent",
                  currentSessionId === session.id && "bg-accent"
                )}
              >
                <MessageSquareIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="flex-1 overflow-hidden">
                  <p className="truncate font-medium">{session.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {new Date(session.time.created).toLocaleDateString()}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-4">
        <p className="text-xs text-muted-foreground">
          {sessions.length} {sessions.length === 1 ? "conversation" : "conversations"}
        </p>
      </div>
    </div>
  );
}
