# QuickRide - Quick Start Guide

## 🚀 Instant Setup (5 Minutes)

### Step 1: Clone and Install
```bash
# Clone the repository
git clone <your-repo-url>
cd Ride_App

# Install Backend Dependencies
cd Backend
npm install

# Install Frontend Dependencies
cd ../Frontend
npm install
```

### Step 2: Setup Admin Accounts
```bash
# Create Super Admin and Regular Admin
cd Backend
node scripts/createSuperAdmin.js
```

### Step 3: Start the System
```bash
# Terminal 1: Start Backend
cd Backend
npm run dev

# Terminal 2: Start Frontend
cd Frontend
npm run dev
```

### Step 4: Access Admin Panel
1. Open browser: `http://localhost:5173/login` (Unified Login)
2. Login with Master Admin:
   - **Email:** `admin@quickride.lk`
   - **Password:** `QuickRide@Admin2024!`
3. System automatically detects admin role and redirects to dashboard

## 🎯 Single Admin System

### Master Administrator (Complete Control)
- **Email:** `admin@quickride.lk`
- **Password:** `QuickRide@Admin2024!`
- **Access:** FULL SYSTEM CONTROL
- **Features:** Everything - Users, Drivers, Rides, Payments, Analytics, Support

## 📱 Test User Accounts

### Passenger Account
- **Email:** `user@test.com`
- **Password:** `123456`
- **Role:** Regular user/passenger

### Driver Account
- **Email:** `driver@test.com`
- **Password:** `123456`
- **Role:** Driver/captain

## 🔧 System URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:5173 | Main application |
| Backend API | http://localhost:4000 | API server |
| Admin Panel | http://localhost:5173/admin/login | Admin dashboard |
| User Login | http://localhost:5173/login | User authentication |
| Driver Login | http://localhost:5173/captain/login | Driver authentication |

## 🎮 Admin Features Overview

### Dashboard
- Real-time statistics (users, drivers, rides, revenue)
- Recent activity monitoring
- Quick action buttons
- Performance metrics

### User Management
- View all registered users
- Activate/deactivate accounts
- User profile details
- Ride history tracking

### Driver Management
- Driver verification process
- Vehicle information management
- Performance tracking
- Status control (active/inactive)

### Ride Management
- Live ride monitoring
- Ride history with filters
- Status updates
- Dispute resolution

### Analytics
- Revenue reports
- User growth metrics
- Geographic analysis
- Performance insights

## 🛡️ Security Features

### Account Protection
- Login attempt limiting (5 attempts = 2-hour lock)
- Session management (8-hour tokens)
- Role-based permissions
- Activity logging

### Admin Capabilities
- Create/update/delete admin accounts (Super Admin only)
- Reset passwords
- Manage permissions
- System health monitoring

## 📊 System Health Check

Access system health: `GET http://localhost:4000/admin/health`

Returns:
- Database connection status
- Active users/drivers/rides
- System uptime
- Memory/CPU usage

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check `.env` file in Backend folder
   - Verify MongoDB Atlas connection string
   - Ensure network connectivity

2. **Admin Login Failed**
   - Run `node scripts/createSuperAdmin.js` again
   - Check console for error messages
   - Verify database connection

3. **Frontend Not Loading**
   - Check if backend is running on port 4000
   - Verify VITE_SERVER_URL in Frontend/.env
   - Clear browser cache

4. **Permission Denied**
   - Check user role and permissions
   - Verify JWT token validity
   - Re-login if token expired

### Reset Everything
```bash
# Recreate admin accounts
cd Backend
node scripts/createSuperAdmin.js

# Clear browser storage
# Open browser dev tools > Application > Storage > Clear All
```

## 📞 Support

### Development Mode
- Check browser console for errors
- Monitor backend terminal for API logs
- Use browser dev tools for network issues

### Production Deployment
- Update environment variables
- Configure proper MongoDB connection
- Set up SSL certificates
- Configure domain names

---

## 🎉 You're Ready!

Your QuickRide system is now fully operational with:
- ✅ Complete admin management system
- ✅ Role-based access control
- ✅ User and driver management
- ✅ Real-time ride monitoring
- ✅ Sri Lankan market optimization
- ✅ Mobile-responsive design

**Happy riding! 🚗💨**