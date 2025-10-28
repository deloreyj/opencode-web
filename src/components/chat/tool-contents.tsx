/**
 * Specialized tool content renderers for different OpenCode tools
 */

import { ToolInput, ToolOutput } from "@/components/ai-elements/tool";

interface ToolState {
  status: string;
  input?: any;
  output?: string;
  error?: string;
  title?: string;
}

interface ToolContentProps {
  state: ToolState;
}

/**
 * Content renderer for Read tool
 * Shows the file contents without redundant parameters
 */
export function ReadToolContent({ state }: ToolContentProps) {
  return (
    <>
      {(state.output || state.error) && (
        <ToolOutput output={state.output} errorText={state.error} />
      )}
    </>
  );
}

/**
 * Content renderer for Grep tool
 * Shows search parameters and results
 */
export function GrepToolContent({ state }: ToolContentProps) {
  return (
    <>
      {state.input && <ToolInput input={state.input} />}
      {(state.output || state.error) && (
        <ToolOutput output={state.output} errorText={state.error} />
      )}
    </>
  );
}

/**
 * Default content renderer for all other tools
 * Shows both input parameters and output
 */
export function DefaultToolContent({ state }: ToolContentProps) {
  return (
    <>
      {state.input && <ToolInput input={state.input} />}
      {(state.output || state.error) && (
        <ToolOutput output={state.output} errorText={state.error} />
      )}
    </>
  );
}

/**
 * Router function to select the appropriate tool content component
 */
export function getToolContent(toolName: string, state: ToolState) {
  switch (toolName.toLowerCase()) {
    case "read":
      return <ReadToolContent state={state} />;
    case "grep":
      return <GrepToolContent state={state} />;
    default:
      return <DefaultToolContent state={state} />;
  }
}
