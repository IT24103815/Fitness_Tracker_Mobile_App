# FitTrack - Fitness Challenges Management

This repository contains the isolated **Fitness Challenges Management** module from the original FitTrack application. All other components have been removed to focus entirely on Challenge Creation, Tracking, and Management.

## Project Structure

This project is divided into two main parts:

### 1. Backend (`/backend`)
A Node.js/Express backend that provides the RESTful API for managing users, authentication, and fitness challenges.
- **Node.js & Express**: API framework
- **MongoDB**: Database for storing users and challenges
- **Mongoose**: Object Data Modeling (ODM) library
- **JWT**: JSON Web Tokens for authentication

### 2. Mobile (`/mobile`)
A React Native (Expo) mobile application providing the user interface for interacting with the challenges.
- **React Native & Expo**: Cross-platform mobile framework
- **React Navigation**: For screen routing
- **Tailwind CSS (Nativewind)**: For styling components

## Prerequisites

- Node.js (v18+ recommended)
- MongoDB instance (local or Atlas)
- Expo CLI (`npm install -g expo-cli`)

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Copy `.env.example` to `.env` and update your `MONGO_URI` and `JWT_SECRET`.
4. Start the server:
   ```bash
   npm run dev
   ```

### Mobile Setup

1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Expo development server:
   ```bash
   npx expo start
   ```

## Key Features
- **User Authentication**: Login, register, and profile management.
- **Challenge Explorer**: Browse available public challenges.
- **Challenge Builder**: Create and edit custom fitness challenges.
- **Weekly Tracking**: Track progress on your active weekly challenges.
