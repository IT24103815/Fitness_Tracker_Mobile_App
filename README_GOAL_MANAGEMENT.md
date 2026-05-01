# FitTrack — Goal Management Only

This version contains only the working Goal Management flow for the WMT project.

## Included features

- Register/Login with JWT
- Protected routes
- Create Goal
- View Goal List
- View Goal Details
- Update Goal Progress
- Edit Goal
- Delete Goal
- Goal Dashboard
- Automatic progress percentage
- Motivation messages
- Badges: Starter, Strong Start, Halfway Hero, Almost There, Goal Crusher

## Backend run

```bash
cd backend
copy .env.example .env
npm install
npm run dev
```

Backend URL:

```txt
http://localhost:5000
```

## Mobile run

Before running mobile, open:

```txt
mobile/config/api.js
```

Make sure the IP is your laptop IPv4 address.

```js
export const API_URL = 'http://YOUR_LAPTOP_IP:5000/api';
```

Then run:

```bash
cd mobile
npm install
npm start
```

Use Expo Go QR scan.

## Goal API routes

```txt
POST    /api/goals
GET     /api/goals
GET     /api/goals/:id
PUT     /api/goals/:id
PATCH   /api/goals/:id/progress
DELETE  /api/goals/:id
GET     /api/goals/dashboard
```

Mobile compatibility routes are also available:

```txt
GET     /api/progress/dashboard
POST    /api/progress/goals
GET     /api/progress/goals
PUT     /api/progress/goals/:id
DELETE  /api/progress/goals/:id
```
