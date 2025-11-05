// scripts/seed.js
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await prisma.application.deleteMany();
    await prisma.job.deleteMany();
    await prisma.user.deleteMany();

    console.log('✅ Existing data cleared');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.create({
      data: {
        email: 'admin@jobexecutive.com',
        password: adminPassword,
        name: 'System Administrator',
        role: 'ADMIN',
        bio: 'System administrator for Job Executive platform',
        location: 'New York, USA'
      }
    });

    // Create employer users
    const employer1Password = await bcrypt.hash('employer123', 12);
    const employer1 = await prisma.user.create({
      data: {
        email: 'tech@google.com',
        password: employer1Password,
        name: 'Google HR',
        role: 'EMPLOYER',
        bio: 'Hiring manager at Google',
        company: 'Google',
        location: 'Mountain View, CA',
        phone: '+1-555-0101'
      }
    });

    const employer2Password = await bcrypt.hash('employer123', 12);
    const employer2 = await prisma.user.create({
      data: {
        email: 'careers@microsoft.com',
        password: employer2Password,
        name: 'Microsoft Recruiter',
        role: 'EMPLOYER',
        bio: 'Talent acquisition specialist at Microsoft',
        company: 'Microsoft',
        location: 'Redmond, WA',
        phone: '+1-555-0102'
      }
    });

    // Create job seeker users
    const seeker1Password = await bcrypt.hash('seeker123', 12);
    const seeker1 = await prisma.user.create({
      data: {
        email: 'john.doe@email.com',
        password: seeker1Password,
        name: 'John Doe',
        role: 'SEEKER',
        bio: 'Full-stack developer with 5 years of experience in React and Node.js',
        location: 'San Francisco, CA',
        phone: '+1-555-0103'
      }
    });

    const seeker2Password = await bcrypt.hash('seeker123', 12);
    const seeker2 = await prisma.user.create({
      data: {
        email: 'sarah.smith@email.com',
        password: seeker2Password,
        name: 'Sarah Smith',
        role: 'SEEKER',
        bio: 'Frontend developer specializing in modern JavaScript frameworks',
        location: 'Austin, TX',
        phone: '+1-555-0104'
      }
    });

    console.log('✅ Users created');

    // Create sample jobs
    const jobs = await prisma.job.createMany({
      data: [
        {
          title: 'Senior Full Stack Developer',
          description: 'We are looking for an experienced Full Stack Developer to join our dynamic team. You will be responsible for developing and maintaining web applications using modern technologies.',
          company: 'Google',
          salary: '$120,000 - $150,000',
          location: 'Mountain View, CA',
          type: 'FULL_TIME',
          category: 'Software Development',
          experience: '5+ years',
          requirements: '5+ years of experience with React, Node.js, and PostgreSQL. Strong understanding of REST APIs and microservices architecture.',
          benefits: 'Health insurance, stock options, flexible work hours, remote work options',
          employerId: employer1.id
        },
        {
          title: 'Frontend React Developer',
          description: 'Join our frontend team to build amazing user experiences using React, TypeScript, and modern CSS. Work on cutting-edge projects with a talented team.',
          company: 'Microsoft',
          salary: '$90,000 - $120,000',
          location: 'Redmond, WA',
          type: 'FULL_TIME',
          category: 'Frontend Development',
          experience: '3+ years',
          requirements: '3+ years of React experience, proficiency in TypeScript, knowledge of state management solutions',
          benefits: 'Competitive salary, comprehensive benefits, career growth opportunities',
          employerId: employer2.id
        },
        {
          title: 'Backend Node.js Engineer',
          description: 'Looking for a backend engineer to develop scalable APIs and services. Experience with cloud platforms and database design required.',
          company: 'Google',
          salary: '$110,000 - $140,000',
          location: 'Remote',
          type: 'REMOTE',
          category: 'Backend Development',
          experience: '4+ years',
          requirements: 'Strong Node.js skills, experience with PostgreSQL/MongoDB, knowledge of Docker and AWS',
          benefits: 'Remote work, flexible schedule, learning budget, health benefits',
          employerId: employer1.id
        },
        {
          title: 'DevOps Engineer',
          description: 'Seeking a DevOps engineer to improve our CI/CD pipelines and infrastructure. Help us scale our systems and ensure high availability.',
          company: 'Microsoft',
          salary: '$100,000 - $130,000',
          location: 'Seattle, WA',
          type: 'HYBRID',
          category: 'DevOps',
          experience: '4+ years',
          requirements: 'Experience with AWS/GCP, Kubernetes, Docker, CI/CD tools, and infrastructure as code',
          benefits: 'Hybrid work model, stock options, professional development',
          employerId: employer2.id
        },
        {
          title: 'Junior Software Developer',
          description: 'Great opportunity for a junior developer to grow their skills. Mentorship provided and opportunities for rapid advancement.',
          company: 'Google',
          salary: '$70,000 - $90,000',
          location: 'New York, NY',
          type: 'FULL_TIME',
          category: 'Software Development',
          experience: '0-2 years',
          requirements: 'Computer Science degree or equivalent, knowledge of JavaScript, willingness to learn',
          benefits: 'Training program, mentorship, career path planning',
          employerId: employer1.id
        }
      ]
    });

    console.log('✅ Jobs created');

    // Create sample applications
    const createdJobs = await prisma.job.findMany();
    
    await prisma.application.createMany({
      data: [
        {
          jobId: createdJobs[0].id,
          seekerId: seeker1.id,
          coverLetter: 'I am excited to apply for the Senior Full Stack Developer position. With my 5 years of experience in React and Node.js, I believe I would be a great fit for your team.',
          status: 'APPLIED'
        },
        {
          jobId: createdJobs[1].id,
          seekerId: seeker1.id,
          coverLetter: 'As an experienced React developer, I am very interested in the Frontend Developer position at Microsoft.',
          status: 'SHORTLISTED'
        },
        {
          jobId: createdJobs[0].id,
          seekerId: seeker2.id,
          coverLetter: 'I am writing to express my interest in the Senior Full Stack Developer role. My background in modern web technologies aligns perfectly with your requirements.',
          status: 'REVIEWED'
        },
        {
          jobId: createdJobs[2].id,
          seekerId: seeker2.id,
          coverLetter: 'The Backend Node.js Engineer position matches my skills and career goals perfectly.',
          status: 'APPLIED'
        }
      ]
    });

    console.log('✅ Applications created');

    console.log(`
🎉 Database seeding completed successfully!

📋 Sample Data Created:
- 1 Admin user (admin@jobexecutive.com / admin123)
- 2 Employer users
- 2 Job Seeker users
- 5 Job listings
- 4 Job applications

🔑 Default Login Credentials:
Admin: admin@jobexecutive.com / admin123
Employer: tech@google.com / employer123
Job Seeker: john.doe@email.com / seeker123

🚀 You can now start the application and test the features.
    `);

  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

// Run seeding if this script is executed directly
if (require.main === module) {
  seedData();
}

module.exports = seedData;
