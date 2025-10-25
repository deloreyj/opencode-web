import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const meta = {
  title: "Components/Tooltip",
  component: Tooltip,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Default Tooltip</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Add to library</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button>On Primary Button</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>This is a helpful tooltip</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="link">On Link</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Links can have tooltips too</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Add to library</p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const WithText: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button>Hover me</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>This is a helpful tooltip</p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const OnLink: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="link">Hover over this link</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Links can have tooltips too</p>
      </TooltipContent>
    </Tooltip>
  ),
};
