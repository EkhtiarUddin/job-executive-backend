const { prisma } = require('../config/database');
const { getPagination } = require('../utils/helpers');
const { sendEmail, emailTemplates } = require('../utils/emailService');

const applyForJob = async (req, res) => {
  try {
    const { id: jobId } = req.params;
    const { coverLetter } = req.body;
    const job = await prisma.job.findUnique({
      where: { 
        id: jobId,
        isActive: true 
      },
      include: {
        employer: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or no longer accepting applications'
      });
    }
    const existingApplication = await prisma.application.findUnique({
      where: {
        jobId_seekerId: {
          jobId,
          seekerId: req.user.id
        }
      }
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    const application = await prisma.application.create({
      data: {
        jobId,
        seekerId: req.user.id,
        coverLetter: coverLetter || `I am interested in the ${job.title} position at ${job.company}.`
      },
      include: {
        job: {
          select: {
            title: true,
            company: true,
            location: true,
            type: true
          }
        },
        seeker: {
          select: {
            name: true,
            email: true,
            location: true
          }
        }
      }
    });

    try {
      const emailTemplate = emailTemplates.jobApplication(
        job.title,
        job.company,
        req.user.name
      );
      await sendEmail(
        req.user.email,
        emailTemplate.subject,
        emailTemplate.html
      );
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: { application }
    });
  } catch (error) {
    console.error('Apply for job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error applying for job',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getMyApplications = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const { offset } = getPagination(page, limit);

    const where = {
      seekerId: req.user.id
    };

    if (status) {
      where.status = status;
    }

    const applications = await prisma.application.findMany({
      where,
      include: {
        job: {
          include: {
            employer: {
              select: {
                id: true,
                name: true,
                email: true,
                location: true,
                avatar: true
              }
            }
          }
        }
      },
      skip: offset,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.application.count({ 
      where: { seekerId: req.user.id } 
    });

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          current: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalResults: total,
          resultsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getJobApplications = async (req, res) => {
  try {
    const { id: jobId } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    const { offset } = getPagination(page, limit);
    const job = await prisma.job.findFirst({
      where: { 
        id: jobId, 
        employerId: req.user.id 
      }
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or access denied'
      });
    }

    const where = { jobId };
    
    if (status) {
      where.status = status;
    }

    const applications = await prisma.application.findMany({
      where,
      include: {
        seeker: {
          select: {
            id: true,
            name: true,
            email: true,
            location: true,
            bio: true,
            phone: true,
            avatar: true,
            resume: true
          }
        }
      },
      skip: offset,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.application.count({ where });

    res.json({
      success: true,
      data: {
        applications,
        job: {
          id: job.id,
          title: job.title,
          company: job.company
        },
        pagination: {
          current: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalResults: total,
          resultsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const { id: applicationId } = req.params;
    const { status } = req.body;
    const application = await prisma.application.findFirst({
      where: { 
        id: applicationId,
        job: { employerId: req.user.id }
      },
      include: {
        job: {
          select: {
            title: true,
            company: true
          }
        },
        seeker: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or access denied'
      });
    }

    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: { status },
      include: {
        job: {
          select: {
            title: true,
            company: true
          }
        },
        seeker: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    try {
      const emailTemplate = emailTemplates.applicationStatusUpdate(
        application.job.title,
        application.job.company,
        application.seeker.name,
        status
      );
      await sendEmail(
        application.seeker.email,
        emailTemplate.subject,
        emailTemplate.html
      );
    } catch (emailError) {
      console.error('Failed to send status update email:', emailError);
    }

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: { application: updatedApplication }
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating application status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getApplicationStats = async (req, res) => {
  try {
    const stats = await prisma.application.groupBy({
      by: ['status'],
      where: {
        OR: [
          { job: { employerId: req.user.id } },
          { seekerId: req.user.id }
        ]
      },
      _count: {
        id: true
      }
    });

    const totalApplications = await prisma.application.count({
      where: {
        OR: [
          { job: { employerId: req.user.id } },
          { seekerId: req.user.id }
        ]
      }
    });

    res.json({
      success: true,
      data: {
        stats,
        total: totalApplications
      }
    });
  } catch (error) {
    console.error('Get application stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching application statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  applyForJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  getApplicationStats
};
