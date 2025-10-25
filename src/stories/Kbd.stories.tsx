import type { Meta, StoryObj } from "@storybook/react-vite";
import { Kbd, KbdGroup } from "@/components/ui/kbd";

const meta = {
  title: "Components/Kbd",
  component: Kbd,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm">Single key:</span>
        <Kbd>Ctrl</Kbd>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm">Mac modifiers:</span>
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>⇧</Kbd>
          <Kbd>⌥</Kbd>
          <Kbd>⌃</Kbd>
        </KbdGroup>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm">Shortcut:</span>
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <span>+</span>
          <Kbd>C</Kbd>
        </KbdGroup>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm">Arrow keys:</span>
        <KbdGroup>
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd>
          <Kbd>←</Kbd>
          <Kbd>→</Kbd>
        </KbdGroup>
      </div>
    </div>
  ),
};

export const Default: Story = {
  render: () => <Kbd>Ctrl</Kbd>,
};

export const MacModifiers: Story = {
  render: () => (
    <KbdGroup>
      <Kbd>⌘</Kbd>
      <Kbd>⇧</Kbd>
      <Kbd>⌥</Kbd>
      <Kbd>⌃</Kbd>
    </KbdGroup>
  ),
};

export const WindowsShortcut: Story = {
  render: () => (
    <KbdGroup>
      <Kbd>Ctrl</Kbd>
      <span>+</span>
      <Kbd>C</Kbd>
    </KbdGroup>
  ),
};

export const SaveShortcut: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Save</span>
      <KbdGroup>
        <Kbd>Ctrl</Kbd>
        <span>+</span>
        <Kbd>S</Kbd>
      </KbdGroup>
    </div>
  ),
};

export const MultipleShortcuts: Story = {
  render: () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm">Copy</span>
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <span>+</span>
          <Kbd>C</Kbd>
        </KbdGroup>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm">Paste</span>
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <span>+</span>
          <Kbd>V</Kbd>
        </KbdGroup>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm">Cut</span>
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <span>+</span>
          <Kbd>X</Kbd>
        </KbdGroup>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm">Undo</span>
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <span>+</span>
          <Kbd>Z</Kbd>
        </KbdGroup>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm">Redo</span>
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <span>+</span>
          <Kbd>⇧</Kbd>
          <span>+</span>
          <Kbd>Z</Kbd>
        </KbdGroup>
      </div>
    </div>
  ),
};

export const MacShortcuts: Story = {
  render: () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm">Save</span>
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <span>+</span>
          <Kbd>S</Kbd>
        </KbdGroup>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm">Bold</span>
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <span>+</span>
          <Kbd>B</Kbd>
        </KbdGroup>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm">Italic</span>
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <span>+</span>
          <Kbd>I</Kbd>
        </KbdGroup>
      </div>
    </div>
  ),
};

export const ArrowKeys: Story = {
  render: () => (
    <KbdGroup>
      <Kbd>↑</Kbd>
      <Kbd>↓</Kbd>
      <Kbd>←</Kbd>
      <Kbd>→</Kbd>
    </KbdGroup>
  ),
};

export const FunctionKeys: Story = {
  render: () => (
    <KbdGroup>
      <Kbd>F1</Kbd>
      <Kbd>F2</Kbd>
      <Kbd>F3</Kbd>
      <Kbd>F4</Kbd>
    </KbdGroup>
  ),
};
