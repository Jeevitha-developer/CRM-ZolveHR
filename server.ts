import { env }        from "./src/config/env";
import express, { Request, Response, NextFunction } from "express";
import cors            from "cors";
import swaggerUi       from "swagger-ui-express";
import { Op }          from "sequelize";

import { sequelize, Client, Subscription, Plan } from "./src/models";
import { swaggerSpec } from "./src/config/swagger";
import { protect }     from "./src/middleware/auth.middleware";
import { success, error as errRes } from "./src/utils/response";
import { startExpireSubscriptionsJob } from "./src/jobs/expireSubscriptions.job";
import { startSyncHrmsAccessJob }      from "./src/jobs/syncHrmsAccess.job";
import { AuthRequest } from "./src/types";
import routes          from "./src/routes";

const app = express();

// ─── Core Middleware ──────────────────────────────────────────
app.use(cors({ origin: env.frontend_url, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Swagger Docs ─────────────────────────────────────────────
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─── API Routes ───────────────────────────────────────────────
app.use("/api", routes);

// ─── Dashboard Stats ──────────────────────────────────────────
app.get("/api/dashboard/stats", protect as any, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const today = new Date();
    const in7   = new Date(today.getTime() + 7  * 86_400_000);
    const in30  = new Date(today.getTime() + 30 * 86_400_000);

    const [
      totalC, activeC, inactiveC, suspendedC,
      totalS, activeS, expiredS, cancelledS, trialS,
      paidS, pendingS, failedS,
      exp7, exp30, rev, plans,
    ] = await Promise.all([
      // Clients
      Client.count(),
      Client.count({ where: { status: "active" } }),
      Client.count({ where: { status: "inactive" } }),
      Client.count({ where: { status: "suspended" } }),
      // Subscriptions
      Subscription.count(),
      Subscription.count({ where: { subscription_status: "active" } }),
      Subscription.count({ where: { subscription_status: "expired" } }),
      Subscription.count({ where: { subscription_status: "cancelled" } }),
      Subscription.count({ where: { subscription_status: "trial" } }),
      // Payments
      Subscription.count({ where: { payment_status: "paid" } }),
      Subscription.count({ where: { payment_status: "pending" } }),
      Subscription.count({ where: { payment_status: "failed" } }),
      // Expiring
      Subscription.count({ where: { subscription_status: "active", end_date: { [Op.between]: [today, in7] } } }),
      Subscription.count({ where: { subscription_status: "active", end_date: { [Op.between]: [today, in30] } } }),
      // Revenue
      Subscription.findOne({
        attributes: [
          [sequelize.fn("COALESCE", sequelize.fn("SUM", sequelize.col("final_amount")), 0), "total"],
          [sequelize.literal("COALESCE(SUM(CASE WHEN payment_status='paid'    THEN final_amount ELSE 0 END),0)"), "collected"],
          [sequelize.literal("COALESCE(SUM(CASE WHEN payment_status='pending' THEN final_amount ELSE 0 END),0)"), "pending"],
          [sequelize.literal("COALESCE(SUM(CASE WHEN payment_status='failed'  THEN final_amount ELSE 0 END),0)"), "overdue"],
        ],
        raw: true,
      }),
      // Plans
      Plan.findAll({
        where:      { is_active: true },
        attributes: ["id", "name", "billing_cycle", "price_inr",
          [sequelize.literal("(SELECT COUNT(*) FROM subscriptions WHERE subscriptions.plan_id=Plan.id AND subscription_status='active')"), "active_count"],
          [sequelize.literal("(SELECT COUNT(*) FROM subscriptions WHERE subscriptions.plan_id=Plan.id)"),                                  "total_count"],
        ],
        raw: true,
      }),
    ]);

    const r = rev as any;

    success(res, {
      stats: {
        clients: {
          total: totalC, active: activeC, inactive: inactiveC, suspended: suspendedC,
        },
        subscriptions: {
          total: totalS, active: activeS, expired: expiredS, cancelled: cancelledS, trial: trialS,
        },
        payments: {
          paid: paidS, pending: pendingS, overdue: failedS,
        },
        expiring: {
          in7days: exp7, in30days: exp30,
        },
        revenue: {
          total:     parseFloat(r?.total     || 0),
          collected: parseFloat(r?.collected || 0),
          pending:   parseFloat(r?.pending   || 0),
          overdue:   parseFloat(r?.overdue   || 0),
        },
        plans: (plans as any[]).map(p => ({
          ...p,
          active_count: parseInt(p.active_count || 0),
          total_count:  parseInt(p.total_count  || 0),
        })),
      },
    }, "Dashboard stats fetched");

  } catch (err: any) {
    errRes(res, err.message);
  }
});

// ─── Health Check ─────────────────────────────────────────────
app.get("/api/health", (_req: Request, res: Response) =>
  res.json({
    status:    "ok",
    env:       env.nodeEnv,
    timestamp: new Date().toISOString(),
  })
);

// ─── 404 Handler ──────────────────────────────────────────────
app.use((req: Request, res: Response) =>
  res.status(404).json({ message: `Route ${req.originalUrl} not found` })
);

// ─── Global Error Handler ─────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) =>
  res.status(500).json({ message: err.message })
);

// ─── Bootstrap ────────────────────────────────────────────────
const start = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    await sequelize.sync();
    console.log("✅ Database synced");

    startExpireSubscriptionsJob();
    startSyncHrmsAccessJob();

    app.listen(env.port, () => {
      console.log(`\n🚀 CRM Backend running on port  : ${env.port}`);
      console.log(`📊 Environment                   : ${env.nodeEnv}`);
      console.log(`🔗 Frontend URL                  : ${env.frontend_url}`);
      console.log(`💾 Database                      : ${env.db.name}`);
      console.log(`📖 Swagger Docs                  : http://localhost:${env.port}/api/docs\n`);
    });

  } catch (err: any) {
    console.error("❌ Startup failed:", err.message);
    process.exit(1);
  }
};

start();