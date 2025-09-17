const fs = require('fs');
const path = require('path');

console.log('🧹 Starting ultimate TypeScript cleanup...');

// List of specific files to remove
const filesToRemove = [
  'App.tsx',
  'App.tsx.backup', 
  'CORRUPTED_App.tsx',
  'tsconfig.json',
  'tsconfig.node.json', 
  'vite.config.ts'
];

// Remove specific files
filesToRemove.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`❌ Removing: ${file}`);
    fs.unlinkSync(file);
  }
});

// Remove src directory
if (fs.existsSync('src')) {
  console.log('❌ Removing src directory...');
  fs.rmSync('src', { recursive: true, force: true });
}

// Function to recursively remove .tsx and .ts files
function removeTypeScriptFiles(dir) {
  if (!fs.existsSync(dir)) return;
  
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and system directories
      if (!['node_modules', '.git', '.vscode', 'dist', 'build'].includes(item)) {
        removeTypeScriptFiles(itemPath);
      }
    } else {
      // Remove TypeScript files
      if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        console.log(`❌ Removing: ${itemPath}`);
        fs.unlinkSync(itemPath);
      }
    }
  });
}

// Clean components directory
console.log('🗂️ Cleaning components directory...');
removeTypeScriptFiles('./components');

// Clean any remaining TypeScript files in root
removeTypeScriptFiles('./');

console.log('✅ TypeScript cleanup completed!');
console.log('');
console.log('📁 Remaining JavaScript files:');

// List remaining JS files
function listJSFiles(dir, prefix = '') {
  if (!fs.existsSync(dir)) return;
  
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', '.vscode', 'dist', 'build', 'backend'].includes(item)) {
        console.log(`${prefix}📁 ${item}/`);
        listJSFiles(itemPath, prefix + '  ');
      }
    } else if (item.endsWith('.js')) {
      console.log(`${prefix}📄 ${item}`);
    }
  });
}

listJSFiles('./');