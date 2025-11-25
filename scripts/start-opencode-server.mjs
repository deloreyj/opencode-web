#!/usr/bin/env node
/**
 * Start OpenCode server for local development
 *
 * This script starts the OpenCode server on a specific port and hostname
 * so the development app can connect to it.
 */

import { spawn } from 'child_process';

const OPENCODE_PORT = process.env.OPENCODE_PORT || '4096';
const OPENCODE_HOSTNAME = process.env.OPENCODE_HOSTNAME || '127.0.0.1';

console.log('🚀 Starting OpenCode server...');
console.log(`   Port: ${OPENCODE_PORT}`);
console.log(`   Hostname: ${OPENCODE_HOSTNAME}`);
console.log('');

// Check if opencode is installed
const checkInstall = spawn('opencode', ['--version'], { stdio: 'pipe' });

checkInstall.on('error', (err) => {
  console.error('❌ OpenCode is not installed or not in PATH');
  console.error('');
  console.error('Please install OpenCode:');
  console.error('  curl -fsSL https://opencode.ai/install.sh | sh');
  console.error('');
  console.error('Or using npm:');
  console.error('  npm install -g @opencode-ai/cli');
  console.error('');
  process.exit(1);
});

checkInstall.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Failed to check OpenCode installation');
    process.exit(1);
  }

  // Start the server
  const server = spawn('opencode', [
    'serve',
    '--port', OPENCODE_PORT,
    '--hostname', OPENCODE_HOSTNAME
  ], {
    stdio: 'inherit',
    env: {
      ...process.env,
      // Ensure OpenCode uses the right configuration
      OPENCODE_PORT,
      OPENCODE_HOSTNAME,
    }
  });

  server.on('error', (err) => {
    console.error('❌ Failed to start OpenCode server:', err.message);
    process.exit(1);
  });

  server.on('close', (code) => {
    if (code !== 0) {
      console.error(`❌ OpenCode server exited with code ${code}`);
      process.exit(code);
    }
  });

  // Handle termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping OpenCode server...');
    server.kill('SIGINT');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Stopping OpenCode server...');
    server.kill('SIGTERM');
    process.exit(0);
  });

  console.log('✅ OpenCode server started successfully');
  console.log(`📡 API available at http://${OPENCODE_HOSTNAME}:${OPENCODE_PORT}`);
  console.log(`📖 API docs at http://${OPENCODE_HOSTNAME}:${OPENCODE_PORT}/doc`);
  console.log('');
});