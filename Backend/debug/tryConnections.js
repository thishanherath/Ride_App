/**
 * Try different Atlas connection string patterns
 */

require('dotenv').config();
const mongoose = require('mongoose');

const connectionStrings = [
  // Common Atlas patterns - replace with your actual cluster details
  'mongodb+srv://thishan:123@cluster0.abcde.mongodb.net/quickRide?retryWrites=true&w=majority',
  'mongodb+srv://thishan:123@cluster0.fghij.mongodb.net/quickRide?retryWrites=true&w=majority',
  'mongodb+srv://thishan:123@cluster0.klmno.mongodb.net/quickRide?retryWrites=true&w=majority',
  'mongodb+srv://thishan:123@quickride.abcde.mongodb.net/quickRide?retryWrites=true&w=majority',
  
  // Your original (likely incorrect)
  'mongodb+srv://thishan:123@cluster0.mongodb.net/quickRide?retryWrites=true&w=majority',
];

async function tryConnection(url, index) {
  try {
    console.log(`\n🔄 Testing connection ${index + 1}:`);
    console.log(`   ${url.replace(/\/\/.*@/, '//***:***@')}`);
    
    await mongoose.connect(url, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    
    console.log('✅ SUCCESS! This connection works!');
    console.log(`\n🎯 Update your .env file with:`);
    console.log(`MONGODB_URL=${url}`);
    
    await mongoose.disconnect();
    return true;
    
  } catch (error) {
    console.log(`❌ Failed: ${error.message.split('\n')[0]}`);
    return false;
  }
}

async function tryAllConnections() {
  console.log('🧪 Trying different Atlas connection patterns...\n');
  console.log('⚠️  These are example patterns. You need to get your actual');
  console.log('   connection string from your MongoDB Atlas dashboard.\n');
  
  for (let i = 0; i < connectionStrings.length; i++) {
    const success = await tryConnection(connectionStrings[i], i);
    if (success) {
      return;
    }
  }
  
  console.log('\n❌ None of the test patterns worked.');
  console.log('\n💡 You need to:');
  console.log('1. Login to MongoDB Atlas: https://cloud.mongodb.com/');
  console.log('2. Go to your cluster');
  console.log('3. Click "Connect" → "Connect your application"');
  console.log('4. Copy the EXACT connection string');
  console.log('5. Replace the password placeholder with your actual password');
  console.log('6. Update MONGODB_URL in your .env file');
}

tryAllConnections()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });