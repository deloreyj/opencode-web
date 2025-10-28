import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ChainOfThought,
  ChainOfThoughtHeader,
  ChainOfThoughtContent,
  ChainOfThoughtStep,
  ChainOfThoughtSearchResults,
  ChainOfThoughtSearchResult,
  ChainOfThoughtImage,
} from "@/components/ai-elements/chain-of-thought";
import { SearchIcon, DatabaseIcon, FileTextIcon } from "lucide-react";

const meta = {
  title: "AI Elements/ChainOfThought",
  component: ChainOfThought,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof ChainOfThought>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ChainOfThought className="w-[600px]">
      <ChainOfThoughtHeader />
      <ChainOfThoughtContent>
        <ChainOfThoughtStep
          label="Analyzing the question"
          description="Understanding user intent and context"
          status="complete"
        />
        <ChainOfThoughtStep
          label="Searching knowledge base"
          description="Finding relevant information"
          status="complete"
          icon={SearchIcon}
        >
          <ChainOfThoughtSearchResults>
            <ChainOfThoughtSearchResult>3 documents</ChainOfThoughtSearchResult>
            <ChainOfThoughtSearchResult>5 references</ChainOfThoughtSearchResult>
          </ChainOfThoughtSearchResults>
        </ChainOfThoughtStep>
        <ChainOfThoughtStep
          label="Synthesizing response"
          description="Combining information into coherent answer"
          status="complete"
        />
      </ChainOfThoughtContent>
    </ChainOfThought>
  ),
};

export const WithCustomTitle: Story = {
  render: () => (
    <ChainOfThought className="w-[600px]" defaultOpen>
      <ChainOfThoughtHeader>Reasoning Process</ChainOfThoughtHeader>
      <ChainOfThoughtContent>
        <ChainOfThoughtStep
          label="Query analysis"
          status="complete"
        />
        <ChainOfThoughtStep
          label="Data retrieval"
          status="active"
          icon={DatabaseIcon}
        />
        <ChainOfThoughtStep
          label="Response generation"
          status="pending"
        />
      </ChainOfThoughtContent>
    </ChainOfThought>
  ),
};

export const WithImage: Story = {
  render: () => (
    <ChainOfThought className="w-[600px]" defaultOpen>
      <ChainOfThoughtHeader>Visual Analysis</ChainOfThoughtHeader>
      <ChainOfThoughtContent>
        <ChainOfThoughtStep
          label="Processing image"
          description="Analyzing visual content"
          status="complete"
        >
          <ChainOfThoughtImage caption="Input image analyzed for objects and text">
            <div className="flex items-center justify-center h-32 w-full bg-muted-foreground/10 rounded text-sm text-muted-foreground">
              [Image Preview]
            </div>
          </ChainOfThoughtImage>
        </ChainOfThoughtStep>
        <ChainOfThoughtStep
          label="Extracting information"
          description="Identifying key elements"
          status="complete"
        />
      </ChainOfThoughtContent>
    </ChainOfThought>
  ),
};

export const MultipleStepsWithIcons: Story = {
  render: () => (
    <ChainOfThought className="w-[600px]" defaultOpen>
      <ChainOfThoughtHeader>Document Processing</ChainOfThoughtHeader>
      <ChainOfThoughtContent>
        <ChainOfThoughtStep
          label="Reading document"
          description="Parsing file contents"
          status="complete"
          icon={FileTextIcon}
        />
        <ChainOfThoughtStep
          label="Searching for references"
          description="Finding related documents"
          status="complete"
          icon={SearchIcon}
        >
          <ChainOfThoughtSearchResults>
            <ChainOfThoughtSearchResult>Report.pdf</ChainOfThoughtSearchResult>
            <ChainOfThoughtSearchResult>Data.xlsx</ChainOfThoughtSearchResult>
            <ChainOfThoughtSearchResult>Notes.txt</ChainOfThoughtSearchResult>
          </ChainOfThoughtSearchResults>
        </ChainOfThoughtStep>
        <ChainOfThoughtStep
          label="Querying database"
          description="Retrieving additional context"
          status="complete"
          icon={DatabaseIcon}
        />
        <ChainOfThoughtStep
          label="Formulating answer"
          description="Creating comprehensive response"
          status="active"
        />
      </ChainOfThoughtContent>
    </ChainOfThought>
  ),
};

export const Collapsed: Story = {
  render: () => (
    <ChainOfThought className="w-[600px]" defaultOpen={false}>
      <ChainOfThoughtHeader>Thinking...</ChainOfThoughtHeader>
      <ChainOfThoughtContent>
        <ChainOfThoughtStep
          label="Step 1"
          status="complete"
        />
        <ChainOfThoughtStep
          label="Step 2"
          status="complete"
        />
      </ChainOfThoughtContent>
    </ChainOfThought>
  ),
};
