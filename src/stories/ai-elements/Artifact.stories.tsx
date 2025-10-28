import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Artifact,
  ArtifactHeader,
  ArtifactTitle,
  ArtifactDescription,
  ArtifactActions,
  ArtifactAction,
  ArtifactContent,
  ArtifactClose,
} from "@/components/ai-elements/artifact";
import { CopyIcon, DownloadIcon } from "lucide-react";

const meta = {
  title: "AI Elements/Artifact",
  component: Artifact,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Artifact>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Artifact className="w-[500px]">
      <ArtifactHeader>
        <div>
          <ArtifactTitle>Code Snippet</ArtifactTitle>
          <ArtifactDescription>
            A sample React component
          </ArtifactDescription>
        </div>
        <div className="flex items-center gap-2">
          <ArtifactActions>
            <ArtifactAction tooltip="Copy" icon={CopyIcon} />
            <ArtifactAction tooltip="Download" icon={DownloadIcon} />
          </ArtifactActions>
          <ArtifactClose />
        </div>
      </ArtifactHeader>
      <ArtifactContent>
        <pre className="text-sm">
          {`function HelloWorld() {
  return <div>Hello World!</div>;
}`}
        </pre>
      </ArtifactContent>
    </Artifact>
  ),
};

export const WithoutActions: Story = {
  render: () => (
    <Artifact className="w-[500px]">
      <ArtifactHeader>
        <div>
          <ArtifactTitle>Simple Artifact</ArtifactTitle>
          <ArtifactDescription>
            Without action buttons
          </ArtifactDescription>
        </div>
        <ArtifactClose />
      </ArtifactHeader>
      <ArtifactContent>
        <p className="text-sm">This is a simple artifact without any actions.</p>
      </ArtifactContent>
    </Artifact>
  ),
};
