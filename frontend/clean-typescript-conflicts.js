#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files to remove completely
const filesToRemove = [
  'App.tsx',
  'App.tsx.backup',
  'CORRUPTED_App.tsx',
  'components/LoginForm.tsx',
  'components/Dashboard.tsx',
  'components/ClientManager.tsx',
  'components/SubscriptionManager.tsx',
  'components/PlanManager.tsx',
  'components/figma/ImageWithFallback.tsx',
  'vite.config.ts',
  'tsconfig.json',
  'tsconfig.node.json'
];

// UI components to remove (keeping only .js versions)
const uiComponentsToRemove = [
  'components/ui/badge.tsx',
  'components/ui/button.tsx',
  'components/ui/card.tsx',
  'components/ui/checkbox.tsx',
  'components/ui/dialog.tsx',
  'components/ui/input.tsx',
  'components/ui/label.tsx',
  'components/ui/select.tsx',
  'components/ui/sonner.tsx',
  'components/ui/table.tsx',
  'components/ui/tabs.tsx',
  'components/ui/textarea.tsx',
  'components/ui/utils.ts',
  'components/ui/use-mobile.ts'
];

console.log('🧹 Cleaning up TypeScript conflicts...\n');

// Remove main conflicting files
filesToRemove.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`✅ Removed: ${filePath}`);
    } catch (error) {
      console.log(`❌ Failed to remove: ${filePath} - ${error.message}`);
    }
  } else {
    console.log(`ℹ️  Not found: ${filePath}`);
  }
});

// Remove UI TypeScript components
uiComponentsToRemove.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`✅ Removed UI component: ${filePath}`);
    } catch (error) {
      console.log(`❌ Failed to remove UI component: ${filePath} - ${error.message}`);
    }
  }
});

// Remove entire src directory if it exists
if (fs.existsSync('src')) {
  try {
    fs.rmSync('src', { recursive: true, force: true });
    console.log('✅ Removed: src/ directory');
  } catch (error) {
    console.log(`❌ Failed to remove src directory: ${error.message}`);
  }
}

console.log('\n🎉 Cleanup complete!');
console.log('\n📋 Next steps:');
console.log('1. Restart your development server: npm run dev');
console.log('2. Clear browser cache or open in incognito');
console.log('3. The app should now load properly from the .js files');