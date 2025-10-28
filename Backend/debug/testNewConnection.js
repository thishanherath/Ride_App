/**
 * Test the new MongoDB connection configuration
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  console.log('🧪 Testing MongoDB Connection...\n');
  
  const environment = process.env.ENVIRONMENT;
  console.log(`Environment: ${environment}`);
  
  let mongoUrl;
  if (environment === 'production') {
    mongoUrl = process.env.MONGODB_PROD_URL;
    console.log('Using Atlas connection');
  } else {
    mongoUrl = process.env.MONGODB_DEV_URL;
    console.log('Using local connection');
  }
  
  console.log(`URL: ${mongoUrl ? mongoUrl.replace(/\/\/.*@/, '//***:***@') : 'Not set'}\n`);
  
  if (!mongoUrl) {
    console.log('❌ No connection string found');
    return;
  }
  
  try {
    console.log('🔄 Attempting connection...');
    
    await mongoose.connect(mongoUrl, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    
    console.log('✅ Connection successful!');
    
    // Test database operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📊 Found ${collections.length} collections`);
    
    if (collections.length > 0) {
      console.log('Collections:', collections.map(c => c.name).join(', '));
    }
    
    await mongoose.disconnect();
    console.log('✅ Test completed successfully');
    
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('💡 This appears to be a DNS/hostname issue');
      console.log('   - The MongoDB cluster hostname cannot be resolved');
      console.log('   - Check if the cluster exists and is accessible');
    }
  }
}

testConnection()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });