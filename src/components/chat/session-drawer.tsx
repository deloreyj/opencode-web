/**
 * Session Drawer Component - Mobile First
 * Responsive drawer for session management
 */

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { PlusIcon, MessageSquareIcon, Loader2, XIcon, Trash2Icon } from "lucide-react";
import type { Session } from "@/lib/opencode-client";
import { cn } from "@/lib/utils";

interface SessionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessions: Session[];
  currentSessionId?: string;
  onSelectSession: (sessionId: string) => void;
  onCreateSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  isLoading?: boolean;
}

export function SessionDrawer({
  open,
  onOpenChange,
  sessions,
  currentSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  isLoading,
}: SessionDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle>Conversations</DrawerTitle>
              <DrawerDescription>
                {sessions.length} {sessions.length === 1 ? "conversation" : "conversations"}
              </DrawerDescription>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <XIcon className="size-4" />
                <span className="sr-only">Close</span>
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        {/* New Chat Button */}
        <div className="border-b px-4 py-3">
          <Button
            onClick={onCreateSession}
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            <PlusIcon className="mr-2 size-5" />
            New Chat
          </Button>
        </div>

        {/* Sessions List */}
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-1 py-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                <MessageSquareIcon className="size-12 text-muted-foreground" />
                <div>
                  <p className="font-medium text-muted-foreground">
                    No conversations yet
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Create a new chat to get started
                  </p>
                </div>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className={cn(
                    "group flex min-w-0 w-full items-start gap-2 rounded-lg px-3 py-3 transition-colors hover:bg-accent",
                    currentSessionId === session.id && "bg-accent"
                  )}
                >
                  <button
                    onClick={() => onSelectSession(session.id)}
                    className="flex min-w-0 flex-1 items-start gap-2 overflow-hidden text-left"
                  >
                    <MessageSquareIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <p className="truncate font-medium leading-tight">
                        {session.title}
                      </p>
                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {new Date(session.time.created).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                  >
                    <Trash2Icon className="size-4 text-destructive" />
                    <span className="sr-only">Delete conversation</span>
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <DrawerFooter className="border-t pt-4">
          <DrawerClose asChild>
            <Button variant="outline" size="lg">
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
