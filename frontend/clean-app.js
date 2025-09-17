// Script to clean up conflicting App.tsx
const fs = require('fs');
const path = require('path');

// Remove the problematic App.tsx file
const appTsxPath = path.join(__dirname, 'App.tsx');
if (fs.existsSync(appTsxPath)) {
  fs.unlinkSync(appTsxPath);
  console.log('Removed App.tsx');
} else {
  console.log('App.tsx not found');
}

console.log('Cleanup complete!');