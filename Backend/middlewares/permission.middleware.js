/**
 * Permission-based middleware for role-based access control
 */

// Simplified admin check - single admin has all permissions
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ message: "Admin authentication required" });
    }

    // Single admin system - all authenticated admins have full access
    next();
  };
};

// Simplified role check - single admin system
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ message: "Admin authentication required" });
    }

    // Single admin system - authenticated admin has all roles
    next();
  };
};

// Simplified permission check - single admin system
const checkAnyPermission = (permissions) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ message: "Admin authentication required" });
    }

    // Single admin system - authenticated admin has all permissions
    next();
  };
};

// Simplified permission check - single admin system
const checkAllPermissions = (permissions) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ message: "Admin authentication required" });
    }

    // Single admin system - authenticated admin has all permissions
    next();
  };
};

// Specific permission middlewares
const permissions = {
  userManagement: checkPermission('userManagement'),
  driverManagement: checkPermission('driverManagement'),
  rideManagement: checkPermission('rideManagement'),
  paymentManagement: checkPermission('paymentManagement'),
  analytics: checkPermission('analytics'),
  support: checkPermission('support')
};

// Simplified role middlewares - single admin system
const roles = {
  superAdmin: checkRole('admin'),
  admin: checkRole('admin'),
  moderator: checkRole('admin')
};

module.exports = {
  checkPermission,
  checkRole,
  checkAnyPermission,
  checkAllPermissions,
  permissions,
  roles
};