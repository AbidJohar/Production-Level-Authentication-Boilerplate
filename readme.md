# Production-Ready Node.js Auth Boilerplate

A high-performance, scalable authentication system built with **Node.js**, **Express**, and **Redis**. This architecture is specifically engineered to handle high-traffic loads (50k+ users) by utilizing distributed rate limiting and smart caching.

---

## Key Features

* **Scalable Architecture:** Built for horizontal scaling using a Singleton Redis client.
* **🚦 Rate Limiting:** Global and Strict (OTP/Auth) rate limiting using `rate-limit-redis`.
* **Smart Caching:** Profile endpoints cached with Redis (Cache-Aside pattern).
* **Security:** JWT-based authentication, password hashing, and CORS protection.
* **Logging:** Structured logging for monitoring system health and Redis status.

---

## Prerequisites

Before you begin, ensure you have the following installed:

* **[Node.js](https://nodejs.org/)** (v18+ recommended)
* **[Redis](https://redis.io/)** (Running locally or via Docker)
* **[MongoDB](https://www.mongodb.com/)** (Or your preferred database)

---

## Project Structure

```
├── client/                     # Frontend application
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page-level components
│   │   ├── context/            # Auth context & providers
│   ├── .env.example
│   └── package.json
│
├── server/                     # Backend application
│   ├── src/
│   │   ├── config/             # DB, Redis, and app config
│   │   ├── controllers/        # Route controllers
│   │   ├── middleware/         # Auth, rate-limit, error middleware
│   │   ├── models/             # Mongoose/DB models
│   │   ├── routes/             # Express route definitions
│   │   ├── validators/         # For validation of payloads
│   │   └── utils/              # email templates,redisClient,nodemailer, logger, etc.
│   ├── .env.example
│   ├── server.js               # App entry point
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Getting Started

Follow these steps exactly to avoid dependency conflicts:

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2. Set Up the Server

```bash
cd server
npm install
```

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

### 3. Set Up the Client

```bash
cd ../client
npm install
```

Copy the example environment file:

```bash
cp .env.example .env
```

---

## Environment Variables

### Server (`server/.env`)

```env
# App
PORT=5000
NODE_ENV=development

# MongoDB
PORT=3000
MONGO_URI=mongodb://localhost:27017/Auth
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN="24h"

NODE_ENV ='development'

#use your's credientails

SMTP_USER= 
SMTP_PASS= 
SMTP_HOST= 
SMTP_PORT= 
SENDER_EMAIL= 
```

### Client (`client/.env`)

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

### Start the Server

```bash
cd server
npm run dev
```

### Start the Client

Open a new terminal:

```bash
cd client
npm run dev
```

The client will be available at `http://localhost:5173` and the API at `http://localhost:3000`.

---

## API Endpoints

### Auth Routes — `/api/auth`

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| `POST` | `/register` | Register a new user | Global |
| `POST` | `/login` | Login and receive JWT | Strict |
| `GET` | `/logout` | Invalidate session | Global |
| `POST` | `/forgot-password` | Send OTP to email | Strict |
| `POST` | `/verify-otp` | Verify OTP code | Strict |
| `POST` | `/reset-password` | Reset password with OTP | Strict |
| `POST` | `/resent-otp` | Reset password with OTP | Strict |

### User Routes — `/api/user` *(Protected)*

| Method | Endpoint | Description | Cache |
|--------|----------|-------------|-------|
| `GET` | `/profile` | Get current user profile | ✅ Redis (5 min) |

---

## Architecture Overview

### Redis Rate Limiting Strategy

Two tiers of rate limiting protect the API:

**Global Limiter** — applied to all routes:
- 100 requests per 15 minutes per IP

**Strict Limiter** — applied to sensitive auth routes (login, OTP, password reset):
- 10 requests per 15 minutes per IP
- Prevents brute-force and OTP abuse attacks

### Redis Caching Strategy (Cache-Aside)

```
Request → Check Redis Cache
             │
     ┌───────┴────────┐
   HIT ✅           MISS ❌
     │                │
  Return Cache     Query DB
                      │
                 Store in Redis
                      │
                 Return Response
```

Profile data is cached for **5 minutes** with automatic invalidation on update.

### Singleton Redis Client

A single Redis client instance is shared across the entire application — rate limiters, cache layers, and session management all reuse the same connection pool to maximize efficiency.

---

## Security Highlights

* **Passwords** are hashed using `bcryptjs` with a salt round of 12.
* **JWTs** are short-lived access tokens paired with refresh token rotation.
* **OTPs** are time-limited, stored in Redis, and invalidated after a single use.
* **CORS** is configured to only allow requests from the specified client origin.
* **HTTP headers** are hardened using `helmet`.

---



## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js v18+ |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Cache / Rate Limit | Redis  |
| Auth | JWT + bcryptjs |
| Rate Limiting | `express-rate-limit` + `rate-limit-redis` |
| Logging | pino |
| Frontend | React + Vite |

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  Built with ❤️ for developers who care about performance and security.
</div>