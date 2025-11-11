import type { Meta, StoryObj } from "@storybook/react-vite";
import { Edge } from "@/components/ai-elements/edge";
import { ReactFlow, Controls, Background } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const meta = {
  title: "AI Elements/Edge",
  component: Edge.Temporary,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
} satisfies Meta<typeof Edge.Temporary>;

export default meta;
type Story = StoryObj<typeof meta>;

const initialNodes = [
  {
    id: "1",
    type: "default",
    data: { label: "Input Node" },
    position: { x: 100, y: 150 },
    sourcePosition: "right" as const,
    targetPosition: "left" as const,
  },
  {
    id: "2",
    type: "default",
    data: { label: "Output Node" },
    position: { x: 400, y: 150 },
    sourcePosition: "right" as const,
    targetPosition: "left" as const,
  },
];

export const TemporaryEdge: Story = {
  render: () => (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactFlow
        nodes={initialNodes}
        edges={[
          {
            id: "e1-2",
            source: "1",
            target: "2",
            type: "temporary",
          },
        ]}
        edgeTypes={{
          temporary: Edge.Temporary,
        }}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  ),
};

export const AnimatedEdge: Story = {
  render: () => (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactFlow
        nodes={initialNodes}
        edges={[
          {
            id: "e1-2",
            source: "1",
            target: "2",
            type: "animated",
          },
        ]}
        edgeTypes={{
          animated: Edge.Animated,
        }}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  ),
};

export const BothEdges: Story = {
  render: () => (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactFlow
        nodes={[
          ...initialNodes,
          {
            id: "3",
            type: "default",
            data: { label: "Middle Node" },
            position: { x: 250, y: 50 },
            sourcePosition: "right" as const,
            targetPosition: "left" as const,
          },
        ]}
        edges={[
          {
            id: "e1-3",
            source: "1",
            target: "3",
            type: "temporary",
          },
          {
            id: "e3-2",
            source: "3",
            target: "2",
            type: "animated",
          },
        ]}
        edgeTypes={{
          temporary: Edge.Temporary,
          animated: Edge.Animated,
        }}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  ),
};
