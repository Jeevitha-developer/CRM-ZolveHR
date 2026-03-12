import { env }        from "./src/config/env";
import express, { Request, Response, NextFunction } from "express";
import cors            from "cors";
import swaggerUi       from "swagger-ui-express";
import { Op }          from "sequelize";

import { sequelize, Client} from "./src/models";
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
app.use("/:tenant/api", routes);


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

    startExpireSubscriptionsJob();
    startSyncHrmsAccessJob();

    app.listen(env.port, () => {
      console.log(`🚀 Server running on port : ${env.port}`);
      console.log(`📊 Environment            : ${env.nodeEnv}`);
      console.log(`🔗 Frontend URL           : ${env.frontend_url}`);
      console.log(`📖 Swagger Docs           : http://localhost:${env.port}/api/docs`);
    });

  } catch (err: any) {
    console.error("❌ Startup failed:", err.message);
    process.exit(1);
  }
};
start();