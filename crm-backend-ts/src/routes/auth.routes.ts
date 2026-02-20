import { Router } from "express";
import * as auth  from "../controllers/auth.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication & user session management
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new admin/manager user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [first_name, last_name, email, password]
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: Arjun
 *               last_name:
 *                 type: string
 *                 example: Kumar
 *               email:
 *                 type: string
 *                 example: arjun@crm.com
 *               mobile:
 *                 type: string
 *                 example: "9876543210"
 *               password:
 *                 type: string
 *                 example: Admin@123
 *               role:
 *                 type: string
 *                 enum: [admin, manager, user]
 *                 example: admin
 *     responses:
 *       201:
 *         description: User registered successfully. OTP sent to email.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: OTP sent to your email
 *       400:
 *         description: Email already exists or validation failed
 */
router.post("/register", auth.register);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP sent to email after registration
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email:
 *                 type: string
 *                 example: arjun@crm.com
 *               otp:
 *                 type: string
 *                 example: "485921"
 *     responses:
 *       200:
 *         description: OTP verified. Account activated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Account verified successfully
 *       400:
 *         description: Invalid or expired OTP
 */
router.post("/verify-otp", auth.verifyOTP);

/**
 * @swagger
 * /api/auth/resend-otp:
 *   post:
 *     summary: Resend OTP to registered email
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 example: arjun@crm.com
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: OTP resent to your email
 *       404:
 *         description: Email not found
 */
router.post("/resend-otp", auth.resendOtp);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: arjun@crm.com
 *               password:
 *                 type: string
 *                 example: Admin@123
 *     responses:
 *       200:
 *         description: Login successful. Returns JWT token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         first_name:
 *                           type: string
 *                           example: Arjun
 *                         last_name:
 *                           type: string
 *                           example: Kumar
 *                         email:
 *                           type: string
 *                           example: arjun@crm.com
 *                         role:
 *                           type: string
 *                           example: admin
 *       401:
 *         description: Invalid email or password
 *       403:
 *         description: Account not verified or inactive
 */
router.post("/login", auth.login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout current user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Logged out successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/logout", auth.logout);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get currently logged in user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     first_name:
 *                       type: string
 *                       example: Arjun
 *                     last_name:
 *                       type: string
 *                       example: Kumar
 *                     email:
 *                       type: string
 *                       example: arjun@crm.com
 *                     mobile:
 *                       type: string
 *                       example: "9876543210"
 *                     role:
 *                       type: string
 *                       example: admin
 *                     is_active:
 *                       type: boolean
 *                       example: true
 *                     last_login:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized - token missing or invalid
 */
router.get("/me", protect as any, auth.getMe as any);

export default router;