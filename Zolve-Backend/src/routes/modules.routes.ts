import { Router }    from "express";
import * as c        from "../controllers/modules.controller";
import { protect }   from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();
const p     = protect as any;
const admin = authorize("admin") as any;


router.get("/", p, c.getModules as any);
router.get("/:id", p, c.getModuleById as any);
router.post("/", p, admin, c.createModule as any);
router.put("/:id", p, admin, c.updateModule as any);
router.delete("/:id", p, admin, c.deleteModule as any);

export default router;