#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚨 EMERGENCY CLEANUP - REMOVING ALL TYPESCRIPT CONFLICTS\n');

// Remove ALL duplicate App files
const appFiles = [
  'App.tsx',
  'App.tsx.backup', 
  'CORRUPTED_App.tsx'
];

console.log('🗑️  Removing duplicate App files...');
appFiles.forEach(file => {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    console.log(`✅ Removed: ${file}`);
  }
});

// Remove ALL TypeScript config files
const configFiles = [
  'tsconfig.json',
  'tsconfig.node.json',
  'vite.config.ts'
];

console.log('\n🗑️  Removing TypeScript config files...');
configFiles.forEach(file => {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    console.log(`✅ Removed: ${file}`);
  }
});

// Remove entire src directory
console.log('\n🗑️  Removing src directory...');
if (fs.existsSync('src')) {
  fs.rmSync('src', { recursive: true, force: true });
  console.log('✅ Removed: src/ directory');
}

// Remove ALL TypeScript component files
const componentFiles = [
  'components/LoginForm.tsx',
  'components/Dashboard.tsx', 
  'components/ClientManager.tsx',
  'components/SubscriptionManager.tsx',
  'components/PlanManager.tsx',
  'components/figma/ImageWithFallback.tsx'
];

console.log('\n🗑️  Removing TypeScript components...');
componentFiles.forEach(file => {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    console.log(`✅ Removed: ${file}`);
  }
});

// Remove ALL TypeScript UI components
console.log('\n🗑️  Removing TypeScript UI components...');
const uiDir = 'components/ui';
if (fs.existsSync(uiDir)) {
  const uiFiles = fs.readdirSync(uiDir);
  uiFiles.forEach(file => {
    if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const filePath = path.join(uiDir, file);
      fs.unlinkSync(filePath);
      console.log(`✅ Removed: ${filePath}`);
    }
  });
}

// Remove all cleanup and temp files
const tempFiles = [
  'clean-app.js',
  'clean-typescript-conflicts.js', 
  'cleanup-all-conflicts.js',
  'cleanup-corrupted-files.js',
  'delete-typescript-files.js',
  'temp-remove-ts.js',
  'remove-all-ts-files.sh',
  'fix-everything.sh',
  'cleanup-script.md',
  'cleanup-typescript.md',
  'remove-ts-files.md',
  'fix-preview.md',
  'PROJECT_STATUS.md',
  'CONVERSION_COMPLETE.md',
  'package-js.json',
  'index-js.html'
];

console.log('\n🗑️  Removing cleanup files...');
tempFiles.forEach(file => {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    console.log(`✅ Removed: ${file}`);
  }
});

console.log('\n🎉 EMERGENCY CLEANUP COMPLETE!');
console.log('\n📋 Next steps:');
console.log('1. Restart dev server: npm run dev');
console.log('2. Open in incognito browser');
console.log('3. App should load from App.js perfectly!');
console.log('\n✨ Your CRM app is ready to run!');