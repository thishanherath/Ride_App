/**
 * Kill existing Node processes and start server
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function killAndStart() {
  console.log('🔄 Killing existing Node processes...');
  
  try {
    // Kill all node processes
    await execAsync('taskkill /f /im node.exe');
    console.log('✅ Killed existing processes');
  } catch (error) {
    console.log('ℹ️  No existing Node processes found');
  }
  
  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('🚀 Starting server...');
  
  // Start the server
  const { spawn } = require('child_process');
  const server = spawn('node', ['server.js'], {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  server.on('error', (error) => {
    console.error('❌ Failed to start server:', error.message);
  });
  
  server.on('exit', (code) => {
    console.log(`Server exited with code ${code}`);
  });
}

killAndStart().catch(console.error);