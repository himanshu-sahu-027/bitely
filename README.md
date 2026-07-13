# Bitely

Bitely is a food ordering platform organized as a monorepo.For now, it includes a Node.js/Express backend and a customer-facing frontend. The backend is designed with modularity and scalability in mind, so that in the future it can be extended to support a vendor-facing frontend and an admin panel.

## Project Structure

- `backend` - Express API with MongoDB, Redis, JWT auth, OTP delivery, cart, kitchen, order, and user routes
- `user-frontend` - Customer-facing React + Vite application

## Tech Stack

- Backend: Node.js, Express, MongoDB, Redis, JWT, Nodemailer, Google OAuth, Razorpay
- Frontend: React 19, Vite, ESLint

## Prerequisites

- Node.js 18+
- npm
- MongoDB
- Redis

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/himanshu-sahu-027/bitely.git
cd bitely
```

### 2. Configure the backend environment

Copy `backend/.env.example` to `backend/.env` and fill in your values.

### 3. Install dependencies

Install dependencies inside each app:

```bash
cd backend && npm install
cd ../user-frontend && npm install
```

## Running the Apps

Start each service in its own terminal:

```bash
cd backend && npm run dev
cd user-frontend && npm run dev
```

## Available Scripts

### Backend

- `npm run dev` - Start the backend with nodemon
- `npm start` - Start the backend in production mode

### Frontends

- `npm run dev` - Start the Vite dev server
- `npm run build` - Create a production build
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint

## Backend Environment Variables

Required:

- `MONGO_URI`
- `JWT_SECRET`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `GOOGLE_CLIENT_ID`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_SECRET`

Optional:

- `PORT`
- `REDIS_HOST`
- `REDIS_PORT`
- `RAZORPAY_WEBHOOK_SECRET`

## API Base

The backend starts on port `5000` by default and exposes routes under:

- `/api/auth`
- `/api/user`
- `/api/kitchen`
- `/api/orders`
- `/api/cart`

## Notes

- Keep `node_modules`, build artifacts, and local `.env` files out of version control.
- Package lockfiles are included so installs stay consistent.
