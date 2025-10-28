import type { Meta, StoryObj } from "@storybook/react-vite";
import { Panel } from "@/components/ai-elements/panel";

const meta = {
  title: "AI Elements/Panel",
  component: Panel,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Panel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Panel className="w-[400px]">
      <div className="p-4">
        <h3 className="font-semibold mb-2">Panel Content</h3>
        <p className="text-sm text-muted-foreground">
          This is a panel component that can contain any content.
        </p>
      </div>
    </Panel>
  ),
};

export const WithMultipleSections: Story = {
  render: () => (
    <Panel className="w-[400px]">
      <div className="p-4 space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Section 1</h3>
          <p className="text-sm text-muted-foreground">First section content</p>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Section 2</h3>
          <p className="text-sm text-muted-foreground">Second section content</p>
        </div>
      </div>
    </Panel>
  ),
};
