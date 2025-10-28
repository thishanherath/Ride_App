/**
 * Port Management Script
 * Handles port conflicts and ensures clean startup
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class PortManager {
  constructor() {
    this.backendPort = process.env.PORT || 4000;
    this.frontendPort = 5173; // Vite default
  }

  async checkPortInUse(port) {
    try {
      const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
      return stdout.trim().length > 0;
    } catch (error) {
      return false;
    }
  }

  async killProcessOnPort(port) {
    try {
      console.log(`🔄 Checking port ${port}...`);
      
      const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
      
      if (stdout.trim()) {
        console.log(`⚠️  Port ${port} is in use`);
        
        // Extract PID from netstat output
        const lines = stdout.trim().split('\n');
        const pids = new Set();
        
        lines.forEach(line => {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && pid !== '0') {
            pids.add(pid);
          }
        });
        
        // Kill each process
        for (const pid of pids) {
          try {
            await execAsync(`taskkill /F /PID ${pid}`);
            console.log(`✅ Killed process ${pid} on port ${port}`);
          } catch (error) {
            console.log(`⚠️  Could not kill process ${pid}: ${error.message}`);
          }
        }
        
        // Wait a moment for processes to fully terminate
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } else {
        console.log(`✅ Port ${port} is available`);
      }
      
    } catch (error) {
      console.log(`✅ Port ${port} appears to be available`);
    }
  }

  async findAvailablePort(startPort) {
    for (let port = startPort; port < startPort + 10; port++) {
      const inUse = await this.checkPortInUse(port);
      if (!inUse) {
        return port;
      }
    }
    throw new Error(`No available ports found starting from ${startPort}`);
  }

  async setupPorts() {
    console.log('🚀 Port Management Setup\n');
    
    // Check and clean backend port
    console.log('📡 Backend Port Setup:');
    await this.killProcessOnPort(this.backendPort);
    
    // Check frontend port
    console.log('\n🎨 Frontend Port Setup:');
    const frontendInUse = await this.checkPortInUse(this.frontendPort);
    
    if (frontendInUse) {
      console.log(`⚠️  Frontend port ${this.frontendPort} is in use`);
      console.log('💡 This is normal if frontend is running');
    } else {
      console.log(`✅ Frontend port ${this.frontendPort} is available`);
    }
    
    console.log('\n📋 Port Configuration:');
    console.log(`   Backend:  http://localhost:${this.backendPort}`);
    console.log(`   Frontend: http://localhost:${this.frontendPort}`);
    
    return {
      backend: this.backendPort,
      frontend: this.frontendPort
    };
  }

  async startServer() {
    console.log('\n🚀 Starting Backend Server...');
    
    const { spawn } = require('child_process');
    const server = spawn('node', ['server.js'], {
      stdio: 'inherit',
      cwd: process.cwd(),
      env: { ...process.env, PORT: this.backendPort }
    });
    
    server.on('error', (error) => {
      console.error('❌ Failed to start server:', error.message);
    });
    
    return server;
  }
}

// Run if called directly
if (require.main === module) {
  const portManager = new PortManager();
  
  portManager.setupPorts()
    .then((ports) => {
      console.log('\n✅ Port setup complete!');
      console.log('\n🎯 Next steps:');
      console.log('1. Start backend: npm run dev');
      console.log('2. Start frontend: npm run dev (in Frontend folder)');
      console.log('\n📡 API will be available at:', `http://localhost:${ports.backend}`);
      console.log('🎨 Frontend will be available at:', `http://localhost:${ports.frontend}`);
    })
    .catch(error => {
      console.error('❌ Port setup failed:', error.message);
      process.exit(1);
    });
}

module.exports = PortManager;