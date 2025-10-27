import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTools,
  PromptInputButton,
  PromptInputAttachments,
  PromptInputAttachment,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
  PromptInputActionAddAttachments,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { useState } from "react";
import { GlobeIcon } from "lucide-react";

const meta = {
  title: "AI Elements/PromptInput",
  component: PromptInput,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof PromptInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => {
    const [input, setInput] = useState("");
    const [status, setStatus] = useState<"ready" | "submitted" | "streaming">("ready");

    const handleSubmit = (message: PromptInputMessage) => {
      console.log("Submitted:", message);
      setStatus("submitted");
      setTimeout(() => setStatus("ready"), 1000);
      setInput("");
    };

    return (
      <div className="w-[600px]">
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputBody>
            <PromptInputTextarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputSubmit status={status} disabled={!input} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    );
  },
};

export const WithAttachments: Story = {
  render: () => {
    const [input, setInput] = useState("");
    const [status, setStatus] = useState<"ready" | "submitted" | "streaming">("ready");

    const handleSubmit = (message: PromptInputMessage) => {
      console.log("Submitted:", message);
      setStatus("submitted");
      setTimeout(() => setStatus("ready"), 1000);
      setInput("");
    };

    return (
      <div className="w-[600px]">
        <PromptInput onSubmit={handleSubmit} globalDrop multiple>
          <PromptInputBody>
            <PromptInputAttachments>
              {(attachment) => <PromptInputAttachment data={attachment} />}
            </PromptInputAttachments>
            <PromptInputTextarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
            </PromptInputTools>
            <PromptInputSubmit status={status} disabled={!input} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    );
  },
};

export const WithTools: Story = {
  render: () => {
    const [input, setInput] = useState("");
    const [status, setStatus] = useState<"ready" | "submitted" | "streaming">("ready");
    const [webSearch, setWebSearch] = useState(false);

    const handleSubmit = (message: PromptInputMessage) => {
      console.log("Submitted:", message, { webSearch });
      setStatus("submitted");
      setTimeout(() => setStatus("ready"), 1000);
      setInput("");
    };

    return (
      <div className="w-[600px]">
        <PromptInput onSubmit={handleSubmit} globalDrop multiple>
          <PromptInputBody>
            <PromptInputAttachments>
              {(attachment) => <PromptInputAttachment data={attachment} />}
            </PromptInputAttachments>
            <PromptInputTextarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
              <PromptInputButton
                variant={webSearch ? "default" : "ghost"}
                onClick={() => setWebSearch(!webSearch)}
              >
                <GlobeIcon size={16} />
                <span>Search</span>
              </PromptInputButton>
            </PromptInputTools>
            <PromptInputSubmit status={status} disabled={!input} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    );
  },
};

export const Streaming: Story = {
  render: () => {
    const [input, setInput] = useState("Generating response...");

    return (
      <div className="w-[600px]">
        <PromptInput onSubmit={() => {}}>
          <PromptInputBody>
            <PromptInputTextarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputSubmit status="streaming" />
          </PromptInputFooter>
        </PromptInput>
      </div>
    );
  },
};
