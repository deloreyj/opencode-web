import type { Meta, StoryObj } from "@storybook/react-vite";
import { Toolbar } from "@/components/ai-elements/toolbar";
import { Button } from "@/components/ui/button";
import { ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  CodeIcon,
  LinkIcon,
} from "lucide-react";

const meta = {
  title: "AI Elements/Toolbar",
  component: Toolbar,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Toolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ReactFlowProvider>
      <div className="relative h-[200px] w-[400px] rounded border bg-muted/20 flex items-center justify-center">
        <div className="text-sm text-muted-foreground">
          Node with toolbar (hover to see)
        </div>
        <Toolbar isVisible={true}>
          <Button size="sm" variant="ghost">
            <BoldIcon className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost">
            <ItalicIcon className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost">
            <UnderlineIcon className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost">
            <CodeIcon className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost">
            <LinkIcon className="h-4 w-4" />
          </Button>
        </Toolbar>
      </div>
    </ReactFlowProvider>
  ),
};

export const Minimal: Story = {
  render: () => (
    <ReactFlowProvider>
      <div className="relative h-[200px] w-[400px] rounded border bg-muted/20 flex items-center justify-center">
        <div className="text-sm text-muted-foreground">
          Minimal toolbar
        </div>
        <Toolbar isVisible={true}>
          <Button size="sm" variant="ghost">
            <BoldIcon className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost">
            <ItalicIcon className="h-4 w-4" />
          </Button>
        </Toolbar>
      </div>
    </ReactFlowProvider>
  ),
};
