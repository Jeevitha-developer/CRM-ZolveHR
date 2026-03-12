import { Router } from "express";
import * as auth  from "../controllers/auth.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();


router.post("/master-register", auth.masterRegister);
router.post("/master-worker-register", auth.masterWorkerRegister);
router.post("/master-register-link", auth.masterRegisterForLink);
router.get("/master-register", auth.getAllMasterRegister);
router.patch("/master-register/:id/role", auth.masterUpdateUser);
router.patch("/master-register/update-employee-no", auth.updateEmployeeNoIfMatched);
router.post("/master-login", auth.masterLoginUser);
router.post("/master-login-register-link", auth.masterLoginRegisterLinkUser);
router.get("/master-user/:id", auth.masterUsersId);
router.post("/master-forgot-password", auth.masterForgotPassword);
router.post("/master-reset-password/:token", auth.masterResetPassword);
router.get("/master-employees", auth.masterGetAllEmployeeData);
router.get("/master-employee/email/:email", auth.getEmployeeByEmail);

router.post("/verify-otp", auth.verifyOTP);


router.post("/resend-otp", auth.resendOtp);

router.post("/login", auth.login);


router.post("/logout", auth.logout);


router.get("/me", protect as any, auth.getMe as any);

export default router;