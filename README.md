<img width="1326" height="667" alt="Screenshot 2026-11-15 110908" src="https://github.com/user-attachments/assets/1716bbc2-3632-484a-ae4c-ea24a3f0314d" /><img width="1326" height="667" alt="Screenshot 2026-11-15 110908" src="https://github.com/user-attachments/assets/564637b8-d4e0-4698-8f86-d8cf618e6a50" /># Sweety – Blood Glucose Tracker

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

## Application Screenshots

### 🔐 User Login

Secure login page allowing registered users to access their personal blood glucose dashboard using their email and password.

![Sweety Login](https://github.com/user-attachments/assets/2bb1e066-6a0d-4e71-a605-7f10fef20877)

### Registration
![Sweety Registration](https://github.com/user-attachments/assets/ed623928-724e-4d01-a8c3-86217abb3feb)
## 📊 Dashboard Overview

The Sweety Dashboard provides a clear and user-friendly overview of blood glucose readings. It displays key health statistics, including total readings, average glucose level, highest and lowest readings, and a visual breakdown of readings across all four daily time slots.

![Sweety Dashboard Overview](https://github.com/user-attachments/assets/f680ee0e-d38f-44a9-b0ba-7684405c0d34)
### 🩸 Blood Glucose Readings

![Sweety Readings](https://github.com/user-attachments/assets/40332ebe-5d35-4946-8304-c47c392153ef)


### Reports

![Sweety Daily Report](https://github.com/user-attachments/assets/7cafe76a-5475-4de5-97a3-9cff97bddb64)

![Sweety Monthly Report](https://github.com/user-attachments/assets/fecb90b7-74c5-453e-8438-68ec5f57f234)

## 🗄️ Database Design

Sweety uses PostgreSQL to securely store user accounts and blood glucose readings. The database contains related tables connected through primary and foreign keys.

### Database Tables

![Database Screenshot 1](https://github.com/user-attachments/assets/45924a6d-e592-41fe-8370-e6b90dbc5cd4)

![Database Screenshot 2](https://github.com/user-attachments/assets/9bad5a3b-ec53-4666-82cc-e6affcc8b2cd)

### Database Queries and Relationships

![Database Screenshot 3](https://github.com/user-attachments/assets/ffb25d8d-def7-4353-a8a1-ae0c6e37e4ee)

![Database Screenshot 4](https://github.com/user-attachments/assets/a55d307d-11ce-4650-afe6-7dd574926590)

![Database Screenshot 5](https://github.com/user-attachments/assets/7d280c83-d369-46cf-bc77-32f2ac030625)


## Disclaimer

Sweety is intended for personal glucose tracking and informational purposes only. It is not a medical diagnostic tool and should not replace professional medical advice.
