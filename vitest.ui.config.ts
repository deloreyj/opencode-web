import path from "path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	test: {
		include: ["src/react-app/**/*.test.{ts,tsx}"],
		environment: "jsdom",
		setupFiles: ["./src/react-app/test/setup.ts"],
		globals: true,
	},
});
