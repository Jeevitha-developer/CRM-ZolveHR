import { Router }   from "express";
import * as c       from "../controllers/clients.controller";
import { protect }  from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();
const p            = protect as any;
const admin        = authorize("admin") as any;
const adminManager = authorize("admin","manager") as any;

/**
 * @swagger
 * tags:
 *   name: Clients
 *   description: Client management (Admin & Manager access)
 */

/**
 * @swagger
 * /api/clients/stats:
 *   get:
 *     summary: Get client statistics (total, active, inactive, suspended)
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Client stats fetched successfully
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
 *                       example: 120
 *                     active:
 *                       type: integer
 *                       example: 95
 *                     inactive:
 *                       type: integer
 *                       example: 15
 *                     suspended:
 *                       type: integer
 *                       example: 10
 *       401:
 *         description: Unauthorized
 */
router.get("/stats", p, c.getStats as any);

/**
 * @swagger
 * /api/clients:
 *   get:
 *     summary: Get all clients with pagination and filters
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Records per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, suspended]
 *         description: Filter by client status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           example: AKR Industries
 *         description: Search by company name, email or phone
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *           example: Chennai
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *           example: Tamil Nadu
 *     responses:
 *       200:
 *         description: List of clients
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
 *                     clients:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           company_name:
 *                             type: string
 *                           contact_person:
 *                             type: string
 *                           email:
 *                             type: string
 *                           phone:
 *                             type: string
 *                           status:
 *                             type: string
 *                           hrms_status:
 *                             type: string
 *                     total:
 *                       type: integer
 *                       example: 120
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 12
 *       401:
 *         description: Unauthorized
 */
router.get("/", p, c.getClients as any);

/**
 * @swagger
 * /api/clients/{id}:
 *   get:
 *     summary: Get a single client by ID with subscriptions
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Client ID
 *     responses:
 *       200:
 *         description: Client details with subscriptions and module access
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
 *                     company_name:
 *                       type: string
 *                     contact_person:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     address:
 *                       type: string
 *                     city:
 *                       type: string
 *                     state:
 *                       type: string
 *                     status:
 *                       type: string
 *                     hrms_status:
 *                       type: string
 *                     subscriptions:
 *                       type: array
 *                       items:
 *                         type: object
 *       404:
 *         description: Client not found
 *       401:
 *         description: Unauthorized
 */
router.get("/:id", p, c.getClientById as any);

/**
 * @swagger
 * /api/clients:
 *   post:
 *     summary: Create a new client (Admin & Manager only)
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [company_name]
 *             properties:
 *               company_name:
 *                 type: string
 *                 example: AKR Industries Pvt Ltd
 *               contact_person:
 *                 type: string
 *                 example: Rajesh Kumar
 *               email:
 *                 type: string
 *                 example: rajesh@akrindustries.com
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               address:
 *                 type: string
 *                 example: 123 Industrial Area
 *               city:
 *                 type: string
 *                 example: Chennai
 *               state:
 *                 type: string
 *                 example: Tamil Nadu
 *               country:
 *                 type: string
 *                 example: India
 *               pincode:
 *                 type: string
 *                 example: "600001"
 *               gst_number:
 *                 type: string
 *                 example: 33AABCU9603R1ZX
 *               pan_number:
 *                 type: string
 *                 example: AABCU9603R
 *               industry:
 *                 type: string
 *                 example: Manufacturing
 *               company_size:
 *                 type: string
 *                 enum: ["1-10","11-50","51-200","201-500","500+"]
 *                 example: "51-200"
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Client created successfully
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
 *                   example: Client created successfully
 *                 data:
 *                   type: object
 *       400:
 *         description: Validation error or email already exists
 *       403:
 *         description: Forbidden - Admin or Manager role required
 */
router.post("/", p, adminManager, c.createClient as any);

/**
 * @swagger
 * /api/clients/{id}:
 *   put:
 *     summary: Update client details (Admin & Manager only)
 *     tags: [Clients]
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
 *               company_name:
 *                 type: string
 *               contact_person:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               pincode:
 *                 type: string
 *               gst_number:
 *                 type: string
 *               pan_number:
 *                 type: string
 *               industry:
 *                 type: string
 *               company_size:
 *                 type: string
 *                 enum: ["1-10","11-50","51-200","201-500","500+"]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Client updated successfully
 *       404:
 *         description: Client not found
 *       403:
 *         description: Forbidden
 */
router.put("/:id", p, adminManager, c.updateClient as any);

/**
 * @swagger
 * /api/clients/{id}:
 *   delete:
 *     summary: Delete a client (Admin only)
 *     tags: [Clients]
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
 *         description: Client deleted successfully
 *       404:
 *         description: Client not found
 *       403:
 *         description: Forbidden - Admin role required
 */
router.delete("/:id", p, admin, c.deleteClient as any);

/**
 * @swagger
 * /api/clients/{id}/status:
 *   patch:
 *     summary: Update client status (Admin & Manager only)
 *     tags: [Clients]
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, inactive, suspended]
 *                 example: suspended
 *     responses:
 *       200:
 *         description: Client status updated successfully
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
 *                   example: Client status updated to suspended
 *       404:
 *         description: Client not found
 *       403:
 *         description: Forbidden
 */
router.patch("/:id/status", p, adminManager, c.updateClientStatus as any);

export default router;