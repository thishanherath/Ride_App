/**
 * Server Restart Script
 * Safely restarts the server with proper cleanup
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🔄 Server Restart Script Starting...');

// Kill any existing node processes on port 4000
async function killExistingProcesses() {
  return new Promise((resolve) => {
    console.log('🔍 Checking for existing processes on port 4000...');
    
    const isWindows = process.platform === 'win32';
    
    if (isWindows) {
      // Windows command to find and kill processes on port 4000
      const findProcess = spawn('netstat', ['-ano'], { shell: true });
      let output = '';
      
      findProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      findProcess.on('close', () => {
        const lines = output.split('\n');
        const port4000Lines = lines.filter(line => line.includes(':4000'));
        
        if (port4000Lines.length > 0) {
          console.log('🔍 Found processes on port 4000:');
          port4000Lines.forEach(line => {
            const parts = line.trim().split(/\s+/);
            const pid = parts[parts.length - 1];
            if (pid && pid !== '0') {
              console.log(`💀 Killing process ${pid}`);
              spawn('taskkill', ['/F', '/PID', pid], { shell: true });
            }
          });
          
          setTimeout(resolve, 2000); // Wait 2 seconds for processes to die
        } else {
          console.log('✅ No existing processes found on port 4000');
          resolve();
        }
      });
    } else {
      // Unix/Linux command
      const killProcess = spawn('lsof', ['-ti:4000'], { shell: true });
      let pids = '';
      
      killProcess.stdout.on('data', (data) => {
        pids += data.toString();
      });
      
      killProcess.on('close', () => {
        if (pids.trim()) {
          console.log('💀 Killing existing processes:', pids.trim());
          spawn('kill', ['-9', ...pids.trim().split('\n')], { shell: true });
          setTimeout(resolve, 2000);
        } else {
          console.log('✅ No existing processes found on port 4000');
          resolve();
        }
      });
    }
  });
}

// Start the server
async function startServer() {
  console.log('🚀 Starting server...');
  
  const serverPath = path.join(__dirname, '..', 'server.js');
  const server = spawn('node', [serverPath], {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  
  server.on('error', (error) => {
    console.error('❌ Server start error:', error);
  });
  
  server.on('close', (code) => {
    console.log(`🔄 Server process exited with code ${code}`);
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('🔄 Gracefully shutting down server...');
    server.kill('SIGINT');
    process.exit(0);
  });
  
  return server;
}

// Main restart function
async function restartServer() {
  try {
    await killExistingProcesses();
    console.log('✅ Cleanup completed');
    
    console.log('⏳ Waiting 3 seconds before starting...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    await startServer();
    console.log('✅ Server restart completed');
    
  } catch (error) {
    console.error('❌ Restart failed:', error);
  }
}

// Run the restart
restartServer();