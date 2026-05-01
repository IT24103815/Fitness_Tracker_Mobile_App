# Goal Management Module – FitTrack

## Overview

The **Goal Management Module** is a core component of the FitTrack fitness tracking application. It empowers users to set, track, and manage fitness goals with real-time progress updates, motivation messages, and gamification features. Users can create measurable goals, monitor their progress toward targets, update metrics, and receive achievement badges based on their milestones.

## Features

- ✅ **Create Goals** – Define fitness goals with custom metrics, deadlines, and priorities
- 📊 **Track Progress** – View real-time progress percentage and visual progress bars
- ✏️ **Update Goals** – Modify goal details, progress values, and status
- 🗑️ **Delete Goals** – Remove completed or abandoned goals
- 🎖️ **Gamification** – Earn badges (Starter, Strong Start, Halfway Hero, Almost There, Goal Crusher)
- 💬 **Motivation Messages** – Receive personalized motivational feedback based on progress
- 📈 **Dashboard** – View aggregate stats: total goals, active goals, and completed goals
- 🔐 **Authentication** – Secure access via JWT-based authentication

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React Native (Expo) |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB |
| **Authentication** | JWT (JSON Web Tokens) |
| **HTTP Client** | Axios |
| **Styling** | React Native StyleSheet + Tailwind CSS (NativeWind) |

## Folder Structure

```
fittrack_goal_management/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js       # Login, register, profile
│   │   │   └── goalController.js       # Goal CRUD operations
│   │   ├── middleware/
│   │   │   └── authMiddleware.js       # JWT verification & authorization
│   │   ├── models/
│   │   │   ├── User.js                 # User schema
│   │   │   └── Goal.js                 # Goal schema
│   │   ├── routes/
│   │   │   ├── authRoutes.js           # /api/auth endpoints
│   │   │   ├── goalRoutes.js           # /api/goals endpoints
│   │   │   └── progressRoutes.js       # /api/progress endpoints
│   │   └── server.js                   # Express server entry point
│   ├── .env.example                    # Environment variables template
│   └── package.json                    # Backend dependencies
│
├── mobile/
│   ├── screens/
│   │   ├── LoginScreen.js              # User login
│   │   ├── RegisterScreen.js           # User registration
│   │   ├── ProfileScreen.js            # User profile
│   │   ├── GoalListScreen.js           # View all goals
│   │   ├── CreateGoalScreen.js         # Create new goal
│   │   ├── GoalDetailScreen.js         # View & update single goal
│   │   ├── EditGoalScreen.js           # Edit goal details
│   │   └── ProgressDashboardScreen.js  # View goal statistics
│   ├── contexts/
│   │   └── AuthContext.js              # Global auth state & token management
│   ├── config/
│   │   └── api.js                      # Backend API URL config
│   ├── App.js                          # Main app navigation
│   ├── index.js                        # Expo entry point
│   └── package.json                    # Mobile dependencies

```

## API Endpoints

All Goal Management endpoints require authentication (Bearer token in Authorization header).

### Goals API

| Method | Endpoint | Description |
|--------|----------|-------------|
| **GET** | `/api/progress/goals` | Fetch all goals for authenticated user |
| **POST** | `/api/progress/goals` | Create a new goal |
| **PUT** | `/api/progress/goals/:id` | Update goal details or progress |
| **DELETE** | `/api/progress/goals/:id` | Delete a goal |
| **GET** | `/api/progress/dashboard` | Fetch goal statistics & dashboard data |

### Request Example

```bash
curl -X GET http://localhost:5000/api/progress/goals \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json"
```

### Response Example

```json
{
  "success": true,
  "goals": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Lose 5kg",
      "type": "weight_loss",
      "startValue": 85,
      "currentValue": 82,
      "targetValue": 80,
      "targetUnit": "kg",
      "status": "active",
      "progress": 60,
      "priority": "high",
      "deadline": "2026-06-30",
      "description": "Achieve healthy weight goal",
      "client": "507f1f77bcf86cd799439010"
    }
  ]
}
```

## Setup Instructions

### Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (local or Atlas connection string)
- **Expo Go** (mobile testing)
- **npm** or **yarn**

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   copy .env.example .env
   ```
   Edit `.env` and set:
   ```
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/fittrack
   JWT_SECRET=your_secret_key_here
   ```

4. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

5. **Run backend server**
   ```bash
   npm run dev
   ```
   Expected output:
   ```
   ✅ MongoDB Connected Successfully
   🚀 Server running on http://localhost:5000
   ```

### Mobile Setup

1. **Navigate to mobile directory**
   ```bash
   cd mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Update API URL** in `config/api.js`
   ```javascript
   export const API_URL = 'http://YOUR_LAPTOP_IP:5000/api';
   ```
   Replace `YOUR_LAPTOP_IP` with your machine's IPv4 address (check with `ipconfig` on Windows or `ifconfig` on macOS/Linux).

4. **Start Expo**
   ```bash
   npm start
   ```

5. **Open in Expo Go**
   - Scan the QR code using Expo Go app on your phone
   - Ensure phone and laptop are on the same network

## How to Use

### 1. Authentication

- **Register:** Create a new account with email and password
- **Login:** Sign in with registered credentials
- **Auto-login:** Token is automatically saved and restored on app restart

### 2. Navigate to Goal Management

- After login, select **"My Goals"** or **"Goal List"** from the navigation menu

### 3. Create a Goal

1. Tap the **"+"** button
2. Fill in goal details:
   - Title (e.g., "Run 10km under 50 mins")
   - Category (weight_loss, muscle_gain, strength, endurance, consistency, flexibility)
   - Starting value & target value
   - Unit of measurement (kg, km, lbs, %)
   - Priority (low, medium, high)
   - Optional: notes and deadline
3. Tap **"Commit to Goal"**

### 4. View Goal Progress

1. Navigate to **"My Goals"** list
2. Tap any goal card to view details, including:
   - Progress bar and percentage
   - Start, current, and target values
   - Status badge (active, completed, paused, failed)
   - Deadline and motivation message

### 5. Update Progress

- On the goal detail screen, enter a new metric value
- Tap **"Save"** to update progress
- Progress bar and percentage update automatically

### 6. Edit Goal

- Open a goal detail screen
- Tap **"Edit Goal"**
- Modify any field and tap **"Update Goal"**

### 7. Delete Goal

- Open a goal detail screen
- Tap **"Delete"** and confirm

### 8. View Dashboard

- Tap **"Dashboard"** to see:
  - Total goals count
  - Active vs. completed goals
  - Your gamification level and XP
  - Goal summary with motivational badges

## Screens Overview

### Goal List Screen
Display all user goals in a scrollable list with:
- Goal title, type, and icon
- Progress bar and percentage
- Priority badge
- Status indicator
- Quick delete button

### Create Goal Screen
Form-based interface for creating new goals with input validation for:
- Unique title requirement
- Numeric value validation
- Logical target vs. start value checks
- Future deadline requirement

### Goal Detail Screen
Comprehensive view of a single goal with:
- Header with title, type, and status
- Info cards showing start/current/target values
- Progress bar and percentage
- Manual metric update form
- Edit and delete action buttons

### Dashboard Screen
High-level overview including:
- Character level and title (gamification)
- Summary cards: total goals, active, completed
- Goal list with brief details
- Link to manage goals

### Authentication Screens
- **Login Screen:** Email and password input
- **Register Screen:** Sign-up form with age validation
- **Profile Screen:** User information and preferences

## Security Features

- 🔒 **JWT Authentication** – All endpoints protected with token-based auth
- 🔐 **Password Hashing** – Bcrypt used for secure password storage
- 🚫 **Authorization Middleware** – Role-based access control (client, trainer, admin)
- ⏰ **Token Expiry** – JWT tokens expire after 30 days
- 📱 **AsyncStorage** – Secure local token persistence on mobile

## Testing the Full Flow

### Backend Test (cURL)

1. **Register User**
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
   ```

2. **Login & Get Token**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"john@example.com","password":"password123"}'
   ```

3. **Fetch Goals** (replace TOKEN with actual JWT)
   ```bash
   curl -X GET http://localhost:5000/api/progress/goals \
     -H "Authorization: Bearer TOKEN"
   ```

### Mobile Test

1. Clear Expo Go cache
2. Register a new account in the app
3. Navigate to **"My Goals"**
4. Create a goal and verify it appears in the list
5. Update goal progress and check the progress bar updates
6. Delete a goal and verify it's removed
7. Check the dashboard for updated statistics

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Not authorized, token failed" | Ensure backend `.env` has `JWT_SECRET` set or uses fallback. Re-login in mobile app. |
| "Failed to load goals" | Check that mobile `API_URL` matches your laptop IP. Verify backend is running. |
| Mobile can't connect to backend | Ensure phone and laptop are on same Wi-Fi network. Update `API_URL` in `mobile/config/api.js`. |
| MongoDB connection error | Start MongoDB service or update `MONGO_URI` to a valid Atlas URI. |

## Future Enhancements

- 📱 Push notifications for goal reminders
- 📸 Progress photo uploads and gallery
- 🤝 Social sharing and leaderboards
- 📊 Advanced analytics and insights
- 🎯 Goal templates and recommendations
- 🔔 Customizable notification schedules

## Author

**Student ID:** IT24103815  
**Name:** [Fernando W.P.S.]  
**Course:** WMT (Web and Mobile Technologies)  
**Institution:** Sri Lanka Institute of Information Technology (SLIIT)  


---

## License

This project is part of an academic assignment. All rights reserved.

---

**Last Updated:** May 2, 2026
