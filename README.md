# Sweety – Blood Glucose Tracker

A full-stack web application that helps users securely record, manage, and monitor their daily blood glucose readings.

## Features

### 1. Authentication
- User registration and login.
- Secure password hashing using bcrypt.
- JWT-based authentication.
- Protected API routes.
- Users can access only their own readings.

### 2. Glucose Reading Management
- Add glucose readings.
- View reading history.
- Edit existing readings.
- Delete readings.
- Four daily time slots:
  - Morning (fasting)
  - After breakfast
  - After lunch
  - After dinner

### 3. Validation
- Glucose values must be whole numbers between 40 and 600 mg/dL.
- Prevent duplicate time slots for the same user and date.
- Maximum four readings per day.
- Future dates are not allowed.
- Required-field validation.

### 4. Reports
- Daily report.
- Month-to-date report.
- Previous full-month report.
- Highest glucose value.
- Lowest glucose value.
- Average glucose value.
- Total reading count.
- Friendly empty states when no readings exist.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, JavaScript |
| UI | CSS, Lucide React |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Authentication | JWT |
| Password Security | bcrypt |
| API Communication | Axios |
| Development Tools | VS Code, Git, GitHub |

## Project Structure

```text
Sweety/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   └── readingsController.js
│   │
│   ├── middleware/
│   │   └── authMiddleware.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── readingsRoutes.js
│   │
│   ├── tests/
│   │
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   ├── schema.sql
│   ├── seed.js
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   │   ├── authContext.js
│   │   │   ├── AuthProvider.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── useAuth.js
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── Reports.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── index.html
│   ├── package.json
│   └── package-lock.json
│
├── README.md
└── .gitignore
```

## Prerequisites

Install the following before running the application:

- Node.js
- npm
- PostgreSQL
- Git
- Visual Studio Code (recommended)

## Installation and Setup

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd Sweety
```

### 2. Configure PostgreSQL

Create the database:

```sql
CREATE DATABASE sweety_db;
```

Connect to the database and execute the schema file from the project root:

```bash
psql -U postgres -h localhost -p 5433 -d sweety_db -f backend/schema.sql
```

This creates the required `users` and `readings` tables with validation constraints.

**Note:** Change the PostgreSQL port if your local installation uses a different port.

### 3. Configure the Backend

Open a terminal in the project root:

```bash
cd backend
npm install
```

Create a `.env` file using `.env.example`.

Configure your PostgreSQL credentials and JWT secret in `.env`.

Example configuration:

```dotenv
PORT=5000
DB_HOST=localhost
DB_PORT=5433
DB_NAME=sweety_db
DB_USER=postgres
DB_PASSWORD=your_postgresql_password
JWT_SECRET=your_long_random_secret
```

**Important:** Never upload your actual `.env` file or database password to GitHub.

### 4. Start the Backend

From the `backend` directory:

```bash
npm start
```

Backend runs at:

http://localhost:5000

### 5. Configure and Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

http://localhost:5173

## Demo Account

Use the following dummy account after running the seed script:

| Field | Value |
|---|---|
| Email | demo@sweety.com |
| Password | Demo@12345 |

To create the demo account and sample readings:

```bash
cd backend
npm run seed
```

The seed script creates a demo user and sample glucose readings.

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login user |

### Glucose Readings

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/readings` | Add a glucose reading |
| GET | `/api/readings` | Get authenticated user's readings |
| PUT | `/api/readings/:id` | Update a reading |
| DELETE | `/api/readings/:id` | Delete a reading |

### Reports

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/readings/reports/daily?date=YYYY-MM-DD` | Daily report |
| GET | `/api/readings/reports/month-to-date?date=YYYY-MM-DD` | Month-to-date report |
| GET | `/api/readings/reports/monthly` | Previous full-month report |

All reading and report endpoints require JWT authentication.

## Security

- Passwords are stored as bcrypt hashes.
- JWT authentication protects private APIs.
- Reading operations are scoped to the authenticated user.
- Environment variables are used for sensitive configuration.
- `.env` is excluded from Git.
- PostgreSQL constraints help enforce data integrity.

## Production Build

To create an optimized frontend production build:

```bash
cd frontend
npm run build
```

The generated production files are placed in the `frontend/dist` directory.

## Project Purpose

Sweety was developed as a full-stack development assignment to demonstrate:

- Frontend development using React.
- REST API development using Node.js and Express.
- User authentication and authorization.
- PostgreSQL database integration.
- CRUD operations.
- Input validation and data integrity.
- Reporting and summary calculations.
- Git and GitHub project management.

## Disclaimer

Sweety is intended for personal glucose tracking and informational purposes only. It is not a medical diagnostic tool and should not replace professional medical advice.