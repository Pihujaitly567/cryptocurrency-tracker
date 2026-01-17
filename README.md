hell# 🪙 CripTik - Cryptocurrency Tracker

A full-stack cryptocurrency tracking application with real-time prices, portfolio management, and favorites synchronization.

## 📁 Project Structure

```
cryptocurrency-tracker/
├── frontend/          # React + Vite frontend application
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/           # Express.js backend API
│   ├── config/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── package.json
├── package.json       # Root package with convenient scripts
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 14.x
- MongoDB (local or Atlas)

### Installation

1. **Install all dependencies:**
```bash
npm run install:all
```

2. **Configure backend environment:**
```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

3. **Start MongoDB:**
```bash
# macOS
brew services start mongodb-community
```

4. **Run the application:**
```bash
# From project root
npm run dev
```

This starts:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## 📝 Available Scripts

**From project root:**
- `npm run dev` - Start both frontend and backend
- `npm run dev:frontend` - Start frontend only
- `npm run dev:backend` - Start backend only
- `npm run install:all` - Install dependencies for both
- `npm run build:frontend` - Build frontend for production

**Frontend specific (cd frontend/):**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

**Backend specific (cd backend/):**
- `npm run dev` - Start with auto-reload
- `npm start` - Start in production mode

## ✨ Features

- 🔐 **User Authentication** - JWT-based secure login/registration
- 💼 **Portfolio Management** - Track your crypto holdings
- ⭐ **Favorites** - Save your favorite cryptocurrencies
- 📊 **Live Prices** - Real-time market data from CoinGecko
- 📈 **Charts** - 7-day price history visualization
- 💱 **Converter** - Convert between different cryptocurrencies
- 📰 **News** - Auto-generated market insights
- 🌍 **Multi-Currency** - USD/INR support

## 🛠️ Tech Stack

**Frontend:**
- React 19
- Vite 7
- TailwindCSS 4
- Recharts
- Axios

**Backend:**
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcrypt

## 📚 Documentation

- [Frontend README](./frontend/README.md) - Coming soon
- [Backend README](./backend/README.md) - API documentation
- [Setup Guide](./SETUP.md) - Detailed setup instructions

## 🔒 Security

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting (100 req/15min)
- CORS protection
- MongoDB injection prevention

## 🐛 Troubleshooting

**MongoDB Connection Error:**
```bash
# Check if MongoDB is running
brew services list | grep mongodb
brew services start mongodb-community
```

**Port Already in Use:**
```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill
```

## 📄 License

MIT

## 👤 Author

Built with ❤️ for crypto enthusiasts
