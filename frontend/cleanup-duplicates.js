// Cleanup script to remove duplicate .js files
const fs = require('fs');
const path = require('path');

// Files to remove
const filesToRemove = [
  // Component duplicates
  'components/ClientManager.js',
  'components/Dashboard.js', 
  'components/HRMSIntegration.js',
  'components/LoginForm.js',
  'components/PlanManager.js',
  'components/SubscriptionManager.js',
  
  // UI component duplicates
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
  
  // Other JS files causing conflicts
  'App.js',
  'main.js',
  'clean-app.js',
  'clean-start.js'
];

console.log('Removing duplicate JavaScript files...');

filesToRemove.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`✅ Removed: ${file}`);
    } else {
      console.log(`ℹ️  File not found: ${file}`);
    }
  } catch (error) {
    console.log(`❌ Error removing ${file}: ${error.message}`);
  }
});

console.log('Cleanup complete!');