import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Tool,
  ToolHeader,
  ToolContent,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";

const meta = {
  title: "AI Elements/Tool",
  component: Tool,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Tool>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tool className="w-[600px]">
      <ToolHeader
        title="Web Search"
        type="tool-call-search"
        state="output-available"
      />
      <ToolContent>
        <ToolInput
          input={{
            query: "latest AI developments",
            results: 10,
          }}
        />
        <ToolOutput
          output={{
            results: [
              { title: "AI Breakthrough 2024", url: "https://example.com/1" },
              { title: "Machine Learning Advances", url: "https://example.com/2" },
            ],
          }}
          errorText={undefined}
        />
      </ToolContent>
    </Tool>
  ),
};

export const Running: Story = {
  render: () => (
    <Tool className="w-[600px]">
      <ToolHeader
        title="Calculator"
        type="tool-call-calculator"
        state="input-available"
      />
      <ToolContent>
        <ToolInput
          input={{
            expression: "42 * 2",
          }}
        />
      </ToolContent>
    </Tool>
  ),
};

export const WithError: Story = {
  render: () => (
    <Tool className="w-[600px]">
      <ToolHeader
        title="Database Query"
        type="tool-call-query"
        state="output-error"
      />
      <ToolContent>
        <ToolInput
          input={{
            query: "SELECT * FROM users",
          }}
        />
        <ToolOutput
          output={undefined}
          errorText="Connection to database failed"
        />
      </ToolContent>
    </Tool>
  ),
};
