# 🏋️ FitTrack

A full-stack fitness tracking app — React Native (Expo) mobile front-end + Node.js / Express / MongoDB backend.

---

## ✅ Prerequisites

Make sure these are installed on your machine before you start:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 18 or later | https://nodejs.org |
| MongoDB Community | 6 or later | https://www.mongodb.com/try/download/community |
| Expo CLI | latest | `npm install -g expo-cli` |
| Expo Go app | latest | Install on your phone from the App Store / Play Store |

---

## 🚀 Quick Start (for every teammate)

### 1 — Clone the repo

```bash
git clone <your-repo-url>
cd fittrack
```

---

### 2 — Set up the Backend

```bash
cd backend

# Install dependencies
npm install

# Create your local environment file
copy .env.example .env        # Windows
# cp .env.example .env        # macOS / Linux
```

Open `backend/.env` and fill in your values.  
For **local development** the defaults are usually fine:

```env
MONGO_URI=mongodb://127.0.0.1:27017/fittrack
JWT_SECRET=any_long_random_string_you_choose
PORT=5000
NODE_ENV=development
```

> Cloudinary keys are only needed for profile picture uploads.  
> Leave them blank if you don't need that feature locally.

Start the backend:

```bash
npm start
# or: node src/server.js
```

You should see output like:

```
✅ MongoDB Connected Successfully
✅ Admin user ready: admin@fittrack.com

🚀 FitTrack Backend is running!
   Local:   http://localhost:5000
   Network: http://192.168.x.x:5000  ← teammates connect here
```

> **Important:** Keep this terminal open while you use the app.

---

### 3 — Allow port 5000 through your firewall (Windows only)

> This is required so phones and other team devices can reach your backend.

Run **PowerShell as Administrator** and execute:

```powershell
.\open_firewall.ps1
```

Or manually:

```powershell
netsh advfirewall firewall add rule name="FitTrack Backend" dir=in action=allow protocol=TCP localport=5000
```

---

### 4 — Set up the Mobile App

```bash
cd mobile

# Install dependencies
npm install
```

---

### 5 — Run the Mobile App

```bash
npx expo start
```

A QR code will appear in the terminal.

- **On your phone:** Open **Expo Go** and scan the QR code.
- **On an emulator:** Press `a` (Android) or `i` (iOS).

> ⚡ **No IP configuration needed.** The app automatically detects the backend's IP from Expo. The only rule: **the backend must be running on the same machine that ran `npx expo start`.**

---

## 🔑 Admin Credentials

The admin account is created automatically on first backend start:

| Field | Value |
|-------|-------|
| Email | `admin@fittrack.com` |
| Password | `Admin@123` |

---

## 🗂 Project Structure

```
fittrack/
├── backend/
│   ├── .env.example       ← copy to .env and fill in your values
│   ├── src/
│   │   ├── server.js
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── models/
│   │   └── middleware/
│   └── package.json
│
└── mobile/
    ├── config.js          ← auto-detects backend IP, no manual changes needed
    ├── App.js
    ├── screens/
    ├── contexts/
    └── package.json
```

---

## 🛠 Troubleshooting

### ❌ "Network request failed" on the phone

1. Make sure your phone and the backend machine are on the **same Wi-Fi network**.
2. Check that the backend is actually running (`npm start` in `/backend`).
3. On Windows, run `open_firewall.ps1` as Administrator (see Step 3 above).
4. Check the console log in Expo for the `API_URL` line — confirm the IP looks correct.

### ❌ "MongoDB connection error"

- Make sure MongoDB is running:
  - **Windows:** Run `net start MongoDB` in PowerShell, or start it from Services.
  - **macOS:** `brew services start mongodb-community`
- Confirm `MONGO_URI` in your `.env` is `mongodb://127.0.0.1:27017/fittrack`.

### ❌ Expo QR code scans but app shows blank screen

- Stop the Expo server (`Ctrl+C`) and run `npx expo start --clear`.

### ❌ Cannot log in as admin

- Make sure the backend has been started at least once (it seeds the admin on startup).
- Credentials: `admin@fittrack.com` / `Admin@123`

---

## 📝 Notes for teammates

- **Never commit your `.env` file.** It is already in `.gitignore`.
- Each developer runs their own local backend + MongoDB. There is no shared dev server.
- The `API_URL` in `mobile/config.js` is fully automatic — do **not** hardcode an IP there.
