const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log('Email transporter configuration failed:', error);
  } else {
    console.log('Email transporter is ready to send messages');
  }
});

const emailTemplates = {
  jobApplication: (jobTitle, companyName, applicantName) => ({
    subject: `Application Received - ${jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Application Received</h2>
        <p>Hello ${applicantName},</p>
        <p>Thank you for applying for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>.</p>
        <p>We have received your application and will review it carefully. We'll contact you if your qualifications match our requirements.</p>
        <br>
        <p>Best regards,<br>${companyName} Team</p>
      </div>
    `
  }),
  applicationStatusUpdate: (jobTitle, companyName, applicantName, status) => ({
    subject: `Application Update - ${jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Application Status Update</h2>
        <p>Hello ${applicantName},</p>
        <p>Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been updated.</p>
        <p><strong>New Status:</strong> ${status}</p>
        <br>
        <p>Best regards,<br>${companyName} Team</p>
      </div>
    `
  }),
  welcomeEmail: (userName, userEmail, role) => ({
    subject: `Welcome to Job Executive!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to Job Executive! 🎉</h2>
        <p>Hello ${userName},</p>
        <p>Your account has been successfully created as a <strong>${role}</strong>.</p>
        <p>You can now:</p>
        <ul>
          ${role === 'EMPLOYER'
        ? '<li>Post job listings</li><li>Manage applications</li><li>Find talented candidates</li>'
        : '<li>Search and apply for jobs</li><li>Track your applications</li><li>Build your profile</li>'
      }
        </ul>
        <p>If you have any questions, feel free to contact our support team.</p>
        <br>
        <p>Best regards,<br>Job Executive Team</p>
      </div>
    `
  }),

  emailVerification: (userName, verificationUrl) => ({
    subject: 'Verify Your Email - Job Executive',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Verify Your Email Address</h2>
        <p>Hello ${userName},</p>
        <p>Thank you for registering with Job Executive! To complete your registration, please verify your email address by clicking the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        
        <p><strong>This link will expire in 24 hours.</strong></p>
        
        <p>If you didn't create an account with Job Executive, please ignore this email.</p>
        
        <br>
        <p>Best regards,<br>Job Executive Team</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          If the button doesn't work, please ensure you're using a modern web browser and that the link is fully visible.
        </p>
      </div>
    `
  })
};

const sendEmail = async (to, subject, html) => {
  try {
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
      console.log('Email not configured. Would send to:', to, 'Subject:', subject);
      return { success: true, messageId: 'simulated' };
    }

    const mailOptions = {
      from: `"Job Executive" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};
module.exports = {
  transporter,
  emailTemplates,
  sendEmail
};
