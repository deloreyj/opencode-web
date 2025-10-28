import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Node,
  NodeHeader,
  NodeTitle,
  NodeContent,
  NodeDescription,
} from "@/components/ai-elements/node";
import { ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const meta = {
  title: "AI Elements/Node",
  component: Node,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Node>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ReactFlowProvider>
      <div className="w-[300px]">
        <Node handles={{ target: true, source: true }}>
          <NodeHeader>
            <NodeTitle>Processing Step</NodeTitle>
            <NodeDescription>Transforms data</NodeDescription>
          </NodeHeader>
          <NodeContent>
            <p className="text-sm">This node processes incoming data and transforms it.</p>
          </NodeContent>
        </Node>
      </div>
    </ReactFlowProvider>
  ),
};

export const InputNode: Story = {
  render: () => (
    <ReactFlowProvider>
      <div className="w-[250px]">
        <Node handles={{ target: false, source: true }}>
          <NodeHeader>
            <NodeTitle>Input Node</NodeTitle>
            <NodeDescription>Data source</NodeDescription>
          </NodeHeader>
          <NodeContent>
            <p className="text-sm">Starting point for the workflow</p>
          </NodeContent>
        </Node>
      </div>
    </ReactFlowProvider>
  ),
};

export const OutputNode: Story = {
  render: () => (
    <ReactFlowProvider>
      <div className="w-[250px]">
        <Node handles={{ target: true, source: false }}>
          <NodeHeader>
            <NodeTitle>Output Node</NodeTitle>
            <NodeDescription>Final result</NodeDescription>
          </NodeHeader>
          <NodeContent>
            <p className="text-sm">End point for the workflow</p>
          </NodeContent>
        </Node>
      </div>
    </ReactFlowProvider>
  ),
};
