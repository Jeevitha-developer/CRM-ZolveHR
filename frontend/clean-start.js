// Clean start - remove all conflicting files
const fs = require('fs');

// Delete all TypeScript files and duplicates
const filesToDelete = [
  'App.tsx',
  'App.tsx.backup', 
  'CORRUPTED_App.tsx',
  'tsconfig.json',
  'tsconfig.node.json',
  'vite.config.ts',
  'components/ClientManager.tsx',
  'components/Dashboard.tsx',
  'components/LoginForm.tsx',
  'components/PlanManager.tsx',
  'components/SubscriptionManager.tsx',
  'components/figma/ImageWithFallback.tsx'
];

filesToDelete.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`✓ Deleted: ${file}`);
    }
  } catch (error) {
    console.error(`Error deleting ${file}:`, error.message);
  }
});

// Remove src folder
try {
  if (fs.existsSync('src')) {
    fs.rmSync('src', { recursive: true, force: true });
    console.log('✓ Deleted src folder');
  }
} catch (error) {
  console.error('Error deleting src folder:', error.message);
}

console.log('✅ Cleanup complete - app should run on JavaScript only');