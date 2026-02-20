import { Router }    from "express";
import * as c        from "../controllers/subscriptions.controller";
import { protect }   from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();
const p            = protect as any;
const adminManager = authorize("admin","manager") as any;

/**
 * @swagger
 * tags:
 *   name: Subscriptions
 *   description: Client subscription management
 */

/**
 * @swagger
 * /api/subscriptions/stats:
 *   get:
 *     summary: Get subscription statistics
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription stats fetched successfully
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
 *                     total:
 *                       type: integer
 *                       example: 200
 *                     active:
 *                       type: integer
 *                       example: 150
 *                     expired:
 *                       type: integer
 *                       example: 30
 *                     cancelled:
 *                       type: integer
 *                       example: 10
 *                     trial:
 *                       type: integer
 *                       example: 10
 *                     expiring_in_7_days:
 *                       type: integer
 *                       example: 5
 *                     expiring_in_30_days:
 *                       type: integer
 *                       example: 20
 *       401:
 *         description: Unauthorized
 */
router.get("/stats", p, c.getStats as any);

/**
 * @swagger
 * /api/subscriptions:
 *   get:
 *     summary: Get all subscriptions with filters and pagination
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: subscription_status
 *         schema:
 *           type: string
 *           enum: [active, expired, cancelled, trial]
 *       - in: query
 *         name: payment_status
 *         schema:
 *           type: string
 *           enum: [paid, pending, failed, refunded]
 *       - in: query
 *         name: client_id
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: plan_id
 *         schema:
 *           type: integer
 *           example: 2
 *       - in: query
 *         name: billing_cycle
 *         schema:
 *           type: string
 *           enum: [monthly, quarterly, half_yearly, yearly]
 *     responses:
 *       200:
 *         description: List of subscriptions
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
 *                     subscriptions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           client_id:
 *                             type: integer
 *                           plan_id:
 *                             type: integer
 *                           start_date:
 *                             type: string
 *                             format: date
 *                           end_date:
 *                             type: string
 *                             format: date
 *                           subscription_status:
 *                             type: string
 *                           payment_status:
 *                             type: string
 *                           final_amount:
 *                             type: number
 *                           client:
 *                             type: object
 *                           plan:
 *                             type: object
 *                     total:
 *                       type: integer
 *                       example: 200
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 20
 *       401:
 *         description: Unauthorized
 */
router.get("/", p, c.getSubscriptions as any);

/**
 * @swagger
 * /api/subscriptions/{id}:
 *   get:
 *     summary: Get a single subscription by ID
 *     tags: [Subscriptions]
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
 *         description: Subscription details with client and plan info
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
 *                     client_id:
 *                       type: integer
 *                     plan_id:
 *                       type: integer
 *                     start_date:
 *                       type: string
 *                       format: date
 *                     end_date:
 *                       type: string
 *                       format: date
 *                     trial_ends_at:
 *                       type: string
 *                       format: date
 *                     billing_cycle:
 *                       type: string
 *                     final_amount:
 *                       type: number
 *                     discount:
 *                       type: number
 *                     active_users:
 *                       type: integer
 *                     subscription_status:
 *                       type: string
 *                     payment_status:
 *                       type: string
 *                     auto_renew:
 *                       type: boolean
 *                     client:
 *                       type: object
 *                     plan:
 *                       type: object
 *                     payments:
 *                       type: array
 *                       items:
 *                         type: object
 *       404:
 *         description: Subscription not found
 *       401:
 *         description: Unauthorized
 */
router.get("/:id", p, c.getSubscriptionById as any);

/**
 * @swagger
 * /api/subscriptions/{id}/history:
 *   get:
 *     summary: Get subscription history (renewals, status changes)
 *     tags: [Subscriptions]
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
 *         description: Subscription history fetched successfully
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
 *                       subscription_id:
 *                         type: integer
 *                       action:
 *                         type: string
 *                         example: renewed
 *                       old_value:
 *                         type: object
 *                       new_value:
 *                         type: object
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       404:
 *         description: Subscription not found
 *       401:
 *         description: Unauthorized
 */
router.get("/:id/history", p, c.getHistory as any);

/**
 * @swagger
 * /api/subscriptions:
 *   post:
 *     summary: Create a new subscription for a client (Admin & Manager only)
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [client_id, plan_id, start_date, end_date]
 *             properties:
 *               client_id:
 *                 type: integer
 *                 example: 1
 *               plan_id:
 *                 type: integer
 *                 example: 2
 *               start_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-02-01"
 *               end_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-04-30"
 *               trial_ends_at:
 *                 type: string
 *                 format: date
 *                 example: "2026-02-15"
 *               billing_cycle:
 *                 type: string
 *                 enum: [monthly, quarterly, half_yearly, yearly]
 *                 example: quarterly
 *               billing_months:
 *                 type: integer
 *                 example: 3
 *               amount_paid:
 *                 type: number
 *                 example: 4999.00
 *               discount:
 *                 type: number
 *                 example: 500.00
 *               final_amount:
 *                 type: number
 *                 example: 4499.00
 *               active_users:
 *                 type: integer
 *                 example: 45
 *               payment_status:
 *                 type: string
 *                 enum: [paid, pending, failed, refunded]
 *                 example: paid
 *               subscription_status:
 *                 type: string
 *                 enum: [active, expired, cancelled, trial]
 *                 example: active
 *               auto_renew:
 *                 type: boolean
 *                 example: false
 *               remarks:
 *                 type: string
 *                 example: First subscription for this client
 *     responses:
 *       201:
 *         description: Subscription created successfully
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
 *                   example: Subscription created successfully
 *                 data:
 *                   type: object
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden - Admin or Manager role required
 */
router.post("/", p, adminManager, c.createSubscription as any);

/**
 * @swagger
 * /api/subscriptions/{id}:
 *   put:
 *     summary: Update a subscription (Admin & Manager only)
 *     tags: [Subscriptions]
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
 *               plan_id:
 *                 type: integer
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *               billing_cycle:
 *                 type: string
 *                 enum: [monthly, quarterly, half_yearly, yearly]
 *               amount_paid:
 *                 type: number
 *               discount:
 *                 type: number
 *               final_amount:
 *                 type: number
 *               active_users:
 *                 type: integer
 *               payment_status:
 *                 type: string
 *                 enum: [paid, pending, failed, refunded]
 *               auto_renew:
 *                 type: boolean
 *               remarks:
 *                 type: string
 *     responses:
 *       200:
 *         description: Subscription updated successfully
 *       404:
 *         description: Subscription not found
 *       403:
 *         description: Forbidden
 */
router.put("/:id", p, adminManager, c.updateSubscription as any);

/**
 * @swagger
 * /api/subscriptions/{id}/cancel:
 *   patch:
 *     summary: Cancel a subscription (Admin & Manager only)
 *     tags: [Subscriptions]
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
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               remarks:
 *                 type: string
 *                 example: Client requested cancellation
 *     responses:
 *       200:
 *         description: Subscription cancelled successfully
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
 *                   example: Subscription cancelled successfully
 *       404:
 *         description: Subscription not found
 *       400:
 *         description: Subscription already cancelled
 *       403:
 *         description: Forbidden
 */
router.patch("/:id/cancel", p, adminManager, c.cancelSubscription as any);

/**
 * @swagger
 * /api/subscriptions/{id}/renew:
 *   patch:
 *     summary: Renew a subscription (Admin & Manager only)
 *     tags: [Subscriptions]
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
 *             required: [end_date]
 *             properties:
 *               end_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-07-31"
 *               plan_id:
 *                 type: integer
 *                 example: 2
 *               amount_paid:
 *                 type: number
 *                 example: 4999.00
 *               discount:
 *                 type: number
 *                 example: 0
 *               final_amount:
 *                 type: number
 *                 example: 4999.00
 *               payment_status:
 *                 type: string
 *                 enum: [paid, pending, failed, refunded]
 *                 example: paid
 *               remarks:
 *                 type: string
 *                 example: Renewed for Q3 2026
 *     responses:
 *       200:
 *         description: Subscription renewed successfully
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
 *                   example: Subscription renewed successfully
 *                 data:
 *                   type: object
 *       404:
 *         description: Subscription not found
 *       400:
 *         description: Cannot renew a cancelled subscription
 *       403:
 *         description: Forbidden
 */
router.patch("/:id/renew", p, adminManager, c.renewSubscription as any);

export default router;