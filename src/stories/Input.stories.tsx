import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const meta = {
  title: "Components/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "tel", "url"],
    },
    disabled: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-6 w-full max-w-sm">
      <div>
        <Label htmlFor="text">Text Input</Label>
        <Input id="text" type="text" placeholder="Enter text" />
      </div>
      <div>
        <Label htmlFor="email-all">Email Input</Label>
        <Input id="email-all" type="email" placeholder="email@example.com" />
      </div>
      <div>
        <Label htmlFor="password">Password Input</Label>
        <Input id="password" type="password" placeholder="Enter password" />
      </div>
      <div>
        <Label htmlFor="number">Number Input</Label>
        <Input id="number" type="number" placeholder="0" />
      </div>
      <div>
        <Label htmlFor="disabled">Disabled Input</Label>
        <Input id="disabled" type="text" placeholder="Disabled" disabled />
      </div>
      <div>
        <Label htmlFor="file">File Input</Label>
        <Input id="file" type="file" />
      </div>
    </div>
  ),
};

export const Default: Story = {
  args: {
    type: "email",
    placeholder: "Email",
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="email">Email</Label>
      <Input type="email" id="email" placeholder="Email" />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: "Disabled input",
  },
};

export const Password: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="password">Password</Label>
      <Input type="password" id="password" placeholder="Enter your password" />
    </div>
  ),
};

export const WithText: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="email-2">Email</Label>
      <Input type="email" id="email-2" placeholder="Email" />
      <p className="text-muted-foreground text-sm">Enter your email address.</p>
    </div>
  ),
};

export const File: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="picture">Picture</Label>
      <Input id="picture" type="file" />
    </div>
  ),
};

export const AllTypes: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-4">
      <div>
        <Label htmlFor="text">Text</Label>
        <Input type="text" id="text" placeholder="Enter text" />
      </div>
      <div>
        <Label htmlFor="email-3">Email</Label>
        <Input type="email" id="email-3" placeholder="m@example.com" />
      </div>
      <div>
        <Label htmlFor="password-2">Password</Label>
        <Input type="password" id="password-2" />
      </div>
      <div>
        <Label htmlFor="number">Number</Label>
        <Input type="number" id="number" placeholder="123" />
      </div>
      <div>
        <Label htmlFor="tel">Telephone</Label>
        <Input type="tel" id="tel" placeholder="(555) 555-5555" />
      </div>
    </div>
  ),
};
