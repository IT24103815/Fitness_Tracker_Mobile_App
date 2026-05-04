# Goal Management Module – FitTrack

## Overview

The **Goal Management Module** is a core component of the FitTrack fitness tracking application. It allows authenticated users to set, track, update, and manage personal fitness goals.

Users can create measurable goals using starting values, current values, target values, units, priorities, deadlines, and status. The mobile app displays progress visually using progress bars and percentage calculations. The module is also connected with the Progress Dashboard, where users can view goal-related summary data, recent progress records, XP, level, title, fitness stats, BMI, and current weight.

This module is implemented using **React Native (Expo)** for the mobile frontend, **Node.js + Express.js** for the backend, and **MongoDB** with **Mongoose** for data storage.

---

## Features

- ✅ **Create Goals** – Define fitness goals with type, values, unit, priority, deadline, and description
- 📋 **View Goals** – Fetch and display all goals belonging to the authenticated user
- 📊 **Track Progress** – View progress percentage and visual progress bars
- ✏️ **Update Goals** – Modify goal details, current progress values, priority, and status
- 🗑️ **Delete Goals** – Remove unwanted or completed goals with confirmation
- 🎯 **Status Management** – Manage goals as active, completed, paused, or failed
- 📈 **Dashboard Integration** – View goals with user progress, XP, level, title, and recent progress records
- 🔐 **Authentication** – Secure access using JWT-based authentication
- 🧾 **Progress Records** – Add daily progress records linked to users and optionally linked to goals

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React Native (Expo) |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB |
| **ODM** | Mongoose |
| **Authentication** | JWT (JSON Web Tokens) |
| **Password Security** | bcryptjs |
| **HTTP Client** | Axios |
| **Local Storage** | AsyncStorage |
| **Styling** | React Native StyleSheet |

---

## Folder Structure

```text
fittrack_goal_management/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js              # Register, login, user profile logic
│   │   │   └── progressController.js          # Goal CRUD, dashboard, progress record logic
│   │   ├── middleware/
│   │   │   └── authMiddleware.js              # JWT verification and role authorization
│   │   ├── models/
│   │   │   ├── User.js                        # User schema and authentication-related fields
│   │   │   ├── Goal.js                        # Goal schema
│   │   │   └── ProgressRecord.js              # Daily progress record schema
│   │   ├── routes/
│   │   │   ├── authRoutes.js                  # /api/auth endpoints
│   │   │   └── progressRoutes.js              # /api/progress endpoints
│   │   └── server.js                          # Express server entry point and route registration
│   ├── .env                                   # Environment variables
│   └── package.json                           # Backend dependencies
│
├── mobile/
│   ├── screens/
│   │   ├── LoginScreen.js                     # User login
│   │   ├── RegisterScreen.js                  # User registration
│   │   ├── ProfileScreen.js                   # User profile
│   │   ├── GoalListScreen.js                  # View all goals
│   │   ├── CreateGoalScreen.js                # Create new goal
│   │   ├── GoalDetailScreen.js                # View and update single goal
│   │   ├── EditGoalScreen.js                  # Edit goal details
│   │   ├── ProgressDashboardScreen.js         # View goal and progress dashboard
│   │   └── ProgressTrackerScreen.js           # View recent progress records
│   ├── contexts/
│   │   └── AuthContext.js                     # Global auth state and token handling
│   ├── config.js                              # Backend API URL configuration
│   ├── App.js                                 # Main navigation setup
│   ├── index.js                               # Expo entry point
│   └── package.json                           # Mobile dependencies
```

---

## Backend Files Explained

| File | Purpose |
|------|---------|
| `backend/src/models/Goal.js` | Defines the MongoDB schema for goals |
| `backend/src/models/ProgressRecord.js` | Stores daily progress records connected to users and optionally goals |
| `backend/src/controllers/progressController.js` | Contains goal create, read, update, delete, dashboard, and progress record logic |
| `backend/src/routes/progressRoutes.js` | Defines `/api/progress` API endpoints |
| `backend/src/middleware/authMiddleware.js` | Protects routes using JWT and handles role authorization |
| `backend/src/server.js` | Registers `/api/progress` route with the Express app |

---

## Mobile Files Explained

| File | Purpose |
|------|---------|
| `mobile/screens/GoalListScreen.js` | Displays all goals of the logged-in user |
| `mobile/screens/CreateGoalScreen.js` | Provides form to create a new goal |
| `mobile/screens/GoalDetailScreen.js` | Shows full goal details and allows current value update |
| `mobile/screens/EditGoalScreen.js` | Allows editing of goal details and status |
| `mobile/screens/ProgressDashboardScreen.js` | Shows dashboard data including goals, XP, level, and stats |
| `mobile/screens/ProgressTrackerScreen.js` | Displays recent progress records |
| `mobile/contexts/AuthContext.js` | Stores user/token and manages authenticated API requests |
| `mobile/config.js` | Builds the backend API URL |
| `mobile/App.js` | Registers navigation screens |

---

## Database Models

### Goal Model

File:

```text
backend/src/models/Goal.js
```

The **Goal** model stores all personal fitness goal details.

| Field | Type | Description |
|-------|------|-------------|
| `title` | String | Name/title of the goal |
| `type` | String | Goal category |
| `targetValue` | Number | Final target value |
| `startValue` | Number | Starting value |
| `currentValue` | Number | Current progress value |
| `targetUnit` | String | Unit such as kg, km, reps, minutes |
| `priority` | String | Goal priority: low, medium, high |
| `status` | String | Goal status: active, completed, failed, paused |
| `description` | String | Optional description or note |
| `deadline` | Date | Optional target completion date |
| `client` | ObjectId | User who owns the goal |
| `createdBy` | ObjectId | User who created the goal |

### Goal Type Values

```text
weight_loss
muscle_gain
strength
endurance
consistency
flexibility
```

### Goal Priority Values

```text
low
medium
high
```

### Goal Status Values

```text
active
completed
failed
paused
```

### Important Points

- `title`, `type`, `targetValue`, `targetUnit`, `client`, and `createdBy` are required.
- `startValue` defaults to `0`.
- `currentValue` defaults to `0`.
- `priority` defaults to `medium`.
- `status` defaults to `active`.
- `client` connects the goal to the user who owns it.
- `createdBy` stores who created the goal.
- `timestamps: true` automatically adds `createdAt` and `updatedAt`.

---

### ProgressRecord Model

File:

```text
backend/src/models/ProgressRecord.js
```

The **ProgressRecord** model stores daily progress records.

| Field | Type | Description |
|-------|------|-------------|
| `client` | ObjectId | User who owns the progress record |
| `date` | Date | Date of the progress record |
| `workoutCompleted` | Boolean | Whether workout was completed |
| `activities` | Array | Daily activity summaries |
| `mealsAdhered` | Number | Meal adherence percentage |
| `weight` | Number | User weight |
| `bodyFat` | Number | Body fat percentage |
| `goal` | ObjectId | Optional reference to a goal |
| `xpGained` | Number | XP gained for the day |
| `notes` | String | Optional notes |

Important index:

```js
progressRecordSchema.index({ client: 1, date: 1 }, { unique: true });
```

This prevents the same user from creating more than one progress record for the same date.

---

## API Endpoints

All Goal Management endpoints require authentication using a Bearer token in the Authorization header.

### Goal Management API

| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/api/progress/goals` | Create a new goal |
| **GET** | `/api/progress/goals` | Fetch all goals for authenticated user |
| **PUT** | `/api/progress/goals/:id` | Update a specific goal |
| **DELETE** | `/api/progress/goals/:id` | Delete a specific goal |
| **GET** | `/api/progress/dashboard` | Fetch dashboard data for logged-in user |
| **GET** | `/api/progress/dashboard/:clientId` | Fetch dashboard data for a client as admin/trainer |
| **POST** | `/api/progress/records` | Add a new daily progress record |

---

## Request Example

### Fetch Goals

```bash
curl -X GET http://localhost:5000/api/progress/goals \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json"
```

### Create Goal

```bash
curl -X POST http://localhost:5000/api/progress/goals \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Lose 5kg",
    "type": "weight_loss",
    "startValue": 85,
    "currentValue": 82,
    "targetValue": 80,
    "targetUnit": "kg",
    "priority": "high",
    "status": "active",
    "deadline": "2026-06-30",
    "description": "Achieve healthy weight goal"
  }'
```

---

## Response Example

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
      "priority": "high",
      "deadline": "2026-06-30",
      "description": "Achieve healthy weight goal",
      "client": "507f1f77bcf86cd799439010",
      "createdBy": "507f1f77bcf86cd799439010"
    }
  ]
}
```

---

## Main Backend Logic

### Create Goal

Controller function:

```text
createGoal
```

Main logic:

```js
const goal = await Goal.create({
    ...req.body,
    client: req.body.client || req.user._id,
    createdBy: req.user._id
});
```

Explanation:

- `req.body` contains goal data from the mobile form.
- `client` stores the user who owns the goal.
- `createdBy` stores the user who created it.
- `req.user._id` comes from the JWT middleware.

---

### Get User Goals

Controller function:

```text
getUserGoals
```

Main logic:

```js
const goals = await Goal.find({ client: req.user._id });
```

Explanation:

- Gets only the goals belonging to the logged-in user.
- Prevents users from seeing other users’ goals.

---

### Update Goal

Controller function:

```text
updateGoal
```

Main logic:

```js
const goal = await Goal.findById(req.params.id);

if (!goal) {
    return res.status(404).json({ success: false, message: 'Goal not found' });
}

if (req.user.role === 'client' && goal.client.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Access denied' });
}

Object.assign(goal, req.body);
await goal.save();
```

Explanation:

- Finds goal by ID from URL.
- Checks if goal exists.
- Checks whether the logged-in client owns the goal.
- Updates the goal using request body data.
- Saves the updated goal to MongoDB.

---

### Delete Goal

Controller function:

```text
deleteGoal
```

Main logic:

```js
const goal = await Goal.findById(req.params.id);

if (!goal) {
    return res.status(404).json({ success: false, message: 'Goal not found' });
}

if (req.user.role === 'client' && goal.client.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Access denied' });
}

await goal.deleteOne();
```

Explanation:

- Finds the goal by ID.
- Checks if the goal exists.
- Checks ownership.
- Deletes the goal from MongoDB.

---

## Route Protection

File:

```text
backend/src/routes/progressRoutes.js
```

Goal routes:

```js
router.post('/goals', protect, createGoal);
router.get('/goals', protect, getUserGoals);
router.put('/goals/:id', protect, updateGoal);
router.delete('/goals/:id', protect, deleteGoal);
```

Dashboard routes:

```js
router.get('/dashboard', protect, getDashboard);
router.get('/dashboard/:clientId', protect, authorize('admin', 'trainer'), getDashboard);
```

Progress record route:

```js
router.post('/records', protect, addProgressRecord);
```

---

## Authentication Flow

1. User registers or logs in.
2. Backend checks credentials.
3. Backend creates a JWT token.
4. Mobile app stores the token.
5. Mobile app sends token with protected API requests.
6. Backend middleware verifies the token.
7. Middleware attaches logged-in user to `req.user`.
8. Controller uses `req.user._id` to find user-specific goals.

Header format:

```text
Authorization: Bearer <JWT_TOKEN>
```

---

## Progress Calculation

Progress is calculated in the mobile app using:

```text
progress = ((currentValue - startValue) / (targetValue - startValue)) × 100
```

Example:

```text
Start value = 80 kg
Current value = 75 kg
Target value = 70 kg

Range = 70 - 80 = -10
Achieved = 75 - 80 = -5

Progress = (-5 / -10) × 100
Progress = 50%
```

The progress value is limited between `0` and `100`.

---

## Setup Instructions

### Prerequisites

- **Node.js**
- **MongoDB** or MongoDB Atlas
- **Expo Go**
- **npm**
- **Android/iOS device or emulator**

---

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

Create or update `.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/fittrack
JWT_SECRET=your_secret_key_here
```

4. **Run backend server**

```bash
npm run dev
```

Expected output:

```text
MongoDB Connected Successfully
FitTrack Backend is running!
Local: http://localhost:5000
```

---

### Mobile Setup

1. **Navigate to mobile directory**

```bash
cd mobile
```

2. **Install dependencies**

```bash
npm install
```

3. **Start Expo**

```bash
npx expo start
```

or:

```bash
npm start
```

4. **Open in Expo Go**

- Scan the QR code using Expo Go.
- Ensure the phone and laptop are on the same network.
- Make sure backend is running.

---

## How to Use

### 1. Authentication

- Register a new account or log in with existing credentials.
- JWT token is stored and used for protected API calls.

### 2. Navigate to Goal Management

- After login, open the Goal List screen.
- The app fetches goals from `/api/progress/goals`.

### 3. Create a Goal

1. Tap the **plus (+)** button.
2. Fill in:
   - Title
   - Goal type
   - Starting value
   - Current value
   - Target value
   - Unit
   - Priority
   - Deadline
   - Description
3. Tap **Commit to Goal** or save button.
4. The goal is saved in MongoDB and appears in the goal list.

### 4. View Goal Progress

Open a goal from the list to view:

- Goal title
- Goal type
- Start value
- Current value
- Target value
- Unit
- Status
- Priority
- Deadline
- Progress bar
- Progress percentage

### 5. Update Progress

- Open the goal detail screen.
- Enter a new current value.
- Tap save/update.
- The backend updates the goal.
- The progress bar updates automatically.

### 6. Edit Goal

- Open the goal detail screen.
- Tap edit.
- Modify fields such as title, type, values, unit, priority, status, deadline, or description.
- Save changes.

### 7. Delete Goal

- Open a goal.
- Tap delete.
- Confirm deletion.
- The goal is removed from MongoDB.

### 8. View Dashboard

Open Progress Dashboard to view:

- User name
- XP
- Level
- Title
- Fitness stats
- BMI
- Current weight
- Goals
- Recent progress records

---

## Screens Overview

### Goal List Screen

Displays all user goals in a scrollable list with:

- Goal title
- Goal type
- Progress bar
- Progress percentage
- Priority badge
- Status indicator
- Deadline
- Delete option

---

### Create Goal Screen

Form-based screen for creating new goals with validation for:

- Required title
- Required target value
- Required unit
- Numeric values
- Future deadline

---

### Goal Detail Screen

Detailed view of a selected goal with:

- Header with title, type, and status
- Start value
- Current value
- Target value
- Progress bar
- Progress percentage
- Current metric update form
- Edit button
- Delete button

---

### Edit Goal Screen

Used to modify existing goal details:

- Title
- Type
- Start value
- Current value
- Target value
- Unit
- Priority
- Status
- Description
- Deadline

---

### Progress Dashboard Screen

Shows high-level user progress:

- User level
- XP
- Title
- Stats
- BMI
- Current weight
- Goals
- Recent progress records

---

### Progress Tracker Screen

Displays recent progress records:

- Date
- Workout completion
- XP gained
- Meal adherence
- Activities
- Notes

---

### Authentication Screens

- **Login Screen** – User email and password input
- **Register Screen** – New user registration
- **Profile Screen** – User profile information

---

## Security Features

- 🔒 **JWT Authentication** – All goal endpoints are protected
- 🔐 **Password Hashing** – bcryptjs is used before storing passwords
- 🚫 **Authorization Middleware** – Prevents users from accessing other users’ goals
- 👤 **User Ownership Check** – Goal update/delete checks `client` against `req.user._id`
- 📱 **Token Storage** – Mobile app stores token and sends it with Axios requests

---

## Testing the Full Flow

### Backend Test Using cURL

1. **Register User**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

2. **Login and Get Token**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

3. **Fetch Goals**

```bash
curl -X GET http://localhost:5000/api/progress/goals \
  -H "Authorization: Bearer TOKEN"
```

4. **Create Goal**

```bash
curl -X POST http://localhost:5000/api/progress/goals \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Run 10km",
    "type": "endurance",
    "startValue": 2,
    "currentValue": 5,
    "targetValue": 10,
    "targetUnit": "km",
    "priority": "high",
    "status": "active"
  }'
```

---

### Mobile Test

1. Start backend.
2. Start Expo mobile app.
3. Register or login.
4. Navigate to Goal List.
5. Create a goal.
6. Verify it appears in the list.
7. Open Goal Detail.
8. Update current value.
9. Check progress bar update.
10. Edit goal status or priority.
11. Delete the goal.
12. Check dashboard update.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `Not authorized, no token` | Login again and check token is sent in Authorization header |
| `Not authorized, token failed` | Check `JWT_SECRET` and login again |
| `Failed to load goals` | Check backend is running and API URL is correct |
| `Access denied` | The logged-in user does not own that goal |
| `Goal not found` | Goal ID may be wrong or deleted |
| Mobile cannot connect to backend | Ensure phone and laptop are on same Wi-Fi |
| MongoDB connection error | Check `MONGO_URI` and MongoDB/Atlas connection |
| Progress bar not updating | Check current value is sent correctly in PUT request |
| Dashboard not loading | Check `/api/progress/dashboard` endpoint and token |

---

## Current Implementation Notes

- Goal routes are under `/api/progress/goals`, not `/api/goals`.
- Goal logic is inside `progressController.js`, not a separate `goalController.js`.
- The current Goal model does not use a separate milestones array.
- Milestone-style tracking is handled using start value, current value, target value, deadline, status, and progress percentage.
- The current Goal Management module does not include file upload.
- File upload is mainly handled in other modules such as exercise images or meal proof uploads.
- Goal badges are not directly awarded inside the goal controller.
- Dashboard returns user gamification data such as XP, level, title, stats, and badges from the User model.

---

## Future Enhancements

- 📱 Push notifications for goal reminders
- 📸 Progress photo uploads for goal proof
- 🎯 Separate milestone subdocuments inside goals
- 📊 Advanced charts for goal progress history
- 🔔 Deadline reminder notifications
- 🧠 Goal recommendations for beginners
- 🏆 Automatic status update when goal reaches 100%
- 🤝 Social sharing and challenge integration

---

## Author

**Student ID:** IT24103815  
**Name:** Fernando W.P.S  
**Component:** Goal Management  
**Course:** SE2020 – Web and Mobile Technologies  
**Institution:** Sri Lanka Institute of Information Technology (SLIIT)

---

## License

This project is part of an academic assignment. All rights reserved.

---

**Last Updated:** May 2026


**Last Updated:** May 2, 2026
