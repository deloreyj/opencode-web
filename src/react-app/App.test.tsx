import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

describe("App component", () => {
	it("renders the main heading", () => {
		render(<App />);
		expect(
			screen.getByText(/Vite \+ React \+ Hono \+ Cloudflare/i),
		).toBeInTheDocument();
	});

	it("increments count when button is clicked", async () => {
		const user = userEvent.setup();
		render(<App />);
		const button = screen.getByRole("button", { name: /increment/i });
		expect(button).toHaveTextContent("Count is 0");
		await user.click(button);
		expect(button).toHaveTextContent("Count is 1");
	});

	it("displays initial name as unknown", () => {
		render(<App />);
		const button = screen.getByRole("button", { name: /get name/i });
		expect(button).toHaveTextContent("Name from API: unknown");
	});
});
