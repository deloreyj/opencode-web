import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileText, Inbox, Search } from "lucide-react";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";

const meta = {
  title: "Components/Empty",
  component: Empty,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Empty>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-12">
      <Empty>
        <EmptyHeader>
          <EmptyMedia>
            <FileText className="h-12 w-12" />
          </EmptyMedia>
          <EmptyTitle>No files found</EmptyTitle>
          <EmptyDescription>
            You don't have any files yet. Upload your first file to get started.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button>Upload File</Button>
        </EmptyContent>
      </Empty>
      <Empty>
        <EmptyHeader>
          <EmptyMedia>
            <Search className="h-12 w-12" />
          </EmptyMedia>
          <EmptyTitle>No results</EmptyTitle>
          <EmptyDescription>
            We couldn't find anything matching your search.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline">Clear search</Button>
        </EmptyContent>
      </Empty>
      <Empty>
        <EmptyHeader>
          <EmptyMedia>
            <Inbox className="h-12 w-12" />
          </EmptyMedia>
          <EmptyTitle>All caught up!</EmptyTitle>
          <EmptyDescription>
            You have no pending notifications.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  ),
};

export const Default: Story = {
  render: () => (
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          <FileText className="h-12 w-12" />
        </EmptyMedia>
        <EmptyTitle>No files found</EmptyTitle>
        <EmptyDescription>
          You don't have any files yet. Upload your first file to get started.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button>Upload File</Button>
      </EmptyContent>
    </Empty>
  ),
};

export const NoResults: Story = {
  render: () => (
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          <Search className="h-12 w-12" />
        </EmptyMedia>
        <EmptyTitle>No results found</EmptyTitle>
        <EmptyDescription>
          We couldn't find any results matching your search. Try adjusting your filters.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline">Clear Filters</Button>
      </EmptyContent>
    </Empty>
  ),
};

export const EmptyInbox: Story = {
  render: () => (
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          <Inbox className="h-12 w-12" />
        </EmptyMedia>
        <EmptyTitle>Your inbox is empty</EmptyTitle>
        <EmptyDescription>
          You're all caught up! Check back later for new messages.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  ),
};

export const WithMultipleActions: Story = {
  render: () => (
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          <FileText className="h-12 w-12" />
        </EmptyMedia>
        <EmptyTitle>No documents</EmptyTitle>
        <EmptyDescription>
          Get started by creating a new document or importing existing ones.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <Button>Create New</Button>
          <Button variant="outline">Import</Button>
        </div>
      </EmptyContent>
    </Empty>
  ),
};
