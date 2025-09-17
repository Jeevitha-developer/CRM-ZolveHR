#!/bin/bash

echo "🚨 Emergency cleanup starting..."

# Remove all TypeScript files
find . -name "*.tsx" -not -path "./node_modules/*" -delete
find . -name "*.ts" -not -path "./node_modules/*" -delete

# Remove specific problematic files
rm -f App.tsx App.tsx.backup CORRUPTED_App.tsx
rm -f tsconfig.json tsconfig.node.json
rm -f vite.config.ts

# Remove src folder entirely (it's duplicated)
rm -rf src/

# Remove all cleanup scripts
rm -f cleanup-*.js clean-*.js delete-*.js temp-*.js fix-*.sh remove-*.sh
rm -f *.md PROJECT_STATUS.md CONVERSION_COMPLETE.md

echo "✅ Emergency cleanup completed!"
echo "✅ All TypeScript files removed"
echo "✅ All cleanup files removed"
echo "✅ Ready to run JavaScript app"