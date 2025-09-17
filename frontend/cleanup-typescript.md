# TypeScript Files Cleanup

This document lists all TypeScript files that need to be removed:

## Files to Remove:

### Root level:
- App.tsx ✅ (already marked as converted)
- tsconfig.json
- tsconfig.node.json  
- vite.config.ts
- package-js.json (can remove as it's been merged into package.json)
- index-js.html (can remove as it's been merged into index.html)

### Components:
- /components/ClientManager.tsx
- /components/Dashboard.tsx  
- /components/LoginForm.tsx
- /components/PlanManager.tsx
- /components/SubscriptionManager.tsx

### UI Components (keep .js versions, remove .tsx):
- All .tsx files in /components/ui/
- All .ts files in /components/ui/

### Src folder:
- Entire /src folder can be removed as we're using root-level files

The JavaScript versions are already created and working in the root level.