import { Diff, Hunk } from "@/components/ui/diff";

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
}: {
  patch: string;
  options?: Partial<ParseOptions>;
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
      {files.map((file, index) => (
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
          </CollapsibleCardHeader>
          <CollapsibleCardContent>
            <Diff fileName={file.newPath} hunks={file.hunks} type={file.type}>
              {file.hunks.map((hunk) => (
                <Hunk key={hunk.content} hunk={hunk} />
              ))}
            </Diff>
          </CollapsibleCardContent>
        </CollapsibleCard>
      ))}
    </div>
  );
}
