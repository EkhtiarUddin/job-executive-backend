// src/routes/jobs.js
const express = require('express');
const {
  getAllJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getEmployerJobs,
  toggleJobStatus
} = require('../controllers/jobController');
const auth = require('../middleware/auth');
const { jobValidation, idValidation } = require('../middleware/validation');

const router = express.Router();

// Create role-specific middleware inline
const authEmployer = auth(['EMPLOYER']);

/**
 * @swagger
 * components:
 *   schemas:
 *     Job:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         company:
 *           type: string
 *         salary:
 *           type: string
 *         location:
 *           type: string
 *         type:
 *           type: string
 *           enum: [FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, REMOTE, HYBRID]
 *         category:
 *           type: string
 *         experience:
 *           type: string
 *         requirements:
 *           type: string
 *         benefits:
 *           type: string
 *         isActive:
 *           type: boolean
 *         employerId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     JobCreate:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - company
 *         - salary
 *         - location
 *         - type
 *         - category
 *         - requirements
 *       properties:
 *         title:
 *           type: string
 *           example: "Senior Frontend Developer"
 *         description:
 *           type: string
 *           example: "We are looking for an experienced frontend developer..."
 *         company:
 *           type: string
 *           example: "Tech Company Inc"
 *         salary:
 *           type: string
 *           example: "$80,000 - $100,000"
 *         location:
 *           type: string
 *           example: "Remote"
 *         type:
 *           type: string
 *           enum: [FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, REMOTE, HYBRID]
 *           example: "FULL_TIME"
 *         category:
 *           type: string
 *           example: "Software Development"
 *         experience:
 *           type: string
 *           example: "3+ years"
 *         requirements:
 *           type: string
 *           example: "Experience with React, TypeScript, and modern frontend tools"
 *         benefits:
 *           type: string
 *           example: "Health insurance, flexible hours, remote work"
 */

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: Get all jobs with filters and pagination
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of jobs per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title, description, company
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, REMOTE, HYBRID]
 *         description: Filter by job type
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: experience
 *         schema:
 *           type: string
 *         description: Filter by experience level
 *     responses:
 *       200:
 *         description: Jobs fetched successfully
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
 *                     jobs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Job'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         current:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         totalResults:
 *                           type: integer
 *                         resultsPerPage:
 *                           type: integer
 *       500:
 *         description: Internal server error
 */
router.get('/', getAllJobs);

/**
 * @swagger
 * /api/jobs/employer:
 *   get:
 *     summary: Get employer's jobs
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of jobs per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by job status
 *     responses:
 *       200:
 *         description: Employer jobs fetched successfully
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - User is not an employer
 *       500:
 *         description: Internal server error
 */
router.get('/employer', authEmployer, getEmployerJobs);

/**
 * @swagger
 * /api/jobs/{id}:
 *   get:
 *     summary: Get job by ID
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job fetched successfully
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
 *                     job:
 *                       $ref: '#/components/schemas/Job'
 *       404:
 *         description: Job not found
 *       400:
 *         description: Invalid job ID
 *       500:
 *         description: Internal server error
 */
router.get('/:id', idValidation, getJob);

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: Create a new job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JobCreate'
 *     responses:
 *       201:
 *         description: Job created successfully
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
 *                   example: "Job created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     job:
 *                       $ref: '#/components/schemas/Job'
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - User is not an employer or email not verified
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', authEmployer, jobValidation, createJob);

/**
 * @swagger
 * /api/jobs/{id}:
 *   put:
 *     summary: Update job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JobCreate'
 *     responses:
 *       200:
 *         description: Job updated successfully
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - User does not own this job
 *       404:
 *         description: Job not found
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authEmployer, idValidation, jobValidation, updateJob);

/**
 * @swagger
 * /api/jobs/{id}:
 *   delete:
 *     summary: Delete job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job deleted successfully
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - User does not own this job
 *       404:
 *         description: Job not found
 *       400:
 *         description: Invalid job ID
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authEmployer, idValidation, deleteJob);

/**
 * @swagger
 * /api/jobs/{id}/toggle:
 *   patch:
 *     summary: Toggle job active status
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job status toggled successfully
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - User does not own this job
 *       404:
 *         description: Job not found
 *       400:
 *         description: Invalid job ID
 *       500:
 *         description: Internal server error
 */
router.patch('/:id/toggle', authEmployer, idValidation, toggleJobStatus);

module.exports = router;
