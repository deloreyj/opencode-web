import path from "path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { fileURLToPath } from "node:url";

const dirname =
	typeof __dirname !== "undefined"
		? __dirname
		: path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	plugins: [
		react(),
		storybookTest({
			configDir: path.join(dirname, ".storybook"),
		}),
	],
	resolve: {
		alias: {
			"@": path.resolve(dirname, "./src"),
		},
	},
	test: {
		name: "storybook",
		browser: {
			enabled: true,
			headless: true,
			provider: "playwright",
			instances: [
				{
					browser: "chromium",
				},
			],
		},
		setupFiles: [".storybook/vitest.setup.ts"],
	},
});
