const { prisma } = require('../config/database');
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalJobs,
      totalApplications,
      activeJobs,
      employers,
      seekers,
      recentUsers,
      recentJobs
    ] = await Promise.all([
      prisma.user.count(),
      prisma.job.count(),
      prisma.application.count(),
      prisma.job.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: 'EMPLOYER' } }),
      prisma.user.count({ where: { role: 'SEEKER' } }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        }
      }),
      prisma.job.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          employer: {
            select: {
              name: true,
              email: true
            }
          },
          _count: {
            select: {
              applications: true
            }
          }
        }
      })
    ]);

    const applicationStats = await prisma.application.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });

    const jobStats = await prisma.job.groupBy({
      by: ['type'],
      _count: {
        id: true
      }
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalJobs,
          totalApplications,
          activeJobs,
          employers,
          seekers
        },
        applicationStats,
        jobStats,
        recentUsers,
        recentJobs
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const manageUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, role } = req.body;

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let updatedUser;
    
    if (action === 'change-role' && role) {
      updatedUser = await prisma.user.update({
        where: { id },
        data: { role },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true
        }
      });
    } else if (action === 'deactivate') {
      updatedUser = user;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid action or missing parameters'
      });
    }

    res.json({
      success: true,
      message: `User ${action} successful`,
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('Manage user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error managing user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const deleteUserAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    await prisma.user.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const manageJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        employer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    let updatedJob;

    if (action === 'toggle-active') {
      updatedJob = await prisma.job.update({
        where: { id },
        data: { isActive: !job.isActive },
        include: {
          employer: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
    } else if (action === 'delete') {
      await prisma.job.delete({
        where: { id }
      });
      return res.json({
        success: true,
        message: 'Job deleted successfully'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid action'
      });
    }

    res.json({
      success: true,
      message: `Job ${action} successful`,
      data: { job: updatedJob }
    });
  } catch (error) {
    console.error('Manage job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error managing job',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getAllJobsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (page - 1) * limit;

    const where = {};

    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const jobs = await prisma.job.findMany({
      where,
      include: {
        employer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            applications: true
          }
        }
      },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.job.count({ where });

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          current: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalResults: total,
          resultsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all jobs admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getDashboardStats,
  manageUser,
  deleteUserAdmin,
  manageJob,
  getAllJobsAdmin
};
