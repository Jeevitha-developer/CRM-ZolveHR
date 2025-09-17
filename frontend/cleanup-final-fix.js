#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files to remove - keeping only .tsx versions
const filesToRemove = [
  // Root level JS files
  'App.js',
  'App-minimal.js', 
  'main.js',
  'main-minimal.js',
  'clean-app.js',
  'clean-start.js',
  
  // Component JS files
  'components/ClientManager.js',
  'components/Dashboard.js',
  'components/HRMSIntegration.js',
  'components/LoginForm.js',
  'components/PlanManager.js',
  'components/SubscriptionManager.js',
  
  // Figma component JS files
  'components/figma/ImageWithFallback.js',
  
  // UI component JS files
  'components/ui/accordion.js',
  'components/ui/badge.js',
  'components/ui/button.js',
  'components/ui/card.js',
  'components/ui/checkbox.js',
  'components/ui/dialog.js',
  'components/ui/input.js',
  'components/ui/label.js',
  'components/ui/select.js',
  'components/ui/sonner.js',
  'components/ui/table.js',
  'components/ui/tabs.js',
  'components/ui/textarea.js',
  'components/ui/utils.js',
  'components/ui/utils.tsx',
  
  // Cleanup scripts and temp files
  'CLEAN_EVERYTHING.js',
  'EMERGENCY_CLEANUP.js',
  'FINAL_CLEANUP.js',
  'clean-typescript-conflicts.js',
  'cleanup-all-conflicts.js',
  'cleanup-all-typescript.js',
  'cleanup-corrupted-files.js',
  'cleanup-duplicates.js',
  'cleanup-final-typescript.js',
  'cleanup-final.js',
  'cleanup-remaining-tsx.js',
  'delete-typescript-files.js',
  'final-cleanup.js',
  'remove-conflicts.js',
  'temp-remove-ts.js',
  'ultimate-cleanup.js',
  
  // Backup and corrupted files
  'App.tsx.backup',
  'CORRUPTED_App.tsx',
  'components/ui/utils-backup.ts',
  
  // Duplicate configs
  'package-js.json',
  'simplified-package.json',
  'index-js.html',
];

console.log('🧹 Cleaning up duplicate and conflicting files...');

let removedCount = 0;
let notFoundCount = 0;

filesToRemove.forEach(file => {
  const filePath = path.join(__dirname, file);
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ Removed: ${file}`);
      removedCount++;
    } else {
      console.log(`⚠️  Not found: ${file}`);
      notFoundCount++;
    }
  } catch (error) {
    console.log(`❌ Error removing ${file}: ${error.message}`);
  }
});

console.log(`\n📊 Summary:`);
console.log(`   ✅ Removed: ${removedCount} files`);
console.log(`   ⚠️  Not found: ${notFoundCount} files`);
console.log(`\n🎉 Cleanup complete! The preview should work now.`);