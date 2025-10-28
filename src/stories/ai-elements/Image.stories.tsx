import type { Meta, StoryObj } from "@storybook/react-vite";
import { Image } from "@/components/ai-elements/image";

const meta = {
  title: "AI Elements/Image",
  component: Image,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Image>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    src: "https://via.placeholder.com/600x400",
    alt: "Placeholder image",
  },
};

export const WithCaption: Story = {
  args: {
    src: "https://via.placeholder.com/600x400",
    alt: "Placeholder image",
    caption: "A beautiful placeholder image",
  },
};
