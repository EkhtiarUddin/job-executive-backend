// src/routes/admin.js
const express = require('express');
const {
  getDashboardStats,
  manageUser,
  deleteUserAdmin,
  manageJob,
  getAllJobsAdmin
} = require('../controllers/adminController');
const auth = require('../middleware/auth');
const { idValidation } = require('../middleware/validation');

const router = express.Router();

// Create role-specific middleware inline
const authAdmin = auth(['ADMIN']);

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats fetched successfully
 */
router.get('/dashboard', authAdmin, getDashboardStats);

/**
 * @swagger
 * /api/admin/jobs:
 *   get:
 *     summary: Get all jobs (Admin view)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Jobs fetched successfully
 */
router.get('/jobs', authAdmin, getAllJobsAdmin);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   patch:
 *     summary: Manage user (change role, deactivate)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [change-role, deactivate]
 *               role:
 *                 type: string
 *                 enum: [ADMIN, EMPLOYER, SEEKER]
 *     responses:
 *       200:
 *         description: User managed successfully
 */
router.patch('/users/:id', authAdmin, idValidation, manageUser);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 */
router.delete('/users/:id', authAdmin, idValidation, deleteUserAdmin);

/**
 * @swagger
 * /api/admin/jobs/{id}:
 *   patch:
 *     summary: Manage job (toggle active, delete)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [toggle-active, delete]
 *     responses:
 *       200:
 *         description: Job managed successfully
 */
router.patch('/jobs/:id', authAdmin, idValidation, manageJob);

module.exports = router;
