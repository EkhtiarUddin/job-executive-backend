const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('Creating admin user');

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@jobexecutive.com',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });

    console.log('Admin user created successfully!');
    console.log('Email:', admin.email);
    console.log('Password: admin123');
    console.log('\nIMPORTANT: Please change the admin password after first login!');

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error creating admin:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

createAdmin();
