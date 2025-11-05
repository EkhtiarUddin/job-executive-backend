const express = require('express');
const {
  applyForJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  getApplicationStats
} = require('../controllers/applicationController');
const auth = require('../middleware/auth');
const { applicationValidation, idValidation } = require('../middleware/validation');

const router = express.Router();
const authSeeker = auth(['SEEKER']);
const authEmployer = auth(['EMPLOYER']);

/**
 * @swagger
 * /api/applications/my-applications:
 *   get:
 *     summary: Get user's applications
 *     tags: [Applications]
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
 *     responses:
 *       200:
 *         description: Applications fetched successfully
 */
router.get('/my-applications', authSeeker, getMyApplications);

/**
 * @swagger
 * /api/applications/job/{id}:
 *   get:
 *     summary: Get applications for a job
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *     responses:
 *       200:
 *         description: Job applications fetched successfully
 */
router.get('/job/:id', authEmployer, idValidation, getJobApplications);

/**
 * @swagger
 * /api/applications/stats:
 *   get:
 *     summary: Get application statistics
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Application stats fetched successfully
 */
router.get('/stats', auth(), getApplicationStats);

/**
 * @swagger
 * /api/applications/job/{id}/apply:
 *   post:
 *     summary: Apply for a job
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               coverLetter:
 *                 type: string
 *     responses:
 *       201:
 *         description: Application submitted successfully
 */
router.post('/job/:id/apply', authSeeker, idValidation, applicationValidation, applyForJob);

/**
 * @swagger
 * /api/applications/{id}/status:
 *   put:
 *     summary: Update application status
 *     tags: [Applications]
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [APPLIED, REVIEWED, SHORTLISTED, INTERVIEW, HIRED, REJECTED]
 *     responses:
 *       200:
 *         description: Application status updated successfully
 */
router.put('/:id/status', authEmployer, idValidation, updateApplicationStatus);
module.exports = router;
