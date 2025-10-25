import type { Meta, StoryObj } from "@storybook/react-vite";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const meta = {
  title: "Components/AspectRatio",
  component: AspectRatio,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AspectRatio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div className="w-[450px]">
        <p className="text-sm font-medium mb-2">16:9 (Landscape)</p>
        <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg">
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-muted-foreground">16:9</span>
          </div>
        </AspectRatio>
      </div>
      <div className="w-[300px]">
        <p className="text-sm font-medium mb-2">1:1 (Square)</p>
        <AspectRatio ratio={1} className="bg-muted rounded-lg">
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-muted-foreground">1:1</span>
          </div>
        </AspectRatio>
      </div>
      <div className="w-[300px]">
        <p className="text-sm font-medium mb-2">3:4 (Portrait)</p>
        <AspectRatio ratio={3 / 4} className="bg-muted rounded-lg">
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-muted-foreground">3:4</span>
          </div>
        </AspectRatio>
      </div>
      <div className="w-[600px]">
        <p className="text-sm font-medium mb-2">21:9 (Ultra Wide)</p>
        <AspectRatio ratio={21 / 9} className="bg-muted rounded-lg">
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-muted-foreground">21:9</span>
          </div>
        </AspectRatio>
      </div>
    </div>
  ),
};

export const Default: Story = {
  render: () => (
    <div className="w-[450px]">
      <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg">
        <img
          src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
          alt="Photo by Drew Beamer"
          className="h-full w-full rounded-lg object-cover"
        />
      </AspectRatio>
    </div>
  ),
};

export const Square: Story = {
  render: () => (
    <div className="w-[300px]">
      <AspectRatio ratio={1} className="bg-muted rounded-lg">
        <img
          src="https://images.unsplash.com/photo-1535025639604-9a804c092faa?w=800&dpr=2&q=80"
          alt="Square image"
          className="h-full w-full rounded-lg object-cover"
        />
      </AspectRatio>
    </div>
  ),
};

export const Portrait: Story = {
  render: () => (
    <div className="w-[300px]">
      <AspectRatio ratio={3 / 4} className="bg-muted rounded-lg">
        <img
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&dpr=2&q=80"
          alt="Portrait image"
          className="h-full w-full rounded-lg object-cover"
        />
      </AspectRatio>
    </div>
  ),
};

export const WithPlaceholder: Story = {
  render: () => (
    <div className="w-[450px]">
      <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg">
        <div className="flex h-full w-full items-center justify-center">
          <span className="text-muted-foreground">16:9 Aspect Ratio</span>
        </div>
      </AspectRatio>
    </div>
  ),
};

export const UltraWide: Story = {
  render: () => (
    <div className="w-[600px]">
      <AspectRatio ratio={21 / 9} className="bg-muted rounded-lg">
        <img
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&dpr=2&q=80"
          alt="Ultra wide image"
          className="h-full w-full rounded-lg object-cover"
        />
      </AspectRatio>
    </div>
  ),
};
