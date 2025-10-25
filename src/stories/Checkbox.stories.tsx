import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Checkbox id="state-1" />
        <Label htmlFor="state-1">Unchecked</Label>
      </div>
      <div className="flex items-center gap-3">
        <Checkbox id="state-2" defaultChecked />
        <Label htmlFor="state-2">Checked</Label>
      </div>
      <div className="flex items-center gap-3">
        <Checkbox id="state-3" disabled />
        <Label htmlFor="state-3">Disabled</Label>
      </div>
      <div className="flex items-center gap-3">
        <Checkbox id="state-4" disabled defaultChecked />
        <Label htmlFor="state-4">Disabled Checked</Label>
      </div>
    </div>
  ),
};

export const Default: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Checkbox id="terms" />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  ),
};

export const Checked: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Checkbox id="checked" defaultChecked />
      <Label htmlFor="checked">Checked by default</Label>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Checkbox id="disabled" disabled />
      <Label htmlFor="disabled">Disabled checkbox</Label>
    </div>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <div className="flex items-start gap-3">
      <Checkbox id="terms-2" defaultChecked />
      <div className="grid gap-2">
        <Label htmlFor="terms-2">Accept terms and conditions</Label>
        <p className="text-muted-foreground text-sm">
          By clicking this checkbox, you agree to the terms and conditions.
        </p>
      </div>
    </div>
  ),
};

export const StyledCard: Story = {
  render: () => (
    <Label className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950">
      <Checkbox
        id="toggle-2"
        defaultChecked
        className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
      />
      <div className="grid gap-1.5 font-normal">
        <p className="text-sm leading-none font-medium">
          Enable notifications
        </p>
        <p className="text-muted-foreground text-sm">
          You can enable or disable notifications at any time.
        </p>
      </div>
    </Label>
  ),
};
