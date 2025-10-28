/**
 * Network Diagnostic for MongoDB Atlas Connection Issues
 */

const dns = require('dns');
const { promisify } = require('util');
const https = require('https');
const mongoose = require('mongoose');
require('dotenv').config();

const resolveSrv = promisify(dns.resolveSrv);
const lookup = promisify(dns.lookup);

class NetworkDiagnostic {
  constructor() {
    this.mongoUrl = process.env.MONGODB_URL;
  }

  async testInternetConnection() {
    console.log('🌐 Testing Internet Connection...');
    
    return new Promise((resolve) => {
      const req = https.get('https://www.google.com', (res) => {
        console.log('✅ Internet connection: OK');
        resolve(true);
      });
      
      req.on('error', (error) => {
        console.log('❌ Internet connection: FAILED');
        console.log(`   Error: ${error.message}`);
        resolve(false);
      });
      
      req.setTimeout(5000, () => {
        console.log('❌ Internet connection: TIMEOUT');
        req.destroy();
        resolve(false);
      });
    });
  }

  async testDNSServers() {
    console.log('\n🔍 Testing DNS Servers...');
    
    const dnsServers = [
      '8.8.8.8',      // Google DNS
      '1.1.1.1',      // Cloudflare DNS
      '208.67.222.222' // OpenDNS
    ];
    
    for (const server of dnsServers) {
      try {
        dns.setServers([server]);
        await lookup('google.com');
        console.log(`✅ DNS Server ${server}: Working`);
        return true;
      } catch (error) {
        console.log(`❌ DNS Server ${server}: Failed`);
      }
    }
    
    console.log('❌ All DNS servers failed');
    return false;
  }

  async testMongoDBAtlasReachability() {
    console.log('\n🔍 Testing MongoDB Atlas Reachability...');
    
    try {
      // Test if we can reach MongoDB Atlas website
      return new Promise((resolve) => {
        const req = https.get('https://cloud.mongodb.com', (res) => {
          console.log('✅ MongoDB Atlas website: Reachable');
          resolve(true);
        });
        
        req.on('error', (error) => {
          console.log('❌ MongoDB Atlas website: Not reachable');
          console.log(`   Error: ${error.message}`);
          resolve(false);
        });
        
        req.setTimeout(10000, () => {
          console.log('❌ MongoDB Atlas website: Timeout');
          req.destroy();
          resolve(false);
        });
      });
    } catch (error) {
      console.log('❌ MongoDB Atlas website: Failed');
      return false;
    }
  }

  async testFirewallAndProxy() {
    console.log('\n🔍 Testing Firewall/Proxy Issues...');
    
    // Test different ports that MongoDB uses
    const testPorts = [27017, 27018, 27019];
    
    for (const port of testPorts) {
      try {
        const result = await this.testPortConnection('cluster0.mongodb.net', port);
        if (result) {
          console.log(`✅ Port ${port}: Accessible`);
          return true;
        } else {
          console.log(`❌ Port ${port}: Blocked`);
        }
      } catch (error) {
        console.log(`❌ Port ${port}: Error - ${error.message}`);
      }
    }
    
    console.log('⚠️  All MongoDB ports appear to be blocked');
    console.log('   This suggests firewall or corporate network restrictions');
    return false;
  }

  testPortConnection(host, port) {
    return new Promise((resolve) => {
      const net = require('net');
      const socket = new net.Socket();
      
      socket.setTimeout(5000);
      
      socket.on('connect', () => {
        socket.destroy();
        resolve(true);
      });
      
      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });
      
      socket.on('error', () => {
        resolve(false);
      });
      
      socket.connect(port, host);
    });
  }

  async testDirectMongoConnection() {
    console.log('\n🔍 Testing Direct MongoDB Connection...');
    
    if (!this.mongoUrl) {
      console.log('❌ No MONGODB_URL found in environment');
      return false;
    }
    
    console.log(`URL: ${this.mongoUrl.replace(/\/\/.*@/, '//***:***@')}`);
    
    try {
      // Try with different timeout settings
      const timeouts = [5000, 10000, 30000];
      
      for (const timeout of timeouts) {
        try {
          console.log(`   Trying with ${timeout/1000}s timeout...`);
          
          await mongoose.connect(this.mongoUrl, {
            serverSelectionTimeoutMS: timeout,
            connectTimeoutMS: timeout,
            socketTimeoutMS: timeout,
          });
          
          console.log('✅ MongoDB connection: SUCCESS');
          await mongoose.disconnect();
          return true;
          
        } catch (error) {
          console.log(`   ${timeout/1000}s timeout: ${error.message.split('\n')[0]}`);
          
          if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
          }
        }
      }
      
      console.log('❌ All connection attempts failed');
      return false;
      
    } catch (error) {
      console.log('❌ MongoDB connection failed:', error.message);
      return false;
    }
  }

  async checkNetworkEnvironment() {
    console.log('\n🔍 Checking Network Environment...');
    
    // Check if running in corporate network
    const hostname = require('os').hostname();
    console.log(`Computer name: ${hostname}`);
    
    // Check for proxy environment variables
    const proxyVars = ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy'];
    let hasProxy = false;
    
    proxyVars.forEach(varName => {
      if (process.env[varName]) {
        console.log(`⚠️  Proxy detected: ${varName} = ${process.env[varName]}`);
        hasProxy = true;
      }
    });
    
    if (!hasProxy) {
      console.log('✅ No proxy environment variables detected');
    }
    
    // Check for VPN
    console.log('💡 If you\'re using VPN, try disconnecting temporarily');
    console.log('💡 If you\'re on corporate network, check with IT about MongoDB access');
  }

  generateSolutions(results) {
    console.log('\n' + '='.repeat(60));
    console.log('💡 RECOMMENDED SOLUTIONS');
    console.log('='.repeat(60));
    
    if (!results.internet) {
      console.log('\n🔧 Internet Connection Issues:');
      console.log('1. Check your internet connection');
      console.log('2. Restart your router/modem');
      console.log('3. Try a different network');
    }
    
    if (!results.dns) {
      console.log('\n🔧 DNS Issues:');
      console.log('1. Change DNS servers to 8.8.8.8 and 8.8.4.4');
      console.log('2. Flush DNS cache: ipconfig /flushdns');
      console.log('3. Restart network adapter');
    }
    
    if (!results.atlas) {
      console.log('\n🔧 MongoDB Atlas Issues:');
      console.log('1. Check MongoDB Atlas status: https://status.cloud.mongodb.com/');
      console.log('2. Verify your cluster is running in Atlas dashboard');
      console.log('3. Check if your IP is whitelisted in Network Access');
    }
    
    if (!results.firewall) {
      console.log('\n🔧 Firewall/Network Issues:');
      console.log('1. Disable Windows Firewall temporarily for testing');
      console.log('2. Check antivirus firewall settings');
      console.log('3. If on corporate network, ask IT to allow MongoDB ports');
      console.log('4. Try from a different network (mobile hotspot)');
    }
    
    console.log('\n🔧 Alternative Solutions:');
    console.log('1. Try using standard connection string instead of SRV');
    console.log('2. Use MongoDB Compass to test connection');
    console.log('3. Create a new Atlas cluster in different region');
    console.log('4. Contact your network administrator');
    
    console.log('\n🎯 Quick Test:');
    console.log('Try connecting from mobile hotspot to isolate network issues');
  }

  async runDiagnostic() {
    console.log('🚀 MongoDB Atlas Network Diagnostic');
    console.log('='.repeat(60));
    
    const results = {
      internet: await this.testInternetConnection(),
      dns: await this.testDNSServers(),
      atlas: await this.testMongoDBAtlasReachability(),
      firewall: await this.testFirewallAndProxy(),
      mongo: await this.testDirectMongoConnection()
    };
    
    await this.checkNetworkEnvironment();
    
    this.generateSolutions(results);
    
    return results;
  }
}

// Run diagnostic
const diagnostic = new NetworkDiagnostic();
diagnostic.runDiagnostic()
  .then((results) => {
    const allPassed = Object.values(results).every(r => r === true);
    console.log(`\n🏁 Diagnostic ${allPassed ? 'PASSED' : 'FAILED'}`);
    process.exit(allPassed ? 0 : 1);
  })
  .catch((error) => {
    console.error('❌ Diagnostic error:', error.message);
    process.exit(1);
  });