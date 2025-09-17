const fs = require('fs');

// List of TypeScript files to remove
const filesToDelete = [
  'App.tsx',
  'App.tsx.backup', 
  'CORRUPTED_App.tsx',
  'components/ClientManager.tsx',
  'components/Dashboard.tsx',
  'components/LoginForm.tsx',
  'components/PlanManager.tsx',
  'components/SubscriptionManager.tsx',
  'components/figma/ImageWithFallback.tsx',
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
  'tsconfig.json',
  'tsconfig.node.json',
  'vite.config.ts'
];

console.log('Removing conflicting TypeScript files...');

filesToDelete.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`Deleting: ${file}`);
    fs.unlinkSync(file);
  }
});

// Remove the src directory entirely as it contains TypeScript files
if (fs.existsSync('src')) {
  console.log('Removing src directory...');
  fs.rmSync('src', { recursive: true, force: true });
}

console.log('Cleanup completed!');