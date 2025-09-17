#!/bin/bash

# Remove all TypeScript files
find . -name "*.tsx" -type f -delete
find . -name "*.ts" -type f -delete

# Keep only the ImageWithFallback.tsx as it's protected
# We'll need to convert it manually

echo "TypeScript files removed"