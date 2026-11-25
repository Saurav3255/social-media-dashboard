# MERN Social Media Dashboard

A ready-to-run social media management and analytics dashboard built with MongoDB, Express, React and Node.js.

## Features
- JWT authentication
- Dashboard analytics
- Social platform overview
- Create, edit and delete posts
- Likes, comments and shares
- Post status: draft, scheduled, published
- Engagement analytics
- Notifications
- User profile
- Responsive dashboard UI

## Run

### 1. Backend
```bash
cd server
npm install
cp .env.example .env
npm run dev
```

### 2. Frontend
Open another terminal:
```bash
cd client
npm install
npm run dev
```

Configure MongoDB and JWT_SECRET in `server/.env`.
