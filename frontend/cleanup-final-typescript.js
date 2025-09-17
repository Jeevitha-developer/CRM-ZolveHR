#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to recursively find and delete TypeScript files
function deleteTypeScriptFiles(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and other system directories
      if (!['node_modules', '.git', '.vscode'].includes(file)) {
        deleteTypeScriptFiles(filePath);
      }
    } else {
      // Delete TypeScript files
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        console.log(`Deleting: ${filePath}`);
        fs.unlinkSync(filePath);
      }
    }
  });
}

// Also clean up specific config files
const filesToDelete = [
  'tsconfig.json',
  'tsconfig.node.json',
  'vite.config.ts'
];

console.log('Starting comprehensive TypeScript cleanup...');

// Delete TypeScript files recursively
deleteTypeScriptFiles('./');

// Delete config files
filesToDelete.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`Deleting config file: ${file}`);
    fs.unlinkSync(file);
  }
});

console.log('TypeScript cleanup completed!');