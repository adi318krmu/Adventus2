# ADVENTUS Tuition Management System

A comprehensive full-stack MERN application designed to streamline tuition center operations by digitizing student management, fee tracking, payment processing, and administrative workflows.

## Tech Stack

- Frontend: React.js, Vite, Tailwind CSS, Axios, React Router, Context API
- Backend: Node.js, Express.js, Nodemailer (Gmail SMTP)
- Database: MongoDB Atlas with Mongoose
- Authentication: JWT, bcrypt password hashing, and secure Email OTP verification
- Uploads: Multer local uploads for payment screenshots; MongoDB data URLs for profile photos
- Notifications: React Hot Toast
- Payment: UPI QR/transaction ID and cash approval workflow

## Features

- Student signup and login
- Admin login and admin account creation
- Unique tuition IDs for students and admins
- Student/admin profile photo upload
- Session-based login storage
- Auto fee calculation for classes 4 to 10
- Student dashboard with profile, fee amount, fee status, and payment history
- UPI payment saves instantly as paid after transaction ID submission
- Cash payment is submitted as pending and needs admin approval
- Admin dashboard cards for students, paid students, pending payments, rejected payments, and total collection
- Student add/edit/delete/search/filter
- Month-wise payment records
- Accept/reject cash payments
- CSV export
- Day/night mode

## Folder Structure

```text
ADventus/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── models/
│   │   ├── Admin.js
│   │   ├── OTP.js
│   │   ├── Payment.js
│   │   └── Student.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   ├── services/
│   │   └── emailService.js
│   │   ├── paymentRoutes.js
│   │   └── studentRoutes.js
│   ├── uploads/
│   ├── .env.example
│   ├── idUtils.js
│   ├── package.json
│   ├── seedAdmin.js
│   ├── server.js
│   └── utils.js
├── frontend/
│   ├── public/
│   │   ├── adventus-logo.png
│   │   └── sbi-upi-qr.jpeg
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── .gitignore
├── package.json
└── README.md
```

## Local Setup

Install dependencies:

```bash
npm install
npm run install:all
```

Create environment files from the examples:

```bash
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

Backend `.env`:

```env
PORT=5000
MONGO_URI=your-mongodb-atlas-uri
JWT_SECRET=your-long-random-secret
CLIENT_URL=http://localhost:5173
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
UPI_ID=9355659492@ybl
QR_IMAGE_URL=/sbi-upi-qr.jpeg

# Nodemailer (Gmail App Password config)
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASS=your-16-char-gmail-app-password
```

### Gmail App Password Generation Guide

To allow Nodemailer to securely send OTP emails using your Google Account, you need to generate a **Gmail App Password**. Follow these steps:

1. **Go to Google Account Settings**: Open [Google Account Settings](https://myaccount.google.com/).
2. **Enable 2-Step Verification**:
   - Select **Security** from the left navigation panel.
   - Under *How you sign in to Google*, click on **2-Step Verification** and complete the setup if it's not already enabled.
3. **Generate App Password**:
   - Search for **App passwords** in the search bar at the top, or navigate to *Security* > *2-Step Verification* > *App passwords* (at the very bottom).
   - Enter a name for the app (e.g., "Adventus").
   - Click **Create**.
4. **Copy the App Password**:
   - Google will display a 16-character password (e.g., `abcd efgh ijkl mnop`).
   - Copy this password and paste it as the `EMAIL_PASS` environment variable in your `backend/.env` file. *Do not include spaces in your .env value (e.g., `EMAIL_PASS=abcdefghijklmnop`).*

Frontend `.env`:

```env
VITE_API_URL=/api
VITE_BACKEND_URL=http://localhost:5000
VITE_UPI_ID=9355659492@ybl
VITE_QR_IMAGE_URL=/sbi-upi-qr.jpeg
```

Seed the first admin:

```bash
npm run seed:admin --prefix backend
```

Run frontend and backend together:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

Default seeded admin:

```text
username: admin
password: admin123
```

## Payment Rules

- UPI:
  - Student must enter transaction ID.
  - Screenshot upload is optional.
  - Payment is saved immediately as `Accepted`.
  - Student fee status becomes `Paid`.

- Cash:
  - No transaction ID required.
  - No file upload required.
  - Payment is saved as `Pending`.
  - Admin must accept or reject it.

## Class Fee Table

```text
Class 4  -> ₹400
Class 5  -> ₹500
Class 6  -> ₹600
Class 7  -> ₹700
Class 8  -> ₹800
Class 9  -> ₹900
Class 10 -> ₹1000
```

The frontend and backend use the same class list. Admin dashboard stats also sync pending/accepted payment records with the current class fee before calculating total collection.

## Main API Routes

```text
POST   /api/signup
POST   /api/login
POST   /api/admin/signup
GET    /api/student/profile
PUT    /api/student/profile
POST   /api/payment
GET    /api/payment/history
GET    /api/admin/stats
GET    /api/admin/students
POST   /api/admin/students
PUT    /api/admin/students/:id
DELETE /api/student/:id
GET    /api/admin/payments
PUT    /api/admin/approve
PUT    /api/admin/reject
GET    /api/admin/export/fees.csv

# OTP & Verification Routes
POST   /api/auth/send-registration-otp
POST   /api/auth/verify-registration-otp
POST   /api/auth/resend-registration-otp
POST   /api/auth/send-email-verification
POST   /api/auth/verify-email
POST   /api/auth/resend-email-verification
```

## Deploy Backend On Render

1. Push the project to GitHub.
2. Go to Render and create a new Web Service.
3. Connect your GitHub repository.
4. Set:

```text
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: npm start
```

5. Add environment variables in Render:

```env
PORT=5000
MONGO_URI=your-mongodb-atlas-uri
JWT_SECRET=your-long-random-secret
CLIENT_URL=https://your-vercel-frontend-url.vercel.app
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
UPI_ID=9355659492@ybl
QR_IMAGE_URL=/sbi-upi-qr.jpeg
```

6. Deploy the service.
7. Copy the Render backend URL, for example:

```text
https://adventus-api.onrender.com
```

## Deploy Frontend On Vercel

1. Go to Vercel and import the same GitHub repository.
2. Set:

```text
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
```

3. Add environment variables in Vercel:

```env
VITE_API_URL=https://your-render-backend-url.onrender.com/api
VITE_BACKEND_URL=https://your-render-backend-url.onrender.com
VITE_UPI_ID=9355659492@ybl
VITE_QR_IMAGE_URL=/sbi-upi-qr.jpeg
```

4. Deploy the frontend.
5. After Vercel gives you a URL, copy it and update Render `CLIENT_URL` with that Vercel URL.
6. Redeploy the Render backend once after changing `CLIENT_URL`.

`frontend/vercel.json` is included to fix Vercel refresh errors on React Router pages. Without this rewrite, refreshing `/login`, `/student/dashboard`, `/admin/dashboard`, or other frontend routes can show `404: NOT_FOUND`.

## MongoDB Atlas Notes

In MongoDB Atlas:

- Add your current IP address in Network Access for local development.
- For deployment, allow Render to connect. For simple student projects, you can use `0.0.0.0/0`, but a restricted IP is safer.
- Keep the database username/password private.

## Important Deployment Note About Uploads

This project uses local Multer uploads in `backend/uploads` for payment screenshots.

Profile photos are stored in MongoDB as data URLs, so they keep showing after Render sleeps, restarts, or redeploys.

On Render free hosting, uploaded payment screenshots may disappear after redeploys or restarts because the filesystem is not permanent. For production, use Cloudinary or another storage service for screenshots.

## Useful Commands

```bash
npm run dev
npm run build
npm run seed:admin --prefix backend
npm run dev --prefix backend
npm run dev --prefix frontend
```

## Security Checklist

- Change `JWT_SECRET`.
- Change the default admin password.
- Do not commit real `.env` files.
- Rotate any MongoDB password that was shared publicly.
- Protect public admin signup before production, for example with an invite code.
