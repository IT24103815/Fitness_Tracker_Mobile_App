# FitTrack - Meal & Nutrition Management

**Custom Meal Plan & Nutrition Management Application**  
Student: Egalla J.I | IT24101315

## Overview

FitTrack is a full-stack application for managing personalized meal plans and nutrition tracking. It consists of:
- **Backend**: Express.js REST API with MongoDB
- **Mobile**: React Native app (Expo) with multi-platform support (iOS, Android, Web)

## Tech Stack

### Backend
- Node.js + Express.js 5.2.1
- MongoDB 9.3.3
- JWT Authentication
- Cloudinary for image storage
- bcryptjs for password hashing

### Mobile (Frontend)
- React 19.1.0
- React Native 0.81.5
- Expo 54.0.33
- React Navigation 7.x
- Axios for API calls
- AsyncStorage for local persistence

## Project Structure

```
meal_nutrition_IT24101315/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Auth & Meal controllers
│   │   ├── models/          # MongoDB schemas (User, MealPlan)
│   │   ├── routes/          # API endpoints
│   │   ├── middleware/       # Auth, error handling
│   │   ├── utils/           # Helper functions
│   │   └── server.js        # Express app entry
│   ├── .env                 # Environment config
│   └── package.json
│
└── mobile/
    ├── screens/             # App screens (Login, CreateMealPlan, etc.)
    ├── contexts/            # AuthContext for state management
    ├── App.js               # Root navigation
    ├── app.json             # Expo config
    └── package.json
```

## Setup & Installation

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables (`.env` file already included):
```
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
NODE_ENV=development
```

4. Start development server:
```bash
npm run dev
```

Backend runs on `http://localhost:5000`

### Mobile Setup

1. Navigate to mobile directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

3. Start Expo development server:
```bash
npm start
```

4. Access via:
- **Web**: `http://localhost:8083`
- **Mobile**: Scan QR code with Expo Go app
- **Android**: Press `a` in terminal
- **iOS**: Press `i` in terminal

## Features

- **User Authentication**: Login/Register with JWT
- **Meal Planning**: Create custom meal plans with weekly templates
- **Food Management**: Add foods with calorie tracking
- **Goal Types**: Weight loss, muscle gain, maintenance
- **Admin Dashboard**: Admins can create meal templates for users
- **Image Upload**: Cloudinary integration for profile/food images
- **Cross-platform**: Web, iOS, and Android support

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PATCH /api/auth/profile` - Update profile

### Meal Plans
- `POST /api/meals/templates` - Create meal plan template
- `GET /api/meals/templates` - Get all templates
- `GET /api/meals/my` - Get user's meal plans
- `GET /api/meals/:id` - Get specific meal plan
- `PUT /api/meals/:id` - Update meal plan

## Running Both Services

To run the complete project:

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Mobile
cd mobile && npm start

# Then open http://localhost:8083 in browser
```

## Test Credentials

**Admin User**:
- Email: `admin@fittrack.com`
- Password: `admin123`

## Known Issues & Notes

- Web version uses `localhost:5000` for API calls
- Mobile app configured to work on local network (change IP in AuthContext if needed)
- Ensure both backend and mobile servers are running for full functionality

## Development

- Backend auto-reloads with nodemon on file changes
- Mobile hot-reloads via Expo
- Check browser console for web errors
- Check terminal output for backend logs

## Future Enhancements

- Nutrition analytics dashboard
- Meal prep scheduling
- Social sharing features
- Advanced filtering and search
- Push notifications

---

**Last Updated**: May 2026
