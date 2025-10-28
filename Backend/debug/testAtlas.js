/**
 * Simple MongoDB Atlas Connection Tester
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function testAtlasConnection() {
  console.log('🧪 Testing MongoDB Atlas Connection...\n');
  
  const mongoUrl = process.env.MONGODB_URL;
  
  if (!mongoUrl) {
    console.log('❌ MONGODB_URL not found in .env file');
    return;
  }
  
  console.log('URL:', mongoUrl.replace(/\/\/.*@/, '//***:***@'));
  console.log('');
  
  try {
    console.log('🔄 Connecting...');
    
    await mongoose.connect(mongoUrl, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
    });
    
    console.log('✅ Atlas connection successful!');
    
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
    
    console.log('\n💡 Solutions:');
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('querySrv')) {
      console.log('1. Your Atlas cluster hostname is incorrect');
      console.log('2. Go to MongoDB Atlas dashboard');
      console.log('3. Click "Connect" on your cluster');
      console.log('4. Choose "Connect your application"');
      console.log('5. Copy the correct connection string');
      console.log('6. Update MONGODB_URL in .env file');
    } else if (error.message.includes('Authentication failed')) {
      console.log('1. Check username and password in connection string');
      console.log('2. Verify user exists in Atlas dashboard');
      console.log('3. Ensure user has read/write permissions');
    } else if (error.message.includes('IP not whitelisted')) {
      console.log('1. Add your IP to Atlas whitelist');
      console.log('2. Or allow access from anywhere (0.0.0.0/0)');
    }
  }
}

testAtlasConnection()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });