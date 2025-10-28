import type { Meta, StoryObj } from "@storybook/react-vite";
import { WebPreview } from "@/components/ai-elements/web-preview";

const meta = {
  title: "AI Elements/WebPreview",
  component: WebPreview,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof WebPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    url: "https://example.com",
    title: "Example Domain",
    description: "This domain is for use in illustrative examples in documents.",
  },
};

export const WithImage: Story = {
  args: {
    url: "https://example.com",
    title: "Example Website",
    description: "A comprehensive guide to web development best practices.",
    image: "https://via.placeholder.com/300x200",
  },
};

export const Minimal: Story = {
  args: {
    url: "https://example.com",
  },
};
