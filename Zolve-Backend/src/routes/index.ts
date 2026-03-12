import { Router } from "express";
import authRoutes         from "./auth.routes";
import clientRoutes       from "./clients.routes";
import moduleRoutes       from "./modules.routes";
import masterAuthRoutes   from "./masterAuth.routes";

const router = Router();

router.use("/auth",         authRoutes);
router.use("/clients",       clientRoutes);
router.use("/modules",       moduleRoutes);
router.use("/master", masterAuthRoutes);

export default router;