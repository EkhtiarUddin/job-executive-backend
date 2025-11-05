// src/controllers/userController.js
const { prisma } = require('../config/database');
const { hashPassword } = require('../utils/helpers');

const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    
    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        bio: true,
        phone: true,
        location: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: {
            jobsPosted: true,
            applications: true
          }
        }
      },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.user.count({ where });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalResults: total,
          resultsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        bio: true,
        phone: true,
        location: true,
        avatar: true,
        resume: true,
        createdAt: true,
        updatedAt: true,
        jobsPosted: {
          where: {
            isActive: true
          },
          include: {
            _count: {
              select: {
                applications: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        applications: {
          include: {
            job: {
              select: {
                id: true,
                title: true,
                company: true,
                location: true,
                type: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, bio, phone, location, avatar, resume } = req.body;

    // Check if user exists and has permission
    let where = { id };
    
    // Non-admin users can only update their own profile
    if (req.user.role !== 'ADMIN') {
      where.id = req.user.id;
    }

    const user = await prisma.user.update({
      where,
      data: { 
        name, 
        bio, 
        phone, 
        location, 
        avatar, 
        resume 
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        bio: true,
        phone: true,
        location: true,
        avatar: true,
        resume: true
      }
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Admins can delete any user, users can only delete themselves
    let where = { id };
    
    if (req.user.role !== 'ADMIN') {
      where.id = req.user.id;
    }

    await prisma.user.delete({ 
      where 
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { 
        avatar: req.file.path 
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true
      }
    });

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading avatar',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { 
        resume: req.file.path 
      },
      select: {
        id: true,
        email: true,
        name: true,
        resume: true
      }
    });

    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Upload resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading resume',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  uploadAvatar,
  uploadResume
};
