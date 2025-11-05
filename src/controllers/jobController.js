// src/controllers/jobController.js
const { prisma } = require('../config/database');
const { getPagination, buildSearchConditions } = require('../utils/helpers');

const getAllJobs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      location, 
      type, 
      category,
      experience,
      salaryMin,
      salaryMax
    } = req.query;
    
    const { offset } = getPagination(page, limit);
    
    // Build search conditions
    const where = {
      isActive: true
    };

    // Text search
    if (search) {
      const searchConditions = buildSearchConditions(search, [
        'title', 'description', 'company', 'requirements'
      ]);
      Object.assign(where, searchConditions);
    }

    // Filters
    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    if (type) {
      where.type = type;
    }

    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }

    if (experience) {
      where.experience = { contains: experience, mode: 'insensitive' };
    }

    // Salary range filter (basic implementation)
    if (salaryMin || salaryMax) {
      // This is a simplified implementation
      // In production, you'd want to parse salary strings properly
      where.OR = [
        { salary: { contains: salaryMin || '', mode: 'insensitive' } },
        { salary: { contains: salaryMax || '', mode: 'insensitive' } }
      ];
    }

    const jobs = await prisma.job.findMany({
      where,
      include: {
        employer: {
          select: {
            id: true,
            name: true,
            email: true,
            location: true,
            avatar: true
          }
        },
        _count: {
          select: {
            applications: true
          }
        }
      },
      skip: offset,
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
    console.error('Get all jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        employer: {
          select: {
            id: true,
            name: true,
            email: true,
            location: true,
            bio: true,
            phone: true,
            avatar: true
          }
        },
        _count: {
          select: {
            applications: true
          }
        },
        applications: {
          include: {
            seeker: {
              select: {
                id: true,
                name: true,
                email: true,
                location: true,
                avatar: true
              }
            }
          },
          take: 5 // Show only recent applications
        }
      }
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      data: { job }
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// src/controllers/jobController.js - FIXED
const createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      company,
      salary,
      location,
      type,
      category,
      experience,
      requirements,
      benefits
    } = req.body;

    // Automatically use the logged-in user's ID as employerId
    const job = await prisma.job.create({
      data: {
        title,
        description,
        company,
        salary,
        location,
        type,
        category,
        experience: experience || "Not specified",
        requirements,
        benefits,
        employerId: req.user.id // AUTOMATICALLY from auth middleware
      },
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

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: { job }
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating job',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Verify job ownership
    const existingJob = await prisma.job.findFirst({
      where: { 
        id, 
        employerId: req.user.id 
      }
    });

    if (!existingJob) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or access denied'
      });
    }

    const job = await prisma.job.update({
      where: { id },
      data: updateData,
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
      }
    });

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: { job }
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating job',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify job ownership
    const existingJob = await prisma.job.findFirst({
      where: { 
        id, 
        employerId: req.user.id 
      }
    });

    if (!existingJob) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or access denied'
      });
    }

    await prisma.job.delete({ 
      where: { id } 
    });

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting job',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getEmployerJobs = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const { offset } = getPagination(page, limit);

    const where = {
      employerId: req.user.id
    };

    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    const jobs = await prisma.job.findMany({
      where,
      include: {
        _count: {
          select: {
            applications: true
          }
        },
        applications: {
          include: {
            seeker: {
              select: {
                id: true,
                name: true,
                email: true,
                location: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      skip: offset,
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
    console.error('Get employer jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const toggleJobStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify job ownership
    const existingJob = await prisma.job.findFirst({
      where: { 
        id, 
        employerId: req.user.id 
      }
    });

    if (!existingJob) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or access denied'
      });
    }

    const job = await prisma.job.update({
      where: { id },
      data: {
        isActive: !existingJob.isActive
      }
    });

    res.json({
      success: true,
      message: `Job ${job.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { job }
    });
  } catch (error) {
    console.error('Toggle job status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating job status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getEmployerJobs,
  toggleJobStatus
};
