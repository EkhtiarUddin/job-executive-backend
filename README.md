# Job Executive - Backend API
A complete backend solution for a job portal application built with Node.js, Express, PostgreSQL, and Prisma. This application provides a robust API for connecting job seekers with employers.

## Features
User Authentication - JWT-based login/register with role-based access

Job Management - CRUD operations for job listings

Job Applications - Apply for jobs and track application status

User Profiles - Complete profile management with file upload

Admin Dashboard - Comprehensive admin panel with statistics

Advanced Search - Job search with filters, pagination, and sorting

Email Notifications - Application status updates (optional)

File Upload - Resume and avatar upload support

API Documentation - Complete Swagger/OpenAPI documentation

## Tech Stack
Runtime: Node.js

Framework: Express.js

Database: PostgreSQL

ORM: Prisma

Authentication: JWT + bcrypt

File Upload: Multer

Validation: Express-validator

Documentation: Swagger UI

Security: Helmet, CORS, Rate Limiting

Email: Nodemailer

## Prerequisites
Node.js (v18 or higher)

PostgreSQL (v12 or higher)

npm or yarn

## Quick Start
1. Clone and Install
bash
git clone <https://github.com/EkhtiarUddin/job-executive-backend.git>
cd job-executive-backend
npm install
2. Environment Setup
Create a .env file in the root directory:
copy everything from the .env.example file and paste in .env file


## API Documentation
Once the server is running, access the interactive API documentation at:
http://localhost:5000/api-docs

## User Roles
ADMIN - Full system access, user management, analytics

EMPLOYER - Post and manage jobs, view applications

SEEKER - Search and apply for jobs, track applications

## Authentication
All protected routes require a JWT token in the Authorization header:

### text
Authorization: Bearer <your-jwt-token>
Getting Started with API Testing:
Register or Login to get a JWT token

Click "Authorize" in Swagger UI

Enter your token: Bearer your-token-here

Test protected endpoints

Note: Swagger UI requires re-authorization after page refresh

## Testing Credentials
After seeding, use these test accounts:

### Admin User
Email: admin@jobexecutive.com

Password: admin123

Access: Full system access, user management

### Employer User
Email: tech@google.com

Password: employer123

Access: Post and manage jobs, view applications

### Job Seeker User
Email: john.doe@email.com

Password: seeker123

Access: Search and apply for jobs

## API Endpoints

### Authentication
POST /api/auth/register - Register new user

POST /api/auth/login - Login user

GET /api/auth/profile - Get user profile

PUT /api/auth/profile - Update user profile

### Jobs
GET /api/jobs - Get all jobs (public, with filters)

GET /api/jobs/:id - Get job by ID (public)

POST /api/jobs - Create job (Employer only)

PUT /api/jobs/:id - Update job (Job Owner only)

DELETE /api/jobs/:id - Delete job (Job Owner only)

GET /api/jobs/employer - Get employer's jobs

### Applications
POST /api/applications/job/:id/apply - Apply for job (Seeker only)

GET /api/applications/my-applications - Get user's applications

GET /api/applications/job/:id - Get job applications (Job Owner only)

PUT /api/applications/:id/status - Update application status (Job Owner only)

GET /api/applications/stats - Get application statistics

### Users
GET /api/users - Get all users (Admin only)

GET /api/users/:id - Get user by ID

PUT /api/users/:id - Update user

DELETE /api/users/:id - Delete user

POST /api/users/upload/avatar - Upload avatar

POST /api/users/upload/resume - Upload resume

### Admin
GET /api/admin/dashboard - Get dashboard statistics (Admin only)

GET /api/admin/jobs - Get all jobs (Admin view)

PATCH /api/admin/users/:id - Manage users (Admin only)

PATCH /api/admin/jobs/:id - Manage jobs (Admin only)

## Search & Filters
The jobs endpoint supports advanced filtering:

### bash
GET /api/jobs?search=developer&location=remote&type=FULL_TIME&page=1&limit=10
Available filters:

search - Search in title, description, company

location - Filter by location

type - Job type (FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, REMOTE, HYBRID)

category - Job category

experience - Experience level

page - Pagination page number

limit - Results per page (default: 10)

## Database Schema
### Main Models
users - User accounts with roles and profiles

jobs - Job listings with company details and requirements

applications - Job applications with status tracking

### Relationships
Users can have multiple Jobs (Employer role)

Users can have multiple Applications (Seeker role)

Jobs can have multiple Applications

Applications belong to both User and Job

## Deployment
Production Environment Variables
env
NODE_ENV=production
DATABASE_URL="your-production-database-url"
JWT_SECRET="strong-production-secret"
CLIENT_URL="your-frontend-domain"
Build and Start
bash
npm start

## Development Scripts
bash
npm run dev          # Start development server with nodemon
npm start           # Start production server
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run database migrations
npm run prisma:seed        # Seed database with sample data
npm run prisma:studio      # Open Prisma Studio for database management
  
## Security Features
JWT-based authentication with role-based access control

Password hashing with bcrypt

Input validation and sanitization

CORS protection

Helmet.js security headers

Rate limiting on authentication endpoints

SQL injection prevention with Prisma

File upload validation and size limits

## Contributing
Fork the repository

Create a feature branch: git checkout -b feature/amazing-feature

Commit your changes: git commit -m 'Add amazing feature'

Push to the branch: git push origin feature/amazing-feature

Open a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.
