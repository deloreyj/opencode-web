import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  InlineCitation,
  InlineCitationText,
  InlineCitationCard,
  InlineCitationCardTrigger,
  InlineCitationCardBody,
  InlineCitationCarousel,
  InlineCitationCarouselContent,
  InlineCitationCarouselItem,
  InlineCitationCarouselHeader,
  InlineCitationCarouselIndex,
  InlineCitationCarouselPrev,
  InlineCitationCarouselNext,
  InlineCitationSource,
  InlineCitationQuote,
} from "@/components/ai-elements/inline-citation";

const meta = {
  title: "AI Elements/InlineCitation",
  component: InlineCitation,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof InlineCitation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="max-w-2xl">
      <p className="text-sm">
        React is a JavaScript library for building user interfaces{" "}
        <InlineCitation>
          <InlineCitationText>
            that was created by Facebook
          </InlineCitationText>
          <InlineCitationCard>
            <InlineCitationCardTrigger
              sources={["https://react.dev", "https://legacy.reactjs.org"]}
            />
            <InlineCitationCardBody>
              <InlineCitationCarousel>
                <InlineCitationCarouselHeader>
                  <InlineCitationCarouselPrev />
                  <InlineCitationCarouselIndex />
                  <InlineCitationCarouselNext />
                </InlineCitationCarouselHeader>
                <InlineCitationCarouselContent>
                  <InlineCitationCarouselItem>
                    <InlineCitationSource
                      title="React – A JavaScript library for building user interfaces"
                      url="https://react.dev"
                      description="React lets you build user interfaces out of individual pieces called components."
                    />
                    <InlineCitationQuote>
                      "React is the library for web and native user interfaces."
                    </InlineCitationQuote>
                  </InlineCitationCarouselItem>
                  <InlineCitationCarouselItem>
                    <InlineCitationSource
                      title="React – Documentation (Legacy)"
                      url="https://legacy.reactjs.org"
                      description="A JavaScript library for building user interfaces, maintained by Facebook and the community."
                    />
                  </InlineCitationCarouselItem>
                </InlineCitationCarouselContent>
              </InlineCitationCarousel>
            </InlineCitationCardBody>
          </InlineCitationCard>
        </InlineCitation>
        . It uses a declarative approach to create interactive UIs.
      </p>
    </div>
  ),
};

export const SingleSource: Story = {
  render: () => (
    <div className="max-w-2xl">
      <p className="text-sm">
        TypeScript is a strongly typed programming language{" "}
        <InlineCitation>
          <InlineCitationText>that builds on JavaScript</InlineCitationText>
          <InlineCitationCard>
            <InlineCitationCardTrigger
              sources={["https://www.typescriptlang.org"]}
            />
            <InlineCitationCardBody>
              <div className="p-4">
                <InlineCitationSource
                  title="TypeScript: JavaScript With Syntax For Types"
                  url="https://www.typescriptlang.org"
                  description="TypeScript extends JavaScript by adding types to the language."
                />
              </div>
            </InlineCitationCardBody>
          </InlineCitationCard>
        </InlineCitation>
        , giving you better tooling at any scale.
      </p>
    </div>
  ),
};

export const MultipleSources: Story = {
  render: () => (
    <div className="max-w-2xl">
      <p className="text-sm">
        Artificial Intelligence has made significant advances{" "}
        <InlineCitation>
          <InlineCitationText>in recent years</InlineCitationText>
          <InlineCitationCard>
            <InlineCitationCardTrigger
              sources={[
                "https://openai.com",
                "https://deepmind.google",
                "https://ai.meta.com",
              ]}
            />
            <InlineCitationCardBody>
              <InlineCitationCarousel>
                <InlineCitationCarouselHeader>
                  <InlineCitationCarouselPrev />
                  <InlineCitationCarouselIndex />
                  <InlineCitationCarouselNext />
                </InlineCitationCarouselHeader>
                <InlineCitationCarouselContent>
                  <InlineCitationCarouselItem>
                    <InlineCitationSource
                      title="OpenAI"
                      url="https://openai.com"
                      description="Creating safe AGI that benefits all of humanity."
                    />
                  </InlineCitationCarouselItem>
                  <InlineCitationCarouselItem>
                    <InlineCitationSource
                      title="Google DeepMind"
                      url="https://deepmind.google"
                      description="Advancing AI to benefit humanity through research."
                    />
                  </InlineCitationCarouselItem>
                  <InlineCitationCarouselItem>
                    <InlineCitationSource
                      title="Meta AI"
                      url="https://ai.meta.com"
                      description="Building artificial intelligence tools and technologies."
                    />
                  </InlineCitationCarouselItem>
                </InlineCitationCarouselContent>
              </InlineCitationCarousel>
            </InlineCitationCardBody>
          </InlineCitationCard>
        </InlineCitation>
        , particularly in natural language processing and computer vision.
      </p>
    </div>
  ),
};
