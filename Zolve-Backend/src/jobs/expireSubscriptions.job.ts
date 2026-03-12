// src/jobs/expireSubscriptions.job.ts
import cron              from "node-cron";
import { Subscription }  from "../models";
import { Op }            from "sequelize";

export const startExpireSubscriptionsJob = (): void => {
  cron.schedule("0 0 * * *", async () => {
    console.log("⏰ Running subscription expiry check...");
    const [count] = await Subscription.update(
      { subscription_status: "expired" },
      { where: { subscription_status: "active", end_date: { [Op.lt]: new Date() } } }
    );
    console.log(`✅ Marked ${count} subscription(s) as expired`);
  });
  console.log("📅 Expire subscriptions job scheduled (daily at midnight)");
};
