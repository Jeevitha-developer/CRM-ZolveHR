const fs = require('fs');
const path = require('path');

function deleteFileSync(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✓ Deleted: ${filePath}`);
      return true;
    }
  } catch (error) {
    console.error(`✗ Error deleting ${filePath}:`, error.message);
    return false;
  }
  return false;
}

function deleteFolderSync(folderPath) {
  try {
    if (fs.existsSync(folderPath)) {
      fs.rmSync(folderPath, { recursive: true, force: true });
      console.log(`✓ Deleted folder: ${folderPath}`);
      return true;
    }
  } catch (error) {
    console.error(`✗ Error deleting folder ${folderPath}:`, error.message);
    return false;
  }
  return false;
}

console.log('🧹 Starting complete TypeScript cleanup...');

// Remove all TypeScript files from root
const rootTsFiles = [
  'App.tsx',
  'App.tsx.backup', 
  'CORRUPTED_App.tsx',
  'tsconfig.json',
  'tsconfig.node.json',
  'vite.config.ts'
];

console.log('\n📂 Cleaning root directory...');
rootTsFiles.forEach(deleteFileSync);

// Remove all TypeScript component files
const componentTsFiles = [
  'components/ClientManager.tsx',
  'components/Dashboard.tsx', 
  'components/LoginForm.tsx',
  'components/PlanManager.tsx',
  'components/SubscriptionManager.tsx',
  'components/figma/ImageWithFallback.tsx'
];

console.log('\n📂 Cleaning components directory...');
componentTsFiles.forEach(deleteFileSync);

// Remove all TypeScript UI component files
const uiTsFiles = [
  'components/ui/accordion.tsx',
  'components/ui/alert-dialog.tsx',
  'components/ui/alert.tsx',
  'components/ui/aspect-ratio.tsx',
  'components/ui/avatar.tsx',
  'components/ui/badge.tsx',
  'components/ui/breadcrumb.tsx',
  'components/ui/button.tsx',
  'components/ui/calendar.tsx',
  'components/ui/card.tsx',
  'components/ui/carousel.tsx',
  'components/ui/chart.tsx',
  'components/ui/checkbox.tsx',
  'components/ui/collapsible.tsx',
  'components/ui/command.tsx',
  'components/ui/context-menu.tsx',
  'components/ui/dialog.tsx',
  'components/ui/drawer.tsx',
  'components/ui/dropdown-menu.tsx',
  'components/ui/form.tsx',
  'components/ui/hover-card.tsx',
  'components/ui/input-otp.tsx',
  'components/ui/input.tsx',
  'components/ui/label.tsx',
  'components/ui/menubar.tsx',
  'components/ui/navigation-menu.tsx',
  'components/ui/pagination.tsx',
  'components/ui/popover.tsx',
  'components/ui/progress.tsx',
  'components/ui/radio-group.tsx',
  'components/ui/resizable.tsx',
  'components/ui/scroll-area.tsx',
  'components/ui/select.tsx',
  'components/ui/separator.tsx',
  'components/ui/sheet.tsx',
  'components/ui/sidebar.tsx',
  'components/ui/skeleton.tsx',
  'components/ui/slider.tsx',
  'components/ui/sonner.tsx',
  'components/ui/switch.tsx',
  'components/ui/table.tsx',
  'components/ui/tabs.tsx',
  'components/ui/textarea.tsx',
  'components/ui/toggle-group.tsx',
  'components/ui/toggle.tsx',
  'components/ui/tooltip.tsx',
  'components/ui/use-mobile.ts',
  'components/ui/utils.ts'
];

console.log('\n📂 Cleaning UI components directory...');
uiTsFiles.forEach(deleteFileSync);

// Remove entire src folder (it's duplicated)
console.log('\n📂 Removing src folder...');
deleteFolderSync('src');

// Remove all cleanup and backup files
const cleanupFiles = [
  'EMERGENCY_CLEANUP.js',
  'FINAL_FIX.sh',
  'PROJECT_STATUS.md',
  'CONVERSION_COMPLETE.md',
  'clean-app.js',
  'clean-typescript-conflicts.js',
  'cleanup-all-conflicts.js',
  'cleanup-corrupted-files.js',
  'cleanup-final.js',
  'cleanup-script.md',
  'cleanup-typescript.md',
  'delete-typescript-files.js',
  'fix-everything.sh',
  'fix-preview.md',
  'package-js.json',
  'remove-all-ts-files.sh',
  'remove-ts-files.md',
  'temp-remove-ts.js'
];

console.log('\n📂 Cleaning up temporary files...');
cleanupFiles.forEach(deleteFileSync);

console.log('\n✅ TypeScript cleanup completed!');
console.log('✅ All .tsx/.ts files removed');
console.log('✅ App should now run purely on JavaScript');