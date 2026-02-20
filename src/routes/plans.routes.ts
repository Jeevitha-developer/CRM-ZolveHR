import { Router }    from "express";
import * as c        from "../controllers/plans.controller";
import { protect }   from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();
const p            = protect as any;
const admin        = authorize("admin") as any;
const adminManager = authorize("admin","manager") as any;

/**
 * @swagger
 * tags:
 *   name: Plans
 *   description: Subscription plan management
 */

/**
 * @swagger
 * /api/plans:
 *   get:
 *     summary: Get all plans
 *     tags: [Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *           example: true
 *         description: Filter by active/inactive plans
 *       - in: query
 *         name: billing_cycle
 *         schema:
 *           type: string
 *           enum: [monthly, quarterly, half_yearly, yearly]
 *         description: Filter by billing cycle
 *     responses:
 *       200:
 *         description: List of all plans
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: Starter Plan
 *                       price_inr:
 *                         type: number
 *                         example: 4999.00
 *                       billing_cycle:
 *                         type: string
 *                         example: quarterly
 *                       billing_type:
 *                         type: string
 *                         example: prepaid
 *                       max_users:
 *                         type: integer
 *                         example: 50
 *                       is_active:
 *                         type: boolean
 *                         example: true
 *       401:
 *         description: Unauthorized
 */
router.get("/", p, c.getPlans as any);

/**
 * @swagger
 * /api/plans/{id}:
 *   get:
 *     summary: Get a single plan by ID
 *     tags: [Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Plan ID
 *     responses:
 *       200:
 *         description: Plan details
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
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     price_inr:
 *                       type: number
 *                     billing_cycle:
 *                       type: string
 *                       enum: [monthly, quarterly, half_yearly, yearly]
 *                     billing_months:
 *                       type: integer
 *                     billing_type:
 *                       type: string
 *                       enum: [prepaid, postpaid]
 *                     max_users:
 *                       type: integer
 *                     base_user_limit:
 *                       type: integer
 *                     extra_user_limit:
 *                       type: integer
 *                     price_per_user:
 *                       type: number
 *                     overage_policy:
 *                       type: string
 *                       enum: [hard_stop, charge_overage, notify_only]
 *                     features:
 *                       type: array
 *                       items:
 *                         type: string
 *                     module_access:
 *                       type: object
 *                     is_active:
 *                       type: boolean
 *       404:
 *         description: Plan not found
 *       401:
 *         description: Unauthorized
 */
router.get("/:id", p, c.getPlanById as any);

/**
 * @swagger
 * /api/plans:
 *   post:
 *     summary: Create a new plan (Admin & Manager only)
 *     tags: [Plans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price_inr, max_users]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Starter Plan
 *               description:
 *                 type: string
 *                 example: Best for small companies up to 50 users
 *               price_inr:
 *                 type: number
 *                 example: 4999.00
 *               billing_cycle:
 *                 type: string
 *                 enum: [monthly, quarterly, half_yearly, yearly]
 *                 example: quarterly
 *               billing_months:
 *                 type: integer
 *                 example: 3
 *               billing_type:
 *                 type: string
 *                 enum: [prepaid, postpaid]
 *                 example: prepaid
 *               max_users:
 *                 type: integer
 *                 example: 50
 *               max_clients:
 *                 type: integer
 *                 example: 5
 *               base_user_limit:
 *                 type: integer
 *                 example: 50
 *               extra_user_limit:
 *                 type: integer
 *                 example: 10
 *               pool_user_months:
 *                 type: integer
 *                 example: 3
 *               price_per_user:
 *                 type: number
 *                 example: 199.00
 *               overage_policy:
 *                 type: string
 *                 enum: [hard_stop, charge_overage, notify_only]
 *                 example: hard_stop
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Attendance", "Payroll", "Leave Management"]
 *               module_access:
 *                 type: object
 *                 example: { "attendance": true, "payroll": true, "recruitment": false }
 *     responses:
 *       201:
 *         description: Plan created successfully
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
 *                   example: Plan created successfully
 *                 data:
 *                   type: object
 *       400:
 *         description: Validation error or plan name already exists
 *       403:
 *         description: Forbidden - Admin or Manager role required
 */
router.post("/", p, adminManager, c.createPlan as any);

/**
 * @swagger
 * /api/plans/{id}:
 *   put:
 *     summary: Update a plan (Admin & Manager only)
 *     tags: [Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price_inr:
 *                 type: number
 *               billing_cycle:
 *                 type: string
 *                 enum: [monthly, quarterly, half_yearly, yearly]
 *               billing_type:
 *                 type: string
 *                 enum: [prepaid, postpaid]
 *               max_users:
 *                 type: integer
 *               base_user_limit:
 *                 type: integer
 *               extra_user_limit:
 *                 type: integer
 *               price_per_user:
 *                 type: number
 *               overage_policy:
 *                 type: string
 *                 enum: [hard_stop, charge_overage, notify_only]
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *               module_access:
 *                 type: object
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Plan updated successfully
 *       404:
 *         description: Plan not found
 *       403:
 *         description: Forbidden
 */
router.put("/:id", p, adminManager, c.updatePlan as any);

/**
 * @swagger
 * /api/plans/{id}:
 *   delete:
 *     summary: Delete (deactivate) a plan (Admin only)
 *     tags: [Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Plan deactivated successfully
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
 *                   example: Plan deactivated successfully
 *       404:
 *         description: Plan not found
 *       403:
 *         description: Forbidden - Admin role required
 */
router.delete("/:id", p, admin, c.deletePlan as any);

export default router;