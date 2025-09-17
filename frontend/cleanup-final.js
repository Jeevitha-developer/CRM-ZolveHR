#!/usr/bin/env node

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Files and directories to remove
const toRemove = [
  // Duplicate TypeScript files
  'App.tsx',
  'App.tsx.backup', 
  'CORRUPTED_App.tsx',
  'components/ClientManager.tsx',
  'components/Dashboard.tsx',
  'components/LoginForm.tsx',
  'components/PlanManager.tsx',
  'components/SubscriptionManager.tsx',
  'components/figma/ImageWithFallback.tsx',
  
  // Duplicate UI components (keep only .js versions)
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
  
  // TypeScript config files
  'tsconfig.json',
  'tsconfig.node.json',
  'vite.config.ts',
  
  // Cleanup scripts and temp files
  'App-minimal.js',
  'clean-app.js',
  'clean-start.js',
  'cleanup-*.js',
  'cleanup-*.md',
  'delete-typescript-files.js',
  'emergency-cleanup.sh',
  'final-cleanup.js',
  'fix-*.sh',
  'fix-*.md',
  'main-minimal.js',
  'temp-remove-ts.js',
  'remove-*.sh',
  'remove-*.md',
  'EMERGENCY_CLEANUP.js',
  'FINAL_FIX.sh',
  'package-js.json',
  'simplified-package.json',
  'index-js.html',
  
  // Remove entire src directory as it's duplicate
  'src',
  
  // Remove extra UI components we don't need
  'components/ui/alert-dialog.tsx',
  'components/ui/alert.tsx',
  'components/ui/aspect-ratio.tsx',
  'components/ui/avatar.tsx',
  'components/ui/breadcrumb.tsx',
  'components/ui/calendar.tsx',
  'components/ui/carousel.tsx',
  'components/ui/chart.tsx',
  'components/ui/collapsible.tsx',
  'components/ui/command.tsx',
  'components/ui/context-menu.tsx',
  'components/ui/drawer.tsx',
  'components/ui/dropdown-menu.tsx',
  'components/ui/form.tsx',
  'components/ui/hover-card.tsx',
  'components/ui/input-otp.tsx',
  'components/ui/menubar.tsx',
  'components/ui/navigation-menu.tsx',
  'components/ui/pagination.tsx',
  'components/ui/popover.tsx',
  'components/ui/progress.tsx',
  'components/ui/radio-group.tsx',
  'components/ui/resizable.tsx',
  'components/ui/scroll-area.tsx',
  'components/ui/separator.tsx',
  'components/ui/sheet.tsx',
  'components/ui/sidebar.tsx',
  'components/ui/skeleton.tsx',
  'components/ui/slider.tsx',
  'components/ui/switch.tsx',
  'components/ui/toggle-group.tsx',
  'components/ui/toggle.tsx',
  'components/ui/tooltip.tsx',
  'components/ui/use-mobile.ts'
];

async function removeFile(filePath) {
  try {
    const fullPath = join(__dirname, filePath);
    await fs.access(fullPath);
    const stat = await fs.stat(fullPath);
    
    if (stat.isDirectory()) {
      await fs.rmdir(fullPath, { recursive: true });
      console.log(`Removed directory: ${filePath}`);
    } else {
      await fs.unlink(fullPath);
      console.log(`Removed file: ${filePath}`);
    }
  } catch (error) {
    // File doesn't exist, skip
  }
}

async function cleanup() {
  console.log('Starting cleanup...');
  
  for (const item of toRemove) {
    await removeFile(item);
  }
  
  console.log('Cleanup complete!');
}

cleanup().catch(console.error);