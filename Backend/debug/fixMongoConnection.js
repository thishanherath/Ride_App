/**
 * MongoDB Connection Fix Script
 * Provides solutions and alternative connection strings
 */

require('dotenv').config();

console.log('🔧 MongoDB Connection Fix Tool\n');
console.log('Current connection string issues detected.\n');

const currentUrl = process.env.MONGODB_PROD_URL;
console.log('Current URL:', currentUrl ? currentUrl.replace(/\/\/.*@/, '//***:***@') : 'Not set');
console.log('');

console.log('🎯 Recommended Solutions:\n');

console.log('1. **Create a New MongoDB Atlas Cluster:**');
console.log('   - Go to https://cloud.mongodb.com/');
console.log('   - Create a new free cluster');
console.log('   - Choose a cloud provider and region');
console.log('   - Create a database user');
console.log('   - Whitelist your IP address (or use 0.0.0.0/0 for testing)');
console.log('   - Get the new connection string\n');

console.log('2. **Fix Current Connection String:**');
if (currentUrl) {
  try {
    const url = new URL(currentUrl);
    const username = url.username;
    const password = url.password;
    
    console.log('   Current parsed details:');
    console.log(`   - Username: ${username}`);
    console.log(`   - Password: ${password ? '***' : 'Not set'}`);
    console.log(`   - Hostname: ${url.hostname}`);
    console.log(`   - Database: ${url.pathname.slice(1).split('?')[0]}`);
    console.log('');
    
    // Suggest alternative hostnames
    console.log('   Try these alternative connection strings:');
    console.log('   (Replace with your actual cluster details)');
    console.log('');
    
    const alternatives = [
      `mongodb+srv://${username}:${password}@cluster0.mongodb.net/quickRide?retryWrites=true&w=majority`,
      `mongodb+srv://${username}:${password}@cluster0.abcde.mongodb.net/quickRide?retryWrites=true&w=majority`,
      `mongodb://${username}:${password}@cluster0-shard-00-00.abcde.mongodb.net:27017,cluster0-shard-00-01.abcde.mongodb.net:27017,cluster0-shard-00-02.abcde.mongodb.net:27017/quickRide?ssl=true&replicaSet=atlas-abcde-shard-0&authSource=admin&retryWrites=true&w=majority`
    ];
    
    alternatives.forEach((alt, index) => {
      console.log(`   Option ${index + 1}: ${alt.replace(/\/\/.*@/, '//***:***@')}`);
    });
    
  } catch (error) {
    console.log('   ❌ Current connection string is malformed');
  }
}

console.log('\n3. **Use MongoDB Compass to Test:**');
console.log('   - Download MongoDB Compass');
console.log('   - Test connection with your Atlas cluster');
console.log('   - Copy the working connection string');
console.log('');

console.log('4. **Temporary Local Solution:**');
console.log('   - Install MongoDB locally');
console.log('   - Use: mongodb://127.0.0.1:27017/quickRide');
console.log('   - Change ENVIRONMENT to "development" in .env');
console.log('');

console.log('5. **Quick Fix - Update .env:**');
console.log('   Replace MONGODB_PROD_URL with a working connection string:');
console.log('   MONGODB_PROD_URL=mongodb+srv://username:password@your-cluster.mongodb.net/quickRide?retryWrites=true&w=majority');
console.log('');

console.log('🔍 To get your correct Atlas connection string:');
console.log('   1. Login to MongoDB Atlas');
console.log('   2. Go to your cluster');
console.log('   3. Click "Connect"');
console.log('   4. Choose "Connect your application"');
console.log('   5. Copy the connection string');
console.log('   6. Replace <password> with your actual password');
console.log('');

console.log('✅ After updating the connection string, restart your server.');

// Create a backup .env with working local connection
const fs = require('fs');
const path = require('path');

const backupEnvContent = `# Backup .env with local MongoDB
PORT=4000
RELOAD_INTERVAL=10
SERVER_URL=http://localhost:4000
CLIENT_URL=http://localhost:5173
ENVIRONMENT=development
MONGODB_PROD_URL=mongodb+srv://username:password@your-cluster.mongodb.net/quickRide?retryWrites=true&w=majority
MONGODB_DEV_URL=mongodb://127.0.0.1:27017/quickRide
JWT_SECRET=9f8e7a6b1b5e7d2c9e0f8a6b4d1a3e7c9f2b6d3a8e1f4c6b0d2e8c7a9b5f1d4
GOOGLE_MAPS_API=YOUR_REAL_API_KEY_HERE
MAIL_USER=diniduonline5@gmail.com
MAIL_PASS=yourapppassword
`;

fs.writeFileSync(path.join(__dirname, '..', '.env.backup'), backupEnvContent);
console.log('📝 Created .env.backup file with template for reference');

console.log('\n🚀 Ready to fix? Update your .env file and restart the server!');