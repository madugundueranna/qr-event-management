# QREventix - Setup & Installation Guide

## 🚀 Quick Start

### Prerequisites
- **Node.js** v16+ with npm
- **MongoDB** (local or MongoDB Atlas cloud)
- **Git** (for version control)

---

## 📦 Installation

### Step 1: Clone & Setup Project

```bash
# Navigate to project root
cd e:\Nandu_Reactive\real-estate-app

# Install root dependencies (if any)
npm install

# Install Backend dependencies
cd Backend
npm install

# Return to root
cd ..

# Install Frontend dependencies
npm install
```

---

## ⚙️ Configuration

### Backend Configuration (.env)

Create or verify `Backend/.env` file exists with:

```env
# Server
DATABASE=mongodb://127.0.0.1:27017/eventDB
PORT=1998
SECRET_KEY=e3$%2aD4fG1!9zP8qASsT6uY5vX@0wZ#
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
WEB_URL=http://localhost:5173
BASE_URL=http://localhost:1998
```

**To get Google OAuth credentials:**
1. Visit [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add `http://localhost:1998/auth/google/callback` as authorized redirect URI
6. Copy Client ID and Secret to .env

### Frontend Configuration (.env)

Verify `Frontend/.env` exists with:

```env
VITE_API_URL=http://localhost:1998
```

---

## 🌱 Database Seeding

Create initial test data:

```bash
# From Backend directory
cd Backend
npm run seed

# Or manually:
node seed.js
```

**Test Credentials:**
- **Admin**: admin@qreventix.com / password123
- **Organizer**: organizer@qreventix.com / password123
- **Attendee**: attendee@qreventix.com / password123

---

## 🏃 Running the Application

### Terminal 1: Backend Server

```bash
cd Backend
npm run dev

# Or for production:
npm start
```

Expected output:
```
✅ Mongoose connected to MongoDB
Server started at port 1998
```

### Terminal 2: Frontend Development Server

```bash
npm run dev
```

Expected output:
```
VITE v8.0.12  ready in 123 ms
➜  Local:   http://localhost:5173/
```

---

## 🧪 Testing the Application

### 1. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:1998

### 2. Test Authentication
```bash
# Login API Test
curl -X POST http://localhost:1998/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "attendee@qreventix.com",
    "password": "password123"
  }'
```

### 3. Test User Flows

#### Attendee Flow
1. Login with `attendee@qreventix.com`
2. Browse events on Home page
3. Click event → Book ticket
4. View booked tickets in dashboard

#### Organizer Flow
1. Login with `organizer@qreventix.com`
2. Go to Organizer Dashboard
3. Create new event
4. View event tickets
5. Use QR Scanner to check in attendees

#### Admin Flow
1. Login with `admin@qreventix.com`
2. Admin Console → Manage Events
3. Approve/Reject pending events
4. View all users
5. Manage user status

---

## 🛠️ Build for Production

### Frontend Build

```bash
# Create optimized production build
npm run build

# Preview production build
npm run preview
```

Output directory: `dist/`

### Backend Production

```bash
# Ensure all environment variables are set correctly
# Update DATABASE URL to production MongoDB Atlas
# Update SECRET_KEY with strong, random value

# Start server
NODE_ENV=production npm start
```

---

## 📁 Project Structure

```
real-estate-app/
├── Backend/
│   ├── .env                          # Environment variables
│   ├── seed.js                       # Database seed script
│   ├── Server.js                     # Express app entry
│   ├── Models/
│   │   ├── Authentication/
│   │   ├── Events/
│   │   └── Tickets/
│   ├── Controllers/
│   │   ├── Authentication/
│   │   ├── Events/
│   │   └── Tickets/
│   ├── Routes/
│   │   ├── Authentication/
│   │   ├── Events/
│   │   └── Tickets/
│   ├── Common/
│   │   ├── Middleware/
│   │   ├── Constants.js
│   │   ├── Validators.js
│   │   └── Responses.js
│   └── Config/
│       └── DBConnect.js
├── src/
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminProperties.jsx
│   │   │   ├── AdminReports.jsx
│   │   │   └── AdminUsers.jsx
│   │   ├── public/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Properties.jsx
│   │   │   ├── PropertyDetails.jsx
│   │   │   └── CustomerDashboard.jsx
│   │   └── seller/
│   │       ├── SellerDashboard.jsx
│   │       └── AddProperty.jsx
│   ├── components/
│   │   ├── common/
│   │   ├── layout/
│   │   ├── charts/
│   │   ├── event/
│   │   └── property/
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── AppContext.jsx
│   │   └── PropertyContext.jsx
│   ├── api/
│   │   ├── axiosInstance.js
│   │   ├── authApi.js
│   │   ├── eventApi.js
│   │   ├── ticketApi.js
│   │   └── userApi.js
│   ├── routes/
│   │   ├── AppRoutes.jsx
│   │   └── ProtectedRoute.jsx
│   ├── utils/
│   │   ├── constants.js
│   │   ├── formatters.js
│   │   └── helpers.js
│   ├── App.jsx
│   └── main.jsx
├── .env                              # Frontend env
├── vite.config.js
├── tailwind.config.js
├── eslint.config.js
├── postcss.config.js
└── package.json
```

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: Database Connection Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Ensure MongoDB is running
```bash
# Windows: Start MongoDB service
net start MongoDB

# Mac: Start MongoDB
brew services start mongodb-community

# Or use MongoDB Atlas (cloud)
# Update DATABASE URL in .env with your Atlas connection string
```

### Port Already in Use
```
Error: EADDRINUSE: address already in use :::1998
```
**Solution**: Change PORT in Backend/.env or kill process on port 1998
```bash
# Kill process on Windows
netstat -ano | findstr :1998
taskkill /PID <PID> /F

# Or change port
# Backend/.env: PORT=3001
```

### CORS Errors
```
Error: Access to XMLHttpRequest blocked by CORS policy
```
**Solution**: Verify CORS configuration in Backend/Server.js
```javascript
app.use(cors({
  origin: "http://localhost:5173",  // Should match WEB_URL in .env
  credentials: true
}));
```

### JWT Token Expired
**Solution**: Token automatically refreshed on app reload. If persists:
1. Clear localStorage: `localStorage.clear()`
2. Re-login with credentials

---

## 📊 API Endpoints Reference

### Authentication
```
POST   /login                          - User login
POST   /register                       - User registration
GET    /me                            - Get current user profile
GET    /auth/google                   - Google OAuth login
GET    /auth/google/callback          - Google OAuth callback
```

### Events
```
GET    /events                         - Get all events (public)
GET    /events/:id                    - Get event details
POST   /events                         - Create event (Organizer/Admin)
PUT    /events/:id                    - Update event
DELETE /events/:id                    - Delete event
GET    /organizer/events              - Get organizer's events
PATCH  /events/:id/status             - Update event status (Admin)
```

### Tickets
```
POST   /tickets                        - Book ticket
GET    /tickets/my                    - Get user's tickets
PATCH  /tickets/:ticketId/checkin    - Check in attendee
GET    /events/:id/tickets           - Get event tickets (Organizer)
```

### Users (Admin)
```
GET    /admin/users                   - Get all users
PATCH  /admin/users/:id/status        - Update user status
```

---

## 🔐 Security Features Implemented

- ✅ JWT Token-based Authentication
- ✅ Password Hashing with bcrypt
- ✅ Role-Based Access Control (RBAC)
- ✅ Google OAuth 2.0 Integration
- ✅ Request Validation & Sanitization
- ✅ CORS Protection
- ✅ Session Management with MongoDB Store
- ✅ Secure Token Expiry (7 days)
- ✅ User Status Management (Active/Suspended)

---

## 📈 Performance Optimizations

- ✅ Database Connection Pooling
- ✅ Mongoose Indexing
- ✅ Request Response Caching
- ✅ Lazy Loading in Frontend
- ✅ Code Splitting (Vite)
- ✅ TailwindCSS Optimization

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/name`
2. Make changes and commit: `git commit -am "Add feature"`
3. Push to branch: `git push origin feature/name`
4. Submit Pull Request

---

## 📝 Environment Variables Checklist

### Backend (.env)
- [ ] DATABASE configured (MongoDB)
- [ ] PORT set (default: 1998)
- [ ] SECRET_KEY is strong (production)
- [ ] GOOGLE_CLIENT_ID added
- [ ] GOOGLE_CLIENT_SECRET added
- [ ] WEB_URL points to frontend
- [ ] BASE_URL points to backend

### Frontend (.env)
- [ ] VITE_API_URL points to backend

---

## ✅ Deployment Checklist

- [ ] All environment variables set correctly
- [ ] Database backups configured
- [ ] HTTPS enabled
- [ ] Security headers added
- [ ] Rate limiting enabled
- [ ] Error logging configured
- [ ] Monitoring/alerts set up
- [ ] Database seeded with initial data

---

## 📞 Support & Documentation

For detailed API documentation, see `API_DOCUMENTATION.md`

For deployment guide, see `DEPLOYMENT.md`

For architecture details, see `ARCHITECTURE.md`

---

**Last Updated**: 2026-06-03  
**Version**: 1.0.0  
**Status**: Production Ready ✅
