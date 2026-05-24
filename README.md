# ADVENTUS Tuition Management System

A full-stack MERN tuition management web app for managing students, monthly fees, UPI/cash payments, admin approvals, profile photos, tuition IDs, and CSV fee exports.

## Tech Stack

- Frontend: React.js, Vite, Tailwind CSS, Axios, React Router, Context API
- Backend: Node.js, Express.js
- Database: MongoDB Atlas with Mongoose
- Authentication: JWT and bcrypt password hashing
- Uploads: Multer local uploads
- Notifications: React Hot Toast
- Payment: UPI QR/transaction ID and cash approval workflow

## Features

- Student signup and login
- Admin login and admin account creation
- Unique tuition IDs for students and admins
- Student/admin profile photo upload
- Auto fee calculation by class
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
│   │   ├── Payment.js
│   │   └── Student.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
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
```

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

## MongoDB Atlas Notes

In MongoDB Atlas:

- Add your current IP address in Network Access for local development.
- For deployment, allow Render to connect. For simple student projects, you can use `0.0.0.0/0`, but a restricted IP is safer.
- Keep the database username/password private.

## Important Deployment Note About Uploads

This project uses local Multer uploads in `backend/uploads`.

On Render free hosting, uploaded files may disappear after redeploys or restarts because the filesystem is not permanent. For production, use Cloudinary or another storage service for profile photos and screenshots.

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
