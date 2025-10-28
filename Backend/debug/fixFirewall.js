/**
 * Windows Firewall Fix for MongoDB Atlas
 */

const { exec } = require('child_process');

console.log('🔧 MongoDB Atlas Firewall Fix\n');

console.log('🔥 Windows Firewall Rules for MongoDB Atlas:');
console.log('Run these commands as Administrator in Command Prompt:\n');

const commands = [
  'netsh advfirewall firewall add rule name="MongoDB Atlas Outbound" dir=out action=allow protocol=TCP remoteport=27017',
  'netsh advfirewall firewall add rule name="MongoDB Atlas SSL" dir=out action=allow protocol=TCP remoteport=27018',
  'netsh advfirewall firewall add rule name="MongoDB Atlas Backup" dir=out action=allow protocol=TCP remoteport=27019',
  'netsh advfirewall firewall add rule name="MongoDB Atlas SRV" dir=out action=allow protocol=UDP remoteport=53'
];

commands.forEach((cmd, index) => {
  console.log(`${index + 1}. ${cmd}\n`);
});

console.log('🚀 Alternative: Temporarily disable Windows Firewall for testing:');
console.log('1. netsh advfirewall set allprofiles state off');
console.log('2. Test MongoDB connection');
console.log('3. netsh advfirewall set allprofiles state on (re-enable after testing)\n');

console.log('💡 Or use Windows Defender Firewall GUI:');
console.log('1. Open Windows Defender Firewall');
console.log('2. Click "Allow an app or feature through Windows Defender Firewall"');
console.log('3. Add Node.js to allowed apps');
console.log('4. Check both Private and Public networks\n');

console.log('🔍 Test after applying fixes:');
console.log('node debug/testAtlas.js');

// Try to automatically add firewall rules (requires admin)
console.log('🤖 Attempting to add firewall rules automatically...\n');

commands.forEach((cmd, index) => {
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.log(`❌ Rule ${index + 1}: Failed (Run as Administrator required)`);
    } else {
      console.log(`✅ Rule ${index + 1}: Added successfully`);
    }
  });
});

setTimeout(() => {
  console.log('\n✅ Firewall configuration complete!');
  console.log('🧪 Test your connection now: node debug/testAtlas.js');
}, 2000);