#!/bin/bash

echo "Starting final cleanup..."

# Remove all TypeScript files
find . -name "*.tsx" -not -path "./node_modules/*" -delete
find . -name "*.ts" -not -path "./node_modules/*" -delete

# Remove specific problematic files
rm -f tsconfig.json
rm -f tsconfig.node.json
rm -f vite.config.ts
rm -rf src

# Remove any backup and duplicate files
rm -f App.tsx.backup
rm -f CORRUPTED_App.tsx

echo "Cleanup completed!"
echo ""
echo "JavaScript files remaining:"
find . -name "*.js" -not -path "./node_modules/*" | head -20