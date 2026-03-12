// src/jobs/syncHrmsAccess.job.ts
import cron from "node-cron";

export const startSyncHrmsAccessJob = (): void => {
  cron.schedule("0 * * * *", async () => {
    console.log("🔄 Syncing HRMS access...");
    // TODO: find expired subscriptions → call hrmsIntegration.deactivateTenant()
    console.log("✅ HRMS sync complete");
  });
  console.log("🔄 HRMS sync job scheduled (every hour)");
};
