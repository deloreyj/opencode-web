import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Copy, Scissors, Clipboard } from "lucide-react";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";

const meta = {
  title: "Components/ButtonGroup",
  component: ButtonGroup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-sm font-medium mb-2">Horizontal</p>
        <ButtonGroup>
          <Button variant="outline">Left</Button>
          <Button variant="outline">Middle</Button>
          <Button variant="outline">Right</Button>
        </ButtonGroup>
      </div>
      <div>
        <p className="text-sm font-medium mb-2">Vertical</p>
        <ButtonGroup orientation="vertical">
          <Button variant="outline">First</Button>
          <Button variant="outline">Second</Button>
          <Button variant="outline">Third</Button>
        </ButtonGroup>
      </div>
      <div>
        <p className="text-sm font-medium mb-2">With Icons</p>
        <ButtonGroup>
          <Button variant="outline" size="icon">
            <Bold className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Italic className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Underline className="h-4 w-4" />
          </Button>
        </ButtonGroup>
      </div>
    </div>
  ),
};

export const Default: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline">Left</Button>
      <Button variant="outline">Middle</Button>
      <Button variant="outline">Right</Button>
    </ButtonGroup>
  ),
};

export const TextFormatting: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline" size="icon">
        <Bold className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon">
        <Italic className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon">
        <Underline className="h-4 w-4" />
      </Button>
    </ButtonGroup>
  ),
};

export const TextAlignment: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline" size="icon">
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon">
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon">
        <AlignRight className="h-4 w-4" />
      </Button>
    </ButtonGroup>
  ),
};

export const ClipboardActions: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline" size="sm">
        <Copy className="h-4 w-4 mr-2" />
        Copy
      </Button>
      <Button variant="outline" size="sm">
        <Scissors className="h-4 w-4 mr-2" />
        Cut
      </Button>
      <Button variant="outline" size="sm">
        <Clipboard className="h-4 w-4 mr-2" />
        Paste
      </Button>
    </ButtonGroup>
  ),
};

export const Mixed: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline">Cancel</Button>
      <Button variant="outline">Save Draft</Button>
      <Button>Publish</Button>
    </ButtonGroup>
  ),
};

export const Vertical: Story = {
  render: () => (
    <ButtonGroup orientation="vertical">
      <Button variant="outline">First</Button>
      <Button variant="outline">Second</Button>
      <Button variant="outline">Third</Button>
    </ButtonGroup>
  ),
};
