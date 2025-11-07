#!/usr/bin/env node
/**
 * Local Git Diff Server
 *
 * A simple HTTP server that runs git diff commands on the local machine.
 * Used for local development when the Workers runtime can't execute child processes.
 *
 * Usage: node git-diff-server.js
 *
 * Endpoints:
 *   GET /diff - Returns git diff HEAD
 */

import { createServer } from 'node:http';
import { execSync } from 'node:child_process';

const PORT = 4097;

const server = createServer((req, res) => {
	// Enable CORS for local dev
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
	res.setHeader('Content-Type', 'application/json');

	// Handle preflight
	if (req.method === 'OPTIONS') {
		res.writeHead(200);
		res.end();
		return;
	}

	// Only handle GET /diff
	if (req.method === 'GET' && req.url === '/diff') {
		try {
			console.log('[Git Diff Server] Running git diff HEAD...');

			// Run git diff in the current working directory
			const diff = execSync('git diff HEAD', {
				encoding: 'utf-8',
				maxBuffer: 10 * 1024 * 1024, // 10MB max
			});

			console.log(`[Git Diff Server] Diff size: ${diff.length} bytes`);

			res.writeHead(200);
			res.end(JSON.stringify({ diff }));
		} catch (error) {
			console.error('[Git Diff Server] Error:', error.message);

			// Return empty diff on error (might not be in a git repo, etc.)
			res.writeHead(200);
			res.end(JSON.stringify({ diff: '' }));
		}
	} else {
		res.writeHead(404);
		res.end(JSON.stringify({ error: 'Not found' }));
	}
});

server.listen(PORT, '127.0.0.1', () => {
	console.log(`[Git Diff Server] Listening on http://127.0.0.1:${PORT}`);
	console.log('[Git Diff Server] Ready to serve git diffs for local development');
});
