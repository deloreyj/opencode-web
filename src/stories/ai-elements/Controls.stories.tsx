import type { Meta, StoryObj } from "@storybook/react-vite";
import { Controls } from "@/components/ai-elements/controls";
import { ReactFlow, Background } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const meta = {
  title: "AI Elements/Controls",
  component: Controls,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
} satisfies Meta<typeof Controls>;

export default meta;
type Story = StoryObj<typeof meta>;

const nodes = [
  {
    id: "1",
    type: "default",
    data: { label: "Node 1" },
    position: { x: 250, y: 100 },
  },
  {
    id: "2",
    type: "default",
    data: { label: "Node 2" },
    position: { x: 100, y: 250 },
  },
  {
    id: "3",
    type: "default",
    data: { label: "Node 3" },
    position: { x: 400, y: 250 },
  },
];

const edges = [
  { id: "e1-2", source: "1", target: "2" },
  { id: "e1-3", source: "1", target: "3" },
];

export const Default: Story = {
  render: () => (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  ),
};

export const WithCustomPosition: Story = {
  render: () => (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background />
        <Controls position="top-left" />
      </ReactFlow>
    </div>
  ),
};

export const ShowZoomOnly: Story = {
  render: () => (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background />
        <Controls showZoom={true} showFitView={false} showInteractive={false} />
      </ReactFlow>
    </div>
  ),
};
