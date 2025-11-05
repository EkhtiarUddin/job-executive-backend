// src/controllers/authController.js
const { prisma } = require('../config/database');
const { hashPassword, verifyPassword, generateToken, sanitizeUser, generateRandomString } = require('../utils/helpers');
const { sendEmail, emailTemplates } = require('../utils/emailService');

const register = async (req, res) => {
  try {
    const { email, password, name, role, bio, phone, location } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate verification token
    const verificationToken = generateRandomString(32);
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user (unverified)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'SEEKER',
        bio,
        phone,
        location,
        isVerified: false,
        verificationToken,
        verificationTokenExpires
      }
    });

    // Send verification email
    try {
      const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
      
      const emailTemplate = emailTemplates.emailVerification(
        user.name,
        verificationUrl
      );
      
      await sendEmail(
        user.email,
        emailTemplate.subject,
        emailTemplate.html
      );
      
      console.log('✅ Verification email sent to:', user.email);
    } catch (emailError) {
      console.log('❌ Failed to send verification email:', emailError.message);
      // Don't fail registration if email fails
    }

    // Sanitize user object
    const sanitizedUser = sanitizeUser(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      data: {
        user: sanitizedUser,
        // Don't send token until email is verified
        token: null
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during registration'
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    // Find user with valid verification token
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpires: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Update user as verified and clear verification token
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationTokenExpires: null
      }
    });

    // Generate JWT token now that user is verified
    const authToken = generateToken(updatedUser.id);
    const sanitizedUser = sanitizeUser(updatedUser);

    res.json({
      success: true,
      message: 'Email verified successfully! Your account is now active.',
      data: {
        user: sanitizedUser,
        token: authToken
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying email'
    });
  }
};

const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new verification token
    const verificationToken = generateRandomString(32);
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Update user with new token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationTokenExpires
      }
    });

    // Send new verification email
    try {
      const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
      
      const emailTemplate = emailTemplates.emailVerification(
        user.name,
        verificationUrl
      );
      
      await sendEmail(
        user.email,
        emailTemplate.subject,
        emailTemplate.html
      );
      
      console.log('✅ Verification email resent to:', user.email);
    } catch (emailError) {
      console.log('❌ Failed to resend verification email:', emailError.message);
    }

    res.json({
      success: true,
      message: 'Verification email sent successfully. Please check your inbox.'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resending verification email'
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({ 
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        role: true,
        isVerified: true
      }
    });

    if (!user || !(await verifyPassword(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email before logging in. Check your inbox or request a new verification email.'
      });
    }

    // Generate token
    const token = generateToken(user.id);

    // Get full user data without password
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
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
        isVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login'
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
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
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        jobsPosted: {
          include: {
            _count: {
              select: { applications: true }
            }
          }
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
          }
        }
      }
    });

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, bio, phone, location } = req.body;
    
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, bio, phone, location },
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
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
};

const checkAuth = (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    data: { user: req.user }
  });
};


module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  verifyEmail,
  resendVerification,
  checkAuth
};
