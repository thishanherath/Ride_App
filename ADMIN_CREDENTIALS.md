# QuickRide Admin System - Credentials & Access Guide

## 🔐 Admin Login Credentials

### Master Administrator (Complete System Control) ✅ READY
- **Email:** `admin@quickride.lk`
- **Password:** `QuickRide@Admin2024!`
- **Role:** Master Administrator
- **Permissions:** FULL SYSTEM ACCESS - Everything
- **Access Level:** Complete control over:
  - ✅ User Management (View, Edit, Activate/Deactivate)
  - ✅ Driver Management (Verify, Manage, Track Performance)
  - ✅ Ride Management (Monitor, Update Status, Handle Disputes)
  - ✅ Payment Management (Revenue Tracking, Financial Reports)
  - ✅ Analytics & Reports (All Business Intelligence)
  - ✅ System Administration (Settings, Configuration)
  - ✅ Support & Maintenance (Customer Support, System Health)
- **Status:** ✅ Active and Ready to Use

### Test Admin (Development Only)
- **Email:** `admin@test.com`
- **Password:** `123456`
- **Role:** Test Admin
- **Permissions:** Development testing only
- **Status:** Available for development testing

## 🚀 How to Access Admin Panel

### 1. Setup Admin Accounts
Run the admin creation script:
```bash
cd Backend
node scripts/createSuperAdmin.js
```

### 2. Access Admin Dashboard
1. Navigate to: `http://localhost:5173/login` (Unified Login)
2. Use the admin credentials above
3. The system will automatically detect you're an admin and redirect to the dashboard

**Note:** You can also access `http://localhost:5173/admin/login` which redirects to the same unified login.

### 3. Admin Panel Features

#### Dashboard Overview
- **Real-time Statistics:** Users, drivers, rides, revenue
- **Recent Activity:** Latest rides and transactions
- **Quick Actions:** Direct access to management sections
- **Performance Metrics:** Daily, weekly, monthly analytics

#### User Management
- **View All Users:** Paginated list with search functionality
- **User Details:** Complete profile information and ride history
- **Account Status:** Activate/deactivate user accounts
- **User Analytics:** Registration trends and activity patterns

#### Driver Management
- **Driver Verification:** Approve/reject driver applications
- **Vehicle Information:** Manage vehicle details and documentation
- **Driver Status:** Active/inactive status management
- **Performance Tracking:** Ride completion rates and earnings

#### Ride Management
- **Live Ride Monitoring:** Real-time ride status tracking
- **Ride History:** Complete ride database with filtering
- **Dispute Resolution:** Handle ride-related issues
- **Route Analysis:** Popular routes and demand patterns

#### Analytics & Reports
- **Revenue Analytics:** Daily, weekly, monthly revenue reports
- **User Growth:** Registration and retention metrics
- **Driver Performance:** Top performers and efficiency metrics
- **Geographic Analysis:** Popular pickup/drop-off locations

#### System Settings
- **Fare Configuration:** Adjust pricing for different vehicle types
- **Service Areas:** Manage operational zones
- **Notification Settings:** Configure system alerts
- **Security Settings:** Admin account management

## 🛡️ Security Features

### Account Protection
- **Login Attempt Limiting:** 5 failed attempts lock account for 2 hours
- **Session Management:** 8-hour token expiration
- **Role-Based Access:** Granular permission system
- **Activity Logging:** All admin actions are logged

### Password Requirements
- Minimum 8 characters
- Must include uppercase, lowercase, numbers, and special characters
- Regular password rotation recommended

## 📱 Mobile Admin Access

The admin panel is fully responsive and can be accessed from:
- Desktop browsers
- Tablet devices
- Mobile phones
- Progressive Web App (PWA) support

## 🔧 Admin API Endpoints

### Authentication
- `POST /admin/login` - Admin login
- `GET /admin/profile` - Get admin profile

### Dashboard
- `GET /admin/dashboard` - Dashboard statistics
- `GET /admin/analytics` - Detailed analytics

### User Management
- `GET /admin/users` - List all users
- `GET /admin/users/:id` - Get user details
- `PATCH /admin/users/:id/status` - Update user status

### Driver Management
- `GET /admin/captains` - List all drivers
- `GET /admin/captains/:id` - Get driver details
- `PATCH /admin/captains/:id/status` - Update driver status
- `PATCH /admin/captains/:id/verify` - Verify driver

### Ride Management
- `GET /admin/rides` - List all rides
- `GET /admin/rides/:id` - Get ride details
- `PATCH /admin/rides/:id/status` - Update ride status

## 🚨 Emergency Access

In case of emergency or if you're locked out:
1. Contact system administrator
2. Check server logs for account status
3. Use database direct access to reset passwords
4. Restore from backup if necessary

## 📞 Support & Maintenance

### Regular Tasks
- Monitor system performance daily
- Review user feedback weekly
- Update fare rates as needed
- Backup database regularly
- Review security logs monthly

### Troubleshooting
- Check server logs: `Backend/logs/`
- Monitor database connections
- Verify API endpoints functionality
- Test mobile responsiveness

---

**⚠️ IMPORTANT SECURITY NOTES:**
- Never share admin credentials
- Change default passwords immediately
- Use strong, unique passwords
- Enable two-factor authentication when available
- Regularly audit admin access logs
- Keep the system updated with security patches

**📧 For technical support:** Contact the development team
**🔄 Last Updated:** December 2024