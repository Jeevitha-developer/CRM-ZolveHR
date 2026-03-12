import { Router } from "express";
import {
  MasterRegister,
//   MasterWorkerRegister,
//   MasterRegisterForLink,
  MasterloginUser,
//   MasterusersId,
//   updateEmployeeNoIfMatched,
//   MasterforgotPassword,
//   MasterResetPassword,
//   getAllMasterRegister
} from "../controllers/masterAuth.controller";

const router = Router();

router.post("/register", MasterRegister);
// router.post("/worker-register", MasterWorkerRegister);
// router.post("/register-link", MasterRegisterForLink);

router.post("/login", MasterloginUser);

// router.get("/users", getAllMasterRegister);
// router.get("/users/:id", MasterusersId);

// router.patch("/update-employee-no", updateEmployeeNoIfMatched);

// router.post("/forgot-password", MasterforgotPassword);
// router.post("/reset-password/:token", MasterResetPassword);

export default router;