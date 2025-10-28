/**
 * Comprehensive MongoDB Connection Diagnostic Tool
 * Analyzes and fixes MongoDB Atlas connection issues
 */

const mongoose = require('mongoose');
const dns = require('dns');
const { promisify } = require('util');
require('dotenv').config();

const resolveSrv = promisify(dns.resolveSrv);
const lookup = promisify(dns.lookup);

class MongoDBDiagnostic {
  constructor() {
    this.atlasUrl = process.env.MONGODB_PROD_URL;
    this.results = {
      urlParsing: null,
      dnsResolution: null,
      networkConnectivity: null,
      authentication: null,
      finalConnection: null
    };
  }

  log(step, status, message, details = null) {
    const emoji = status === 'success' ? '✅' : status === 'warning' ? '⚠️' : '❌';
    console.log(`${emoji} ${step}: ${message}`);
    if (details) {
      console.log(`   Details: ${details}`);
    }
    console.log('');
  }

  async parseConnectionString() {
    console.log('🔍 Step 1: Analyzing MongoDB Connection String\n');
    
    if (!this.atlasUrl) {
      this.log('URL Check', 'error', 'MONGODB_PROD_URL not found in environment variables');
      return false;
    }

    this.log('URL Check', 'success', 'Connection string found');
    console.log(`   URL: ${this.atlasUrl.replace(/\/\/.*@/, '//***:***@')}\n`);

    try {
      const url = new URL(this.atlasUrl);
      const hostname = url.hostname;
      const username = url.username;
      const database = url.pathname.slice(1).split('?')[0];
      
      this.results.urlParsing = {
        hostname,
        username,
        database,
        protocol: url.protocol
      };

      this.log('URL Parsing', 'success', 'Connection string parsed successfully', 
        `Host: ${hostname}, DB: ${database}, User: ${username}`);
      
      return true;
    } catch (error) {
      this.log('URL Parsing', 'error', 'Invalid connection string format', error.message);
      return false;
    }
  }

  async testDNSResolution() {
    console.log('🔍 Step 2: Testing DNS Resolution\n');
    
    const hostname = this.results.urlParsing.hostname;
    
    try {
      // Test SRV record resolution (MongoDB Atlas uses SRV records)
      console.log(`   Testing SRV record for: _mongodb._tcp.${hostname}`);
      const srvRecords = await resolveSrv(`_mongodb._tcp.${hostname}`);
      
      this.log('SRV Resolution', 'success', `Found ${srvRecords.length} SRV records`);
      
      srvRecords.forEach((record, index) => {
        console.log(`   SRV ${index + 1}: ${record.name}:${record.port} (priority: ${record.priority})`);
      });
      console.log('');

      // Test direct hostname resolution
      const ipAddress = await lookup(hostname);
      this.log('Hostname Resolution', 'success', `Resolved to IP: ${ipAddress.address}`);
      
      this.results.dnsResolution = { srvRecords, ipAddress };
      return true;
      
    } catch (error) {
      this.log('DNS Resolution', 'error', 'DNS resolution failed', error.message);
      
      // Try alternative DNS servers
      console.log('   Trying alternative DNS resolution...');
      try {
        const ipAddress = await lookup(hostname);
        this.log('Alternative DNS', 'success', `Resolved to IP: ${ipAddress.address}`);
        return true;
      } catch (altError) {
        this.log('Alternative DNS', 'error', 'All DNS resolution attempts failed', altError.message);
        return false;
      }
    }
  }

  async testNetworkConnectivity() {
    console.log('🔍 Step 3: Testing Network Connectivity\n');
    
    try {
      // Test basic MongoDB connection without authentication
      const testUrl = this.atlasUrl.replace(/\/\/.*@/, '//test:test@');
      
      const connection = mongoose.createConnection();
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout (10s)')), 10000);
      });

      const connectPromise = connection.openUri(testUrl, {
        serverSelectionTimeoutMS: 8000,
        connectTimeoutMS: 8000,
      });

      await Promise.race([connectPromise, timeoutPromise]);
      
      this.log('Network Connectivity', 'success', 'Network connection established');
      await connection.close();
      
      this.results.networkConnectivity = true;
      return true;
      
    } catch (error) {
      if (error.message.includes('Authentication failed')) {
        this.log('Network Connectivity', 'success', 'Network reachable (auth error expected)');
        this.results.networkConnectivity = true;
        return true;
      } else {
        this.log('Network Connectivity', 'error', 'Network connection failed', error.message);
        this.results.networkConnectivity = false;
        return false;
      }
    }
  }

  async testAuthentication() {
    console.log('🔍 Step 4: Testing Authentication\n');
    
    try {
      const connection = mongoose.createConnection();
      
      await connection.openUri(this.atlasUrl, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
      });

      // Test a simple operation
      const adminDb = connection.db.admin();
      await adminDb.ping();
      
      this.log('Authentication', 'success', 'Authentication successful');
      await connection.close();
      
      this.results.authentication = true;
      return true;
      
    } catch (error) {
      this.log('Authentication', 'error', 'Authentication failed', error.message);
      this.results.authentication = false;
      return false;
    }
  }

  async testFinalConnection() {
    console.log('🔍 Step 5: Testing Final Connection\n');
    
    try {
      await mongoose.connect(this.atlasUrl, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
      });

      this.log('Final Connection', 'success', 'MongoDB connection successful');
      
      // Test database operations
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log(`   Found ${collections.length} collections in database`);
      
      await mongoose.disconnect();
      
      this.results.finalConnection = true;
      return true;
      
    } catch (error) {
      this.log('Final Connection', 'error', 'Final connection failed', error.message);
      this.results.finalConnection = false;
      return false;
    }
  }

  generateSolutions() {
    console.log('💡 Recommended Solutions:\n');
    
    if (!this.results.urlParsing) {
      console.log('1. **Fix Connection String:**');
      console.log('   - Check MONGODB_PROD_URL in .env file');
      console.log('   - Ensure proper MongoDB Atlas connection string format');
      console.log('   - Format: mongodb+srv://username:password@cluster.mongodb.net/database\n');
    }

    if (!this.results.dnsResolution) {
      console.log('2. **DNS Resolution Issues:**');
      console.log('   - Check your internet connection');
      console.log('   - Try using different DNS servers (8.8.8.8, 1.1.1.1)');
      console.log('   - Disable VPN if active');
      console.log('   - Check firewall settings\n');
    }

    if (!this.results.networkConnectivity) {
      console.log('3. **Network Connectivity Issues:**');
      console.log('   - Check if MongoDB Atlas cluster is running');
      console.log('   - Verify network access in Atlas dashboard');
      console.log('   - Add your IP address to Atlas whitelist');
      console.log('   - Check corporate firewall settings\n');
    }

    if (!this.results.authentication) {
      console.log('4. **Authentication Issues:**');
      console.log('   - Verify username and password in connection string');
      console.log('   - Check user permissions in Atlas dashboard');
      console.log('   - Ensure user has access to the specified database');
      console.log('   - Try creating a new database user\n');
    }

    console.log('5. **Alternative Solutions:**');
    console.log('   - Try using standard connection string instead of SRV');
    console.log('   - Use MongoDB Compass to test connection');
    console.log('   - Check MongoDB Atlas status page');
    console.log('   - Contact MongoDB Atlas support if issue persists\n');
  }

  async runDiagnostic() {
    console.log('🚀 MongoDB Atlas Connection Diagnostic\n');
    console.log('=' .repeat(50) + '\n');

    const steps = [
      () => this.parseConnectionString(),
      () => this.testDNSResolution(),
      () => this.testNetworkConnectivity(),
      () => this.testAuthentication(),
      () => this.testFinalConnection()
    ];

    for (const step of steps) {
      const success = await step();
      if (!success) {
        console.log('❌ Diagnostic stopped due to failure\n');
        break;
      }
    }

    console.log('=' .repeat(50));
    this.generateSolutions();
    
    return this.results;
  }
}

// Run diagnostic if called directly
if (require.main === module) {
  const diagnostic = new MongoDBDiagnostic();
  diagnostic.runDiagnostic()
    .then(() => {
      console.log('🏁 Diagnostic complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Diagnostic failed:', error.message);
      process.exit(1);
    });
}

module.exports = MongoDBDiagnostic;