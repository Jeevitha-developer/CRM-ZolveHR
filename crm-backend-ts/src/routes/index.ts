import { Router } from "express";
import authRoutes         from "./auth.routes";
import clientRoutes       from "./clients.routes";
import planRoutes         from "./plans.routes";
import subscriptionRoutes from "./subscriptions.routes";
import moduleRoutes       from "./modules.routes";
import paymentRoutes      from "./payments.routes";

const router = Router();

router.use("/auth",          authRoutes);
router.use("/clients",       clientRoutes);
router.use("/plans",         planRoutes);
router.use("/subscriptions", subscriptionRoutes);
router.use("/modules",       moduleRoutes);
router.use("/payments",      paymentRoutes);

export default router;