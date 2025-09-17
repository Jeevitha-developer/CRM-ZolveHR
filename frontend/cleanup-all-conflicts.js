#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 REMOVING ALL TYPESCRIPT CONFLICTS...\n');

// Remove all TypeScript App files
const appFiles = [
  'App.tsx',
  'App.tsx.backup', 
  'CORRUPTED_App.tsx'
];

appFiles.forEach(file => {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    console.log(`✅ Removed: ${file}`);
  }
});

// Remove TypeScript config files
const configFiles = [
  'tsconfig.json',
  'tsconfig.node.json',
  'vite.config.ts'
];

configFiles.forEach(file => {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    console.log(`✅ Removed: ${file}`);
  }
});

// Remove entire src directory (contains old TypeScript files)
if (fs.existsSync('src')) {
  fs.rmSync('src', { recursive: true, force: true });
  console.log('✅ Removed: src/ directory');
}

// Remove all TypeScript component files
const componentFiles = [
  'components/LoginForm.tsx',
  'components/Dashboard.tsx', 
  'components/ClientManager.tsx',
  'components/SubscriptionManager.tsx',
  'components/PlanManager.tsx',
  'components/figma/ImageWithFallback.tsx'
];

componentFiles.forEach(file => {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    console.log(`✅ Removed: ${file}`);
  }
});

// Remove ALL TypeScript UI components
const uiDir = 'components/ui';
if (fs.existsSync(uiDir)) {
  const uiFiles = fs.readdirSync(uiDir);
  uiFiles.forEach(file => {
    if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const filePath = path.join(uiDir, file);
      fs.unlinkSync(filePath);
      console.log(`✅ Removed UI: ${filePath}`);
    }
  });
}

// Remove cleanup and temp files
const tempFiles = [
  'clean-app.js',
  'clean-typescript-conflicts.js', 
  'cleanup-corrupted-files.js',
  'delete-typescript-files.js',
  'temp-remove-ts.js',
  'remove-all-ts-files.sh'
];

tempFiles.forEach(file => {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    console.log(`✅ Removed temp: ${file}`);
  }
});

console.log('\n🎉 ALL CONFLICTS REMOVED!');
console.log('\nNext steps:');
console.log('1. Restart dev server: npm run dev');
console.log('2. Open in incognito browser');
console.log('3. App should load from App.js perfectly!');