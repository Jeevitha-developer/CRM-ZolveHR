import { Router }    from "express";
import * as c        from "../controllers/modules.controller";
import { protect }   from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();
const p     = protect as any;
const admin = authorize("admin") as any;

/**
 * @swagger
 * tags:
 *   name: Modules
 *   description: Package module management (Admin only for CUD operations)
 */

/**
 * @swagger
 * /api/modules:
 *   get:
 *     summary: Get all package modules
 *     tags: [Modules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *           example: true
 *         description: Filter by active/inactive modules
 *     responses:
 *       200:
 *         description: List of all modules
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
 *                         example: Attendance
 *                       description:
 *                         type: string
 *                         example: Manage employee attendance and shifts
 *                       is_active:
 *                         type: boolean
 *                         example: true
 *       401:
 *         description: Unauthorized
 */
router.get("/", p, c.getModules as any);

/**
 * @swagger
 * /api/modules/{id}:
 *   get:
 *     summary: Get a single module by ID
 *     tags: [Modules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Module ID
 *     responses:
 *       200:
 *         description: Module details
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
 *                     name:
 *                       type: string
 *                       example: Attendance
 *                     description:
 *                       type: string
 *                       example: Manage employee attendance and shifts
 *                     is_active:
 *                       type: boolean
 *                       example: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Module not found
 *       401:
 *         description: Unauthorized
 */
router.get("/:id", p, c.getModuleById as any);

/**
 * @swagger
 * /api/modules:
 *   post:
 *     summary: Create a new package module (Admin only)
 *     tags: [Modules]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Recruitment
 *               description:
 *                 type: string
 *                 example: Manage job postings, candidates and interviews
 *               is_active:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Module created successfully
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
 *                   example: Module created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     is_active:
 *                       type: boolean
 *       400:
 *         description: Module name already exists or validation error
 *       403:
 *         description: Forbidden - Admin role required
 */
router.post("/", p, admin, c.createModule as any);

/**
 * @swagger
 * /api/modules/{id}:
 *   put:
 *     summary: Update a module (Admin only)
 *     tags: [Modules]
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
 *                 example: Recruitment
 *               description:
 *                 type: string
 *                 example: Updated description
 *               is_active:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Module updated successfully
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
 *                   example: Module updated successfully
 *                 data:
 *                   type: object
 *       404:
 *         description: Module not found
 *       403:
 *         description: Forbidden - Admin role required
 */
router.put("/:id", p, admin, c.updateModule as any);

/**
 * @swagger
 * /api/modules/{id}:
 *   delete:
 *     summary: Delete (deactivate) a module (Admin only)
 *     tags: [Modules]
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
 *         description: Module deactivated successfully
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
 *                   example: Module deactivated successfully
 *       404:
 *         description: Module not found
 *       403:
 *         description: Forbidden - Admin role required
 */
router.delete("/:id", p, admin, c.deleteModule as any);

export default router;