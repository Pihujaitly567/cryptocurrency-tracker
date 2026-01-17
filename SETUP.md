# 🚀 CripTik - Setup Guide

## Quick Setup (3 Steps)

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Configure Backend
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/criptik
JWT_SECRET=your_secret_key_here
```

### 3. Start Everything
```bash
cd ..  # Back to root
npm run dev
```

✅ Open http://localhost:5173 in your browser!

## Detailed Setup

### Prerequisites

**Install MongoDB:**

macOS:
```bash
brew install mongodb-community
brew services start mongodb-community
```

Windows: Download from https://www.mongodb.com/try/download/community

Linux:
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

### First Time Setup

1. **Clone/Navigate to project:**
```bash
cd /Users/pihu.jaitly2024rishihood.edu.in/cryptocurrency-tracker
```

2. **Install all dependencies:**
```bash
npm run install:all
```

3. **Setup backend environment:**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and update:
- `MONGO_URI` - Your MongoDB connection string
- `JWT_SECRET` - Random secret string for JWT tokens

4. **Go back to root and start:**
```bash
cd ..
npm run dev
```

## Running the Application

**Option 1: Both together (Recommended)**
```bash
npm run dev
```

**Option 2: Separate terminals**

Terminal 1 (Backend):
```bash
npm run dev:backend
```

Terminal 2 (Frontend):
```bash
npm run dev:frontend
```

## First Time Usage

1. Open http://localhost:5173
2. Click "Register" 
3. Create your account
4. Start tracking crypto!

## Troubleshooting

### MongoDB Issues

```bash
# Check if running
brew services list | grep mongodb

# Start MongoDB
brew services start mongodb-community

# Check logs
tail -f /usr/local/var/log/mongodb/mongo.log
```

### Port Conflicts

```bash
# Backend (port 5000)
lsof -ti:5000 | xargs kill

# Frontend (port 5173)
lsof -ti:5173 | xargs kill
```

### Node Modules Issues

```bash
# Clean install
cd frontend && rm -rf node_modules package-lock.json && npm install
cd ../backend && rm -rf node_modules package-lock.json && npm install
```

## MongoDB Atlas (Cloud Option)

Don't want to install MongoDB locally?

1. Create free account: https://www.mongodb.com/cloud/atlas
2. Create cluster
3. Get connection string
4. Update `backend/.env`:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/criptik
```

## Project Structure

```
cryptocurrency-tracker/
├── frontend/              # React frontend
│   ├── src/
│   │   ├── App.jsx
│   │   ├── login.jsx
│   │   └── api/client.js
│   └── package.json
├── backend/               # Express backend
│   ├── server.js
│   ├── routes/
│   ├── models/
│   └── package.json
└── package.json          # Root scripts
```

## Available Scripts

**Root directory:**
- `npm run dev` - Start both
- `npm run dev:frontend` - Frontend only
- `npm run dev:backend` - Backend only
- `npm run install:all` - Install all dependencies

## Need Help?

Check:
- [Backend README](./backend/README.md) for API docs
- [Walkthrough](./walkthrough.md) for architecture details

Happy tracking! 🚀
