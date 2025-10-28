/**
 * Simple MongoDB Atlas Connection Test
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function testAtlasConnection() {
  console.log('🧪 Testing MongoDB Atlas Connection...\n');
  
  const mongoUrl = process.env.MONGODB_URL;
  console.log(`URL: ${mongoUrl ? mongoUrl.replace(/\/\/.*@/, '//***:***@') : 'Not set'}\n`);
  
  if (!mongoUrl) {
    console.log('❌ MONGODB_URL not found in .env file');
    return;
  }
  
  try {
    console.log('🔄 Connecting to Atlas...');
    
    await mongoose.connect(mongoUrl, {
      serverSelectionTimeoutMS: 15000,
    });
    
    console.log('✅ Atlas connection successful!');
    
    // Test database operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📊 Found ${collections.length} collections`);
    
    await mongoose.disconnect();
    console.log('✅ Test completed successfully');
    
  } catch (error) {
    console.log('❌ Atlas connection failed:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('💡 DNS issue - check cluster URL and internet connection');
    } else if (error.message.includes('Authentication failed')) {
      console.log('💡 Auth issue - check username/password in connection string');
    } else if (error.message.includes('IP not whitelisted')) {
      console.log('💡 Network issue - add your IP to Atlas whitelist');
    }
  }
}

testAtlasConnection()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });