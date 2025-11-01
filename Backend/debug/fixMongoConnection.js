/**
 * MongoDB Connection Fix
 * This script helps diagnose and fix MongoDB connection issues
 */

const mongoose = require('mongoose');
require('dotenv').config();

console.log('🔍 MongoDB Connection Diagnostic Starting...');

// Log environment variables (without exposing sensitive data)
console.log('📋 Environment Check:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('- MONGODB_URI length:', process.env.MONGODB_URI?.length || 0);

// Enhanced connection options for better reliability
const connectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // 30 seconds
  socketTimeoutMS: 45000, // 45 seconds
  connectTimeoutMS: 30000, // 30 seconds
  maxPoolSize: 10, // Maintain up to 10 socket connections
  minPoolSize: 5, // Maintain a minimum of 5 socket connections
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  bufferMaxEntries: 0, // Disable mongoose buffering
  bufferCommands: false, // Disable mongoose buffering
  heartbeatFrequencyMS: 10000, // Send a ping every 10 seconds
  retryWrites: true,
  retryReads: true,
};

async function testConnection() {
  try {
    console.log('🔄 Attempting MongoDB connection...');
    
    // Close any existing connections
    if (mongoose.connection.readyState !== 0) {
      console.log('🔄 Closing existing connection...');
      await mongoose.disconnect();
    }
    
    // Connect with enhanced options
    await mongoose.connect(process.env.MONGODB_URI, connectionOptions);
    
    console.log('✅ MongoDB connected successfully!');
    console.log('📊 Connection details:');
    console.log('- Ready State:', mongoose.connection.readyState);
    console.log('- Database Name:', mongoose.connection.db.databaseName);
    console.log('- Host:', mongoose.connection.host);
    console.log('- Port:', mongoose.connection.port);
    
    // Test a simple operation
    console.log('🧪 Testing database operation...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('✅ Database operation successful!');
    console.log('📋 Collections found:', collections.map(c => c.name));
    
    return true;
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.name === 'MongoNetworkTimeoutError') {
      console.log('💡 Network timeout detected. Suggestions:');
      console.log('1. Check your internet connection');
      console.log('2. Verify MongoDB Atlas cluster is running');
      console.log('3. Check IP whitelist in MongoDB Atlas');
      console.log('4. Try connecting from a different network');
    }
    
    if (error.name === 'MongoPoolClearedError') {
      console.log('💡 Connection pool cleared. Suggestions:');
      console.log('1. Restart the application');
      console.log('2. Check MongoDB Atlas cluster status');
      console.log('3. Verify connection string is correct');
    }
    
    return false;
  }
}

async function fixConnection() {
  console.log('🔧 Attempting connection fix...');
  
  // Try multiple connection attempts with backoff
  const maxRetries = 3;
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    console.log(`🔄 Connection attempt ${retryCount + 1}/${maxRetries}`);
    
    const success = await testConnection();
    if (success) {
      console.log('✅ Connection fix successful!');
      return true;
    }
    
    retryCount++;
    if (retryCount < maxRetries) {
      const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
      console.log(`⏳ Waiting ${delay/1000} seconds before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  console.log('❌ Connection fix failed after all retries');
  return false;
}

// Handle process events
process.on('SIGINT', async () => {
  console.log('🔄 Gracefully closing MongoDB connection...');
  await mongoose.disconnect();
  process.exit(0);
});

// Run the fix
fixConnection().then(success => {
  if (success) {
    console.log('🎉 MongoDB connection is working properly!');
    console.log('💡 You can now start your application');
  } else {
    console.log('❌ Unable to establish MongoDB connection');
    console.log('💡 Please check your MongoDB Atlas configuration');
  }
}).catch(error => {
  console.error('❌ Unexpected error:', error);
}).finally(() => {
  // Keep connection open for testing
  console.log('🔄 Keeping connection open for testing...');
  console.log('Press Ctrl+C to exit');
});