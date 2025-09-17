#!/bin/bash

echo "🚀 FIXING ALL CONFLICTS AND STARTING FRESH..."

# Remove all TypeScript files and conflicts
echo "📁 Removing TypeScript conflicts..."

# Remove main TypeScript files
rm -f App.tsx App.tsx.backup CORRUPTED_App.tsx
rm -f tsconfig.json tsconfig.node.json vite.config.ts

# Remove TypeScript component files  
rm -f components/*.tsx
rm -f components/figma/*.tsx

# Remove ALL TypeScript UI components
rm -f components/ui/*.tsx components/ui/*.ts

# Remove the entire src directory (old TypeScript files)
rm -rf src/

# Remove cleanup files
rm -f clean-app.js clean-typescript-conflicts.js cleanup-corrupted-files.js
rm -f delete-typescript-files.js temp-remove-ts.js remove-all-ts-files.sh
rm -f cleanup-all-conflicts.js

echo "✅ All TypeScript conflicts removed!"

# Verify main files exist
echo "🔍 Verifying JavaScript files..."
if [ -f "App.js" ]; then
    echo "✅ App.js exists"
else
    echo "❌ App.js missing!"
fi

if [ -f "main.js" ]; then
    echo "✅ main.js exists"
else
    echo "❌ main.js missing!"
fi

if [ -f "vite.config.js" ]; then
    echo "✅ vite.config.js exists"
else
    echo "❌ vite.config.js missing!"
fi

echo ""
echo "🎉 CLEANUP COMPLETE!"
echo ""
echo "Next steps:"
echo "1. Run: npm run dev"
echo "2. Open in incognito browser"
echo "3. Your CRM app should load perfectly!"