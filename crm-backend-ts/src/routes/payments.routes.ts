import { Router }    from "express";
import * as c        from "../controllers/payments.controller";
import { protect }   from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router       = Router();
const p            = protect as any;
const adminManager = authorize("admin","manager") as any;

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment tracking and management
 */

/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Get all payments with filters and pagination
 *     tags: [Payments]
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
 *         name: payment_status
 *         schema:
 *           type: string
 *           enum: [paid, pending, failed, refunded]
 *         description: Filter by payment status
 *       - in: query
 *         name: payment_method
 *         schema:
 *           type: string
 *           enum: [upi, bank_transfer, card, cash, razorpay]
 *         description: Filter by payment method
 *       - in: query
 *         name: client_id
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Filter by client
 *       - in: query
 *         name: subscription_id
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Filter by subscription
 *       - in: query
 *         name: from_date
 *         schema:
 *           type: string
 *           format: date
 *           example: "2026-01-01"
 *         description: Filter payments from this date
 *       - in: query
 *         name: to_date
 *         schema:
 *           type: string
 *           format: date
 *           example: "2026-03-31"
 *         description: Filter payments up to this date
 *     responses:
 *       200:
 *         description: List of payments
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
 *                     payments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           client_id:
 *                             type: integer
 *                           subscription_id:
 *                             type: integer
 *                           amount:
 *                             type: number
 *                             example: 4999.00
 *                           currency:
 *                             type: string
 *                             example: INR
 *                           payment_method:
 *                             type: string
 *                             example: upi
 *                           payment_status:
 *                             type: string
 *                             example: paid
 *                           transaction_id:
 *                             type: string
 *                           receipt_number:
 *                             type: string
 *                           payment_date:
 *                             type: string
 *                             format: date
 *                           client:
 *                             type: object
 *                           subscription:
 *                             type: object
 *                     total:
 *                       type: integer
 *                       example: 50
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *       401:
 *         description: Unauthorized
 */
router.get("/", p, c.getPayments as any);

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Record a new payment (Admin & Manager only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [subscription_id, client_id, amount]
 *             properties:
 *               subscription_id:
 *                 type: integer
 *                 example: 1
 *               client_id:
 *                 type: integer
 *                 example: 1
 *               amount:
 *                 type: number
 *                 example: 4999.00
 *               currency:
 *                 type: string
 *                 example: INR
 *               payment_method:
 *                 type: string
 *                 enum: [upi, bank_transfer, card, cash, razorpay]
 *                 example: upi
 *               payment_status:
 *                 type: string
 *                 enum: [paid, pending, failed, refunded]
 *                 example: paid
 *               transaction_id:
 *                 type: string
 *                 example: TXN20260201123456
 *               receipt_number:
 *                 type: string
 *                 example: RCP-2026-001
 *               payment_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-02-01"
 *               failure_reason:
 *                 type: string
 *                 example: Insufficient funds
 *               notes:
 *                 type: string
 *                 example: Payment received via UPI
 *     responses:
 *       201:
 *         description: Payment recorded successfully
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
 *                   example: Payment recorded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     receipt_number:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     payment_status:
 *                       type: string
 *       400:
 *         description: Validation error or duplicate transaction ID
 *       403:
 *         description: Forbidden - Admin or Manager role required
 */
router.post("/", p, adminManager, c.createPayment as any);

/**
 * @swagger
 * /api/payments/{id}:
 *   put:
 *     summary: Update a payment record (Admin & Manager only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Payment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 4999.00
 *               payment_method:
 *                 type: string
 *                 enum: [upi, bank_transfer, card, cash, razorpay]
 *               payment_status:
 *                 type: string
 *                 enum: [paid, pending, failed, refunded]
 *               transaction_id:
 *                 type: string
 *               receipt_number:
 *                 type: string
 *               payment_date:
 *                 type: string
 *                 format: date
 *               failure_reason:
 *                 type: string
 *                 example: Card declined
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment updated successfully
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
 *                   example: Payment updated successfully
 *                 data:
 *                   type: object
 *       404:
 *         description: Payment not found
 *       403:
 *         description: Forbidden
 */
router.put("/:id", p, adminManager, c.updatePayment as any);

export default router;