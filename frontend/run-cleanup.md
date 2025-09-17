# Manual Cleanup Instructions

Since I can't run scripts directly, please run this cleanup command in your terminal:

```bash
node cleanup-final-fix.js
```

This will remove all the duplicate .js files that are conflicting with your .tsx files.

Alternatively, you can manually delete these files:

## Files to Delete:
- App.js
- main.js  
- components/ClientManager.js
- components/Dashboard.js
- components/HRMSIntegration.js
- components/LoginForm.js
- components/PlanManager.js
- components/SubscriptionManager.js
- components/figma/ImageWithFallback.js
- All .js files in components/ui/ folder (keep only .tsx versions)

After cleanup, your preview should work!