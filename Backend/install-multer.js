// Script to install multer for file uploads
const { execSync } = require('child_process');

console.log('📦 Installing multer for file uploads...');

try {
  execSync('npm install multer', { stdio: 'inherit', cwd: __dirname });
  console.log('✅ Multer installed successfully!');
  console.log('🔧 Profile picture upload functionality is now ready.');
} catch (error) {
  console.error('❌ Failed to install multer:', error.message);
  console.log('💡 Please run manually: npm install multer');
}