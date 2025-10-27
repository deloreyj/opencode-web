import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Sources,
  SourcesTrigger,
  SourcesContent,
  Source,
} from "@/components/ai-elements/sources";

const meta = {
  title: "AI Elements/Sources",
  component: Sources,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Sources>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-[600px]">
      <Sources>
        <SourcesTrigger count={3} />
        <SourcesContent>
          <Source
            href="https://react.dev/reference/react"
            title="React Documentation"
          />
          <Source
            href="https://react.dev/learn/hooks"
            title="React Hooks Guide"
          />
          <Source
            href="https://react.dev/reference/react-dom"
            title="React DOM Documentation"
          />
        </SourcesContent>
      </Sources>
    </div>
  ),
};

export const SingleSource: Story = {
  render: () => (
    <div className="w-[600px]">
      <Sources>
        <SourcesTrigger count={1} />
        <SourcesContent>
          <Source
            href="https://react.dev"
            title="React Official Website"
          />
        </SourcesContent>
      </Sources>
    </div>
  ),
};

export const ManySources: Story = {
  render: () => (
    <div className="w-[600px]">
      <Sources>
        <SourcesTrigger count={8} />
        <SourcesContent>
          <Source href="https://react.dev" title="React Documentation" />
          <Source href="https://nextjs.org" title="Next.js Documentation" />
          <Source href="https://tailwindcss.com" title="Tailwind CSS" />
          <Source href="https://www.typescriptlang.org" title="TypeScript" />
          <Source href="https://vitejs.dev" title="Vite" />
          <Source href="https://tanstack.com/query" title="TanStack Query" />
          <Source href="https://storybook.js.org" title="Storybook" />
          <Source href="https://vitest.dev" title="Vitest" />
        </SourcesContent>
      </Sources>
    </div>
  ),
};
