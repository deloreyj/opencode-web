import type { Meta, StoryObj } from "@storybook/react-vite";
import { BadgeCheck, ChevronRight, Mail, Bell, Settings, User } from "lucide-react";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Button } from "@/components/ui/button";

const meta = {
  title: "Components/Item",
  component: Item,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Item>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllVariants: Story = {
  render: () => (
    <div className="flex w-full max-w-md flex-col gap-2">
      <Item variant="outline">
        <ItemContent>
          <ItemTitle>Basic Item</ItemTitle>
          <ItemDescription>
            A simple item with title and description.
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="outline" size="sm">
            Action
          </Button>
        </ItemActions>
      </Item>
      <Item variant="outline">
        <ItemMedia>
          <Mail className="h-5 w-5" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>With Icon</ItemTitle>
          <ItemDescription>Item with icon and chevron.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <ChevronRight className="h-4 w-4" />
        </ItemActions>
      </Item>
      <Item variant="outline" size="sm" asChild>
        <a href="#">
          <ItemMedia>
            <BadgeCheck className="h-5 w-5" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Small size item with verification badge.</ItemTitle>
          </ItemContent>
          <ItemActions>
            <ChevronRight className="h-4 w-4" />
          </ItemActions>
        </a>
      </Item>
    </div>
  ),
};

export const Default: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <Item variant="outline">
        <ItemContent>
          <ItemTitle>Basic Item</ItemTitle>
          <ItemDescription>
            A simple item with title and description.
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="outline" size="sm">
            Action
          </Button>
        </ItemActions>
      </Item>
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <Item variant="outline">
        <ItemMedia>
          <Mail className="h-5 w-5" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>New Message</ItemTitle>
          <ItemDescription>You have a new message from John.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <ChevronRight className="h-4 w-4" />
        </ItemActions>
      </Item>
    </div>
  ),
};

export const Small: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <Item variant="outline" size="sm" asChild>
        <a href="#">
          <ItemMedia>
            <BadgeCheck className="h-5 w-5" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Your profile has been verified.</ItemTitle>
          </ItemContent>
          <ItemActions>
            <ChevronRight className="h-4 w-4" />
          </ItemActions>
        </a>
      </Item>
    </div>
  ),
};

export const WithNotification: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <Item variant="outline">
        <ItemMedia>
          <Bell className="h-5 w-5" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Notifications</ItemTitle>
          <ItemDescription>Manage your notification settings.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="ghost" size="sm">
            Configure
          </Button>
        </ItemActions>
      </Item>
    </div>
  ),
};

export const List: Story = {
  render: () => (
    <div className="flex w-full max-w-md flex-col gap-2">
      <Item variant="outline">
        <ItemMedia>
          <User className="h-5 w-5" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Profile</ItemTitle>
          <ItemDescription>Manage your profile information.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <ChevronRight className="h-4 w-4" />
        </ItemActions>
      </Item>
      <Item variant="outline">
        <ItemMedia>
          <Settings className="h-5 w-5" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Settings</ItemTitle>
          <ItemDescription>Configure your account settings.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <ChevronRight className="h-4 w-4" />
        </ItemActions>
      </Item>
      <Item variant="outline">
        <ItemMedia>
          <Bell className="h-5 w-5" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Notifications</ItemTitle>
          <ItemDescription>Manage notification preferences.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <ChevronRight className="h-4 w-4" />
        </ItemActions>
      </Item>
    </div>
  ),
};
