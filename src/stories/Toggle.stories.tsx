import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bold, Italic, Underline } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";

const meta = {
  title: "Components/Toggle",
  component: Toggle,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline"],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg"],
    },
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm">Variants:</span>
        <Toggle aria-label="Toggle bold">
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle variant="outline" aria-label="Toggle italic">
          <Italic className="h-4 w-4" />
        </Toggle>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm">Sizes:</span>
        <Toggle size="sm" aria-label="Small">
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle size="default" aria-label="Default">
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle size="lg" aria-label="Large">
          <Bold className="h-4 w-4" />
        </Toggle>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm">With text:</span>
        <Toggle aria-label="Toggle italic">
          <Italic className="mr-2 h-4 w-4" />
          Italic
        </Toggle>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm">Disabled:</span>
        <Toggle disabled aria-label="Disabled">
          <Bold className="h-4 w-4" />
        </Toggle>
      </div>
    </div>
  ),
};

export const Default: Story = {
  render: () => (
    <Toggle aria-label="Toggle bold">
      <Bold className="h-4 w-4" />
    </Toggle>
  ),
};

export const Outline: Story = {
  render: () => (
    <Toggle variant="outline" aria-label="Toggle italic">
      <Italic className="h-4 w-4" />
    </Toggle>
  ),
};

export const WithText: Story = {
  render: () => (
    <Toggle aria-label="Toggle italic">
      <Italic className="mr-2 h-4 w-4" />
      Italic
    </Toggle>
  ),
};

export const Small: Story = {
  render: () => (
    <Toggle size="sm" aria-label="Toggle bold">
      <Bold className="h-4 w-4" />
    </Toggle>
  ),
};

export const Large: Story = {
  render: () => (
    <Toggle size="lg" aria-label="Toggle bold">
      <Bold className="h-4 w-4" />
    </Toggle>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Toggle disabled aria-label="Toggle bold">
      <Bold className="h-4 w-4" />
    </Toggle>
  ),
};
