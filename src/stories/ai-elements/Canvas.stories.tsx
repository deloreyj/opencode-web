import type { Meta, StoryObj } from "@storybook/react-vite";
import { Canvas } from "@/components/ai-elements/canvas";
import { Node } from "@/components/ai-elements/node";
import { useState } from "react";
import type { Node as FlowNode, Edge } from "@xyflow/react";

const meta = {
  title: "AI Elements/Canvas",
  component: Canvas,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
} satisfies Meta<typeof Canvas>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  render: () => (
    <div className="h-screen w-screen">
      <Canvas nodes={[]} edges={[]} />
    </div>
  ),
};

const initialNodes: FlowNode[] = [
  {
    id: "1",
    type: "default",
    data: { label: "Input" },
    position: { x: 100, y: 150 },
  },
  {
    id: "2",
    type: "default",
    data: { label: "Process" },
    position: { x: 300, y: 150 },
  },
  {
    id: "3",
    type: "default",
    data: { label: "Output" },
    position: { x: 500, y: 150 },
  },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2" },
  { id: "e2-3", source: "2", target: "3" },
];

export const WithNodes: Story = {
  render: () => (
    <div className="h-screen w-screen">
      <Canvas nodes={initialNodes} edges={initialEdges} />
    </div>
  ),
};

export const InteractiveCanvas: Story = {
  render: () => {
    const [nodes, setNodes] = useState<FlowNode[]>(initialNodes);
    const [edges, setEdges] = useState<Edge[]>(initialEdges);

    return (
      <div className="h-screen w-screen">
        <Canvas
          nodes={nodes}
          edges={edges}
          onNodesChange={(changes) => {
            // Handle node changes
            console.log("Nodes changed:", changes);
          }}
          onEdgesChange={(changes) => {
            // Handle edge changes
            console.log("Edges changed:", changes);
          }}
        />
      </div>
    );
  },
};

export const CustomBackground: Story = {
  render: () => (
    <div className="h-screen w-screen">
      <Canvas
        nodes={initialNodes}
        edges={initialEdges}
        className="bg-slate-950"
      />
    </div>
  ),
};
