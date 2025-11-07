// Container Worker - Runs inside the sandbox container
// This worker uses the same Hono app as the main Cloudflare Worker
// but connects to the local OpenCode server at localhost:4096
import { createOpencodeApp } from "./opencode-app";
import { logger } from "../lib/logger";

// Set container mode env var
process.env.CONTAINER_MODE = 'true';

logger.info('Container Worker starting');
logger.info('OpenCode URL: http://localhost:4096');
logger.info(`Log file: ${logger.getLogFilePath() || 'console only'}`);

// Create the app with localhost:4096 as the OpenCode server
const app = createOpencodeApp({
	opencodeBaseUrl: "http://localhost:4096",
});

logger.info('App created, starting server on port 8080');

// Start the server on port 8080 (we'll expose this from the container)
// Or use PORT env var for local testing
export default {
	port: parseInt(process.env.PORT || '8080'),
	fetch: app.fetch,
};
