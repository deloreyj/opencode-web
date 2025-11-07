#!/usr/bin/env node
/**
 * Local Git Diff Server
 *
 * A simple HTTP server that runs git commands on the local machine.
 * Used for local development when the Workers runtime can't execute child processes.
 *
 * Usage: node git-diff-server.js
 *
 * Endpoints:
 *   GET /diff - Returns git diff HEAD
 *   POST /stage-all - Runs git add -A
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

	// Handle GET /diff
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
	}
	// Handle GET /status
	else if (req.method === 'GET' && req.url === '/status') {
		try {
			console.log('[Git Diff Server] Running git status --porcelain...');

			// Run git status in porcelain format for easy parsing
			const status = execSync('git status --porcelain', {
				encoding: 'utf-8',
			});

			console.log(`[Git Diff Server] Status retrieved`);

			res.writeHead(200);
			res.end(JSON.stringify({ status }));
		} catch (error) {
			console.error('[Git Diff Server] Error:', error.message);

			res.writeHead(200);
			res.end(JSON.stringify({ status: '' }));
		}
	}
	// Handle POST /stage-all
	else if (req.method === 'POST' && req.url === '/stage-all') {
		try {
			console.log('[Git Diff Server] Running git add -A...');

			// Stage all changes
			execSync('git add -A', {
				encoding: 'utf-8',
			});

			console.log('[Git Diff Server] All changes staged successfully');

			res.writeHead(200);
			res.end(JSON.stringify({ success: true, message: 'All changes staged' }));
		} catch (error) {
			console.error('[Git Diff Server] Error staging changes:', error.message);

			res.writeHead(500);
			res.end(JSON.stringify({
				success: false,
				error: error.message
			}));
		}
	}
	// Handle POST /stage - stage individual file
	else if (req.method === 'POST' && req.url === '/stage') {
		let body = '';
		req.on('data', chunk => { body += chunk; });
		req.on('end', () => {
			try {
				const { filepath } = JSON.parse(body);

				if (!filepath) {
					res.writeHead(400);
					res.end(JSON.stringify({ success: false, error: 'filepath is required' }));
					return;
				}

				console.log(`[Git Diff Server] Staging file: ${filepath}`);

				execSync(`git add ${JSON.stringify(filepath)}`, {
					encoding: 'utf-8',
				});

				console.log(`[Git Diff Server] File staged successfully: ${filepath}`);

				res.writeHead(200);
				res.end(JSON.stringify({ success: true, message: `Staged ${filepath}` }));
			} catch (error) {
				console.error('[Git Diff Server] Error staging file:', error.message);

				res.writeHead(500);
				res.end(JSON.stringify({
					success: false,
					error: error.message
				}));
			}
		});
	}
	// Handle POST /unstage - unstage individual file
	else if (req.method === 'POST' && req.url === '/unstage') {
		let body = '';
		req.on('data', chunk => { body += chunk; });
		req.on('end', () => {
			try {
				const { filepath } = JSON.parse(body);

				if (!filepath) {
					res.writeHead(400);
					res.end(JSON.stringify({ success: false, error: 'filepath is required' }));
					return;
				}

				console.log(`[Git Diff Server] Unstaging file: ${filepath}`);

				execSync(`git restore --staged ${JSON.stringify(filepath)}`, {
					encoding: 'utf-8',
				});

				console.log(`[Git Diff Server] File unstaged successfully: ${filepath}`);

				res.writeHead(200);
				res.end(JSON.stringify({ success: true, message: `Unstaged ${filepath}` }));
			} catch (error) {
				console.error('[Git Diff Server] Error unstaging file:', error.message);

				res.writeHead(500);
				res.end(JSON.stringify({
					success: false,
					error: error.message
				}));
			}
		});
	} else {
		res.writeHead(404);
		res.end(JSON.stringify({ error: 'Not found' }));
	}
});

server.listen(PORT, '127.0.0.1', () => {
	console.log(`[Git Diff Server] Listening on http://127.0.0.1:${PORT}`);
	console.log('[Git Diff Server] Ready to serve git diffs for local development');
});
