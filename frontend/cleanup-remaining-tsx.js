#!/usr/bin/env node

// Script to remove remaining .tsx/.ts files that are duplicates of .js files
const fs = require('fs');
const path = require('path');

const filesToRemove = [
  // Root level duplicates
  'App.tsx',
  'App.tsx.backup',
  'CORRUPTED_App.tsx',
  
  // Component duplicates (keep .js versions)
  'components/ClientManager.tsx',
  'components/Dashboard.tsx', 
  'components/LoginForm.tsx',
  'components/PlanManager.tsx',
  'components/SubscriptionManager.tsx',
  'components/figma/ImageWithFallback.tsx',
  
  // UI component duplicates (keep .js versions)
  'components/ui/accordion.tsx',
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
  'components/ui/use-mobile.ts',
  
  // Src directory (entire folder can be removed)
  'src/App.tsx',
  'src/main.tsx',
  'src/components/ClientManager.tsx',
  'src/components/Dashboard.tsx',
  'src/components/LoginForm.tsx', 
  'src/components/PlanManager.tsx',
  'src/components/SubscriptionManager.tsx',
  'src/components/ui/button.tsx',
  'src/components/ui/card.tsx',
  'src/components/ui/input.tsx',
  'src/components/ui/utils.ts',
  
  // Config files
  'tsconfig.json',
  'tsconfig.node.json',
  'vite.config.ts'
];

console.log('🧹 Cleaning up remaining TypeScript files...\n');

let removedCount = 0;
let notFoundCount = 0;

filesToRemove.forEach(file => {
  const filePath = path.resolve(file);
  
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ Removed: ${file}`);
      removedCount++;
    } else {
      console.log(`ℹ️  Not found: ${file}`);
      notFoundCount++;
    }
  } catch (error) {
    console.log(`❌ Error removing ${file}: ${error.message}`);
  }
});

// Remove empty src directory if it exists
try {
  const srcDir = path.resolve('src');
  if (fs.existsSync(srcDir)) {
    // Remove any remaining files in src/styles if they exist
    const srcStylesDir = path.join(srcDir, 'styles');
    if (fs.existsSync(srcStylesDir)) {
      fs.rmSync(srcStylesDir, { recursive: true, force: true });
    }
    
    // Remove components directory
    const srcComponentsDir = path.join(srcDir, 'components');
    if (fs.existsSync(srcComponentsDir)) {
      fs.rmSync(srcComponentsDir, { recursive: true, force: true });
    }
    
    // Remove src directory if empty
    const srcContents = fs.readdirSync(srcDir);
    if (srcContents.length <= 1) { // Only REMOVED.md might remain
      fs.rmSync(srcDir, { recursive: true, force: true });
      console.log('✅ Removed empty src directory');
    }
  }
} catch (error) {
  console.log(`❌ Error cleaning src directory: ${error.message}`);
}

console.log(`\n📊 Summary:`);
console.log(`   • Files removed: ${removedCount}`);
console.log(`   • Files not found: ${notFoundCount}`);
console.log(`\n🎉 TypeScript cleanup complete!`);
console.log(`\n💡 Your JavaScript-based CRM system should now be completely clean of TypeScript conflicts.`);