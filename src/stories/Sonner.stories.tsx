import type { Meta, StoryObj } from "@storybook/react-vite";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const meta = {
  title: "Components/Sonner",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => toast("Default toast")}
      >
        Default
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => toast.success("Success!")}
      >
        Success
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => toast.error("Error!")}
      >
        Error
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => toast.info("Info")}
      >
        Info
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => toast.warning("Warning")}
      >
        Warning
      </Button>
    </div>
  ),
};

export const Default: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() =>
        toast("Event has been created", {
          description: "Sunday, December 03, 2023 at 9:00 AM",
          action: {
            label: "Undo",
            onClick: () => console.log("Undo"),
          },
        })
      }
    >
      Show Toast
    </Button>
  ),
};

export const Success: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() => toast.success("Successfully saved!", {
        description: "Your changes have been saved.",
      })}
    >
      Show Success
    </Button>
  ),
};

export const Error: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() => toast.error("Something went wrong!", {
        description: "Please try again later.",
      })}
    >
      Show Error
    </Button>
  ),
};

export const Info: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() => toast.info("New update available", {
        description: "Version 2.0 is now available for download.",
      })}
    >
      Show Info
    </Button>
  ),
};

export const Warning: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() => toast.warning("Low disk space", {
        description: "You are running out of disk space.",
      })}
    >
      Show Warning
    </Button>
  ),
};

export const WithPromise: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() => {
        const promise = () => new Promise((resolve) => setTimeout(resolve, 2000));
        toast.promise(promise, {
          loading: "Loading...",
          success: "Data loaded successfully!",
          error: "Error loading data",
        });
      }}
    >
      Show Promise Toast
    </Button>
  ),
};

