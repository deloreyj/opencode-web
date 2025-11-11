#!/usr/bin/env node
/**
 * Start all development servers concurrently
 *
 * This script starts:
 * 1. OpenCode server (port 4096)
 * 2. Git diff server (port 4097)
 * 3. Vite dev server (port 5173)
 */

import { spawn } from 'child_process';
import { setTimeout as wait } from 'timers/promises';

const servers = [];
let exiting = false;

const colors = {
  reset: '\x1b[0m',
  opencode: '\x1b[36m', // Cyan
  vite: '\x1b[35m', // Magenta
  gitdiff: '\x1b[33m', // Yellow
};

function prefix(name, color) {
  return `${color}[${name}]${colors.reset}`;
}

function startServer(name, command, args, color, env = {}) {
  console.log(`${prefix(name, color)} Starting...`);

  const proc = spawn(command, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, ...env },
    shell: true,
  });

  proc.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach((line) => {
      if (line.trim()) {
        console.log(`${prefix(name, color)} ${line}`);
      }
    });
  });

  proc.stderr.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach((line) => {
      if (line.trim()) {
        console.error(`${prefix(name, color)} ${line}`);
      }
    });
  });

  proc.on('error', (err) => {
    console.error(`${prefix(name, color)} Error: ${err.message}`);
  });

  proc.on('close', (code) => {
    if (!exiting) {
      console.error(`${prefix(name, color)} Exited with code ${code}`);
      cleanup();
    }
  });

  servers.push({ name, proc, color });
  return proc;
}

async function cleanup() {
  if (exiting) return;
  exiting = true;

  console.log('\n🛑 Shutting down servers...');

  for (const { name, proc, color } of servers) {
    try {
      console.log(`${prefix(name, color)} Stopping...`);
      proc.kill('SIGTERM');
    } catch (err) {
      // Ignore errors during cleanup
    }
  }

  await wait(1000);
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

async function main() {
  console.log('🚀 Starting development environment...\n');

  // Start OpenCode server first
  startServer(
    'opencode',
    'node',
    ['scripts/start-opencode-server.mjs'],
    colors.opencode,
    {
      OPENCODE_PORT: '4096',
      OPENCODE_HOSTNAME: '127.0.0.1',
    }
  );

  // Start Git diff server
  startServer(
    'gitdiff',
    'node',
    ['src/internal-scripts/git-diff-server.js'],
    colors.gitdiff
  );

  // Wait a bit for OpenCode to start
  await wait(2000);

  // Start Vite dev server
  startServer(
    'vite',
    'vite',
    [],
    colors.vite,
    {
      VITE_OPENCODE_URL: 'http://127.0.0.1:4096',
    }
  );

  console.log('\n✅ All servers started');
  console.log('📡 OpenCode API: http://127.0.0.1:4096');
  console.log('🔧 Git diff server: http://127.0.0.1:4097');
  console.log('🌐 Vite dev server: http://localhost:5173');
  console.log('\nPress Ctrl+C to stop all servers\n');
}

main().catch((err) => {
  console.error('Failed to start:', err);
  cleanup();
});
