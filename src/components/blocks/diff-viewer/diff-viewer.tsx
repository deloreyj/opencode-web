import { Diff, Hunk } from "@/components/ui/diff";
import { Button } from "@/components/ui/button";
import { GitBranchIcon } from "lucide-react";

import {
  CollapsibleCard,
  CollapsibleCardHeader,
  CollapsibleCardTitle,
  CollapsibleCardContent,
} from "@/components/ui/collapsible-card";

import { parseDiff, ParseOptions } from "@/components/ui/diff/utils/parse";

export function DiffViewer({
  patch,
  options = {},
  stagedFiles = new Set<string>(),
  onStageFile,
  onUnstageFile,
  isStaging = false,
}: {
  patch: string;
  options?: Partial<ParseOptions>;
  stagedFiles?: Set<string>;
  onStageFile?: (filepath: string) => void;
  onUnstageFile?: (filepath: string) => void;
  isStaging?: boolean;
}) {
  const files = parseDiff(patch, options);

  if (files.length === 0) {
    return (
      <div className="my-4 p-8 text-center text-muted-foreground">
        No changes to display
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {files.map((file, index) => {
        const isStaged = stagedFiles.has(file.newPath);

        return (
          <CollapsibleCard
            key={file.newPath}
            data-section-id={`diff-viewer-${index}`}
            id={`diff-viewer-${index}`}
            className="text-[0.8rem] w-full"
            title={file.newPath}
            defaultOpen={index === 0}
          >
            <CollapsibleCardHeader>
              <CollapsibleCardTitle title={file.newPath}>
                {file.newPath}
              </CollapsibleCardTitle>
              {onStageFile && onUnstageFile && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    isStaged ? onUnstageFile(file.newPath) : onStageFile(file.newPath);
                  }}
                  disabled={isStaging}
                  className="ml-auto h-8 w-8 shrink-0"
                  title={isStaged ? "Unstage file" : "Stage file"}
                >
                  <GitBranchIcon className={`size-4 ${isStaged ? 'text-green-600' : 'text-red-600'}`} />
                </Button>
              )}
            </CollapsibleCardHeader>
            <CollapsibleCardContent>
              <Diff fileName={file.newPath} hunks={file.hunks} type={file.type}>
                {file.hunks.map((hunk) => (
                  <Hunk key={hunk.content} hunk={hunk} />
                ))}
              </Diff>
            </CollapsibleCardContent>
          </CollapsibleCard>
        );
      })}
    </div>
  );
}
