# CripTik Backend

Backend API for the CripTik Cryptocurrency Tracker application.

## Features

- 🔐 **JWT Authentication** - Secure user registration and login
- 💼 **Portfolio Management** - Persistent cryptocurrency portfolio storage
- ⭐ **Favorites System** - Save and sync favorite cryptocurrencies
- 🔄 **API Proxy** - Cache CoinGecko API responses to reduce rate limits
- 🚀 **RESTful API** - Clean, organized API endpoints

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Caching**: In-memory cache with TTL

## Prerequisites

- Node.js >= 14.x
- MongoDB (local or MongoDB Atlas)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and update the values:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/criptik
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

### 3. Start MongoDB

If using local MongoDB:

```bash
# macOS (using Homebrew)
brew services start mongodb-community

# Or run manually
mongod --dbpath ~/data/db
```

### 4. Run the Server

**Development mode** (with auto-reload):

```bash
npm run dev
```

**Production mode**:

```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login and receive JWT token
- `GET /api/auth/me` - Get current user info (protected)

### Portfolio

- `GET /api/portfolio` - Get user's portfolio (protected)
- `POST /api/portfolio` - Add crypto to portfolio (protected)
- `PUT /api/portfolio/:id` - Update portfolio item (protected)
- `DELETE /api/portfolio/:id` - Remove from portfolio (protected)

### Favorites

- `GET /api/favorites` - Get user's favorites (protected)
- `POST /api/favorites` - Add to favorites (protected)
- `DELETE /api/favorites/:cryptoId` - Remove from favorites (protected)

### Crypto Data (Proxy)

- `GET /api/crypto/markets` - Get crypto market data (cached, 5 min TTL)
- `GET /api/crypto/chart/:coinId` - Get chart data for specific coin (cached, 5 min TTL)

### Utility

- `GET /health` - Health check
- `GET /` - API documentation

## Project Structure

```
server/
├── config/
│   └── db.js               # Database connection
├── models/
│   ├── User.js             # User schema
│   ├── Portfolio.js        # Portfolio schema
│   └── Favorite.js         # Favorites schema
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── portfolio.js        # Portfolio routes
│   ├── favorites.js        # Favorites routes
│   └── crypto.js           # CoinGecko proxy routes
├── middleware/
│   └── auth.js             # JWT verification middleware
├── utils/
│   └── cache.js            # Caching utility
├── .env                    # Environment variables (not in git)
├── .env.example            # Example environment file
├── package.json            # Dependencies
└── server.js               # Main server file
```

## Authentication Flow

1. User registers with name, email, and password
2. Password is hashed using bcrypt before storing
3. On login, user receives a JWT token
4. Token must be included in `Authorization: Bearer <token>` header for protected routes
5. Token expires after 7 days (configurable)

## Caching

The API proxy caches CoinGecko responses for 5 minutes to:
- Reduce external API calls
- Improve response times
- Prevent rate limiting

Cache can be cleared via `DELETE /api/crypto/cache`

## Rate Limiting

API is rate limited to **100 requests per 15 minutes** per IP address to prevent abuse.

## Error Handling

All errors return JSON with appropriate HTTP status codes:

```json
{
  "message": "Error description"
}
```

## Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ CORS enabled for specified origins
- ✅ Rate limiting
- ✅ Input validation
- ✅ MongoDB injection prevention (via Mongoose)

## Development

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in `.env`

### Testing API

Use tools like:
- **Postman** - https://www.postman.com/
- **Thunder Client** (VS Code extension)
- **cURL** - Command line

Example cURL request:

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Get  portfolio (replace TOKEN with actual JWT)
curl http://localhost:5000/api/portfolio \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## MongoDB Atlas Setup (Cloud)

If you prefer cloud MongoDB:

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string
4. Update `MONGO_URI` in `.env`:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/criptik?retryWrites=true&w=majority
```

## Troubleshooting

### MongoDB Connection Error

- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network connectivity

### JWT Token Invalid

- Check if token has expired
- Verify `JWT_SECRET` matches between sessions
- Ensure token is properly formatted in header

### CORS Error

- Update `CLIENT_URL` in `.env` to match frontend URL
- Check CORS configuration in `server.js`

## License

MIT
