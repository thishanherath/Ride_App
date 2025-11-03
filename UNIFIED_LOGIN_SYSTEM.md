# QuickRide - Unified Login System

## 🎯 Single Login Interface for All Users

The QuickRide system now uses **ONE LOGIN INTERFACE** for all user types:
- **Passengers** (Regular users)
- **Drivers** (Captains)  
- **Administrators**

## 🚀 How It Works

### Single Login URL
**All users login at:** `http://localhost:5173/login`

### Automatic User Detection
The system automatically:
1. **Tries passenger login** first
2. **Tries driver login** if passenger fails
3. **Tries admin login** if driver fails
4. **Redirects to appropriate dashboard** based on user type

### Smart Redirects
- **Passengers** → `/home` (User dashboard)
- **Drivers** → `/captain/home` (Driver dashboard)
- **Administrators** → `/admin/dashboard` (Admin dashboard)

## 🔐 Login Credentials

### Admin (Master Administrator)
- **Email:** `admin@quickride.lk`
- **Password:** `QuickRide@Admin2024!`
- **Redirects to:** Admin Dashboard

### Test Passenger
- **Email:** `user@test.com`
- **Password:** `123456`
- **Redirects to:** User Home

### Test Driver
- **Email:** `driver@test.com`
- **Password:** `123456`
- **Redirects to:** Captain Home

## 🎨 User Experience

### Login Process
1. User enters email and password
2. System shows status: "Checking passenger credentials..."
3. If not passenger: "Checking driver credentials..."
4. If not driver: "Checking admin credentials..."
5. Success: "Login successful! Redirecting..."
6. Automatic redirect to appropriate dashboard

### Visual Indicators
- **Role badges** showing all supported user types
- **Real-time status updates** during login process
- **Unified design** consistent across all user types
- **Error handling** with clear messages

## 🛠️ Technical Implementation

### Removed Components
- ❌ `AdminLogin.jsx` (deleted)
- ❌ `/admin/login` route (redirects to unified login)
- ❌ Separate admin login interface

### Updated Components
- ✅ `Login.jsx` - Unified login with auto-detection
- ✅ `AdminDashboard.jsx` - Uses unified token storage
- ✅ `AdminUsers.jsx` - Uses unified token storage
- ✅ Token storage unified as `token` (not `adminToken`)

### Route Structure
```
/login                 → Unified login for all users
/admin/login          → Redirects to unified login
/home                 → Passenger dashboard
/captain/home         → Driver dashboard  
/admin/dashboard      → Admin dashboard
```

## 🔒 Security Features

### Token Management
- **Single token system** for all user types
- **Automatic token validation** on protected routes
- **Consistent logout** across all user types
- **Session management** with 8-hour expiration

### User Type Detection
- **Server-side validation** for each user type
- **Role-based redirects** after successful login
- **Error handling** for invalid credentials
- **Account lockout** protection (5 attempts = 2-hour lock)

## 📱 Mobile Responsive

The unified login works perfectly on:
- **Desktop browsers**
- **Mobile devices**
- **Tablets**
- **Progressive Web App (PWA)**

## 🎉 Benefits

### For Users
- **Single login URL** to remember
- **Automatic detection** of user type
- **Consistent experience** across all roles
- **Clear status updates** during login

### For Developers
- **Simplified maintenance** - one login component
- **Consistent token handling** across all user types
- **Unified error handling** and validation
- **Easier testing** and debugging

### For Administrators
- **Same login process** as other users
- **No separate admin portal** to maintain
- **Consistent security model** across all roles
- **Unified user management** system

---

## 🚀 Quick Test

1. **Start the system:**
   ```bash
   cd Backend && npm run dev
   cd Frontend && npm run dev
   ```

2. **Test all user types at:** http://localhost:5173/login

3. **Admin Login:**
   - Email: `admin@quickride.lk`
   - Password: `QuickRide@Admin2024!`
   - Should redirect to admin dashboard

**🎯 One login interface, three user types, seamless experience!**