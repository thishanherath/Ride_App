const asyncHandler = require("express-async-handler");
const adminModel = require("../models/admin.model");
const userModel = require("../models/user.model");
const captainModel = require("../models/captain.model");
const rideModel = require("../models/ride.model");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

// Admin Authentication
module.exports.loginAdmin = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  const { email, password } = req.body;

  const admin = await adminModel.findOne({ email, isActive: true }).select("+password");
  
  if (!admin) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Check if account is locked
  if (admin.isLocked) {
    return res.status(423).json({ 
      message: "Account is temporarily locked due to too many failed login attempts. Please try again later." 
    });
  }

  const isMatch = await admin.comparePassword(password);

  if (!isMatch) {
    await admin.incLoginAttempts();
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Reset login attempts on successful login
  await admin.resetLoginAttempts();
  await admin.updateOne({ lastLogin: new Date() });

  const token = admin.generateAuthToken();
  
  res.json({
    message: "Login successful",
    token,
    admin: {
      _id: admin._id,
      fullname: admin.fullname,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
      lastLogin: admin.lastLogin
    }
  });
});

// Get Admin Profile
module.exports.getAdminProfile = asyncHandler(async (req, res) => {
  res.status(200).json({ admin: req.admin });
});

// Dashboard Statistics
module.exports.getDashboardStats = asyncHandler(async (req, res) => {
  try {
    const [
      totalUsers,
      totalCaptains,
      totalRides,
      activeRides,
      completedRides,
      cancelledRides,
      todayRides,
      weeklyRides,
      monthlyRides,
      totalRevenue
    ] = await Promise.all([
      userModel.countDocuments(),
      captainModel.countDocuments(),
      rideModel.countDocuments(),
      rideModel.countDocuments({ status: "ongoing" }),
      rideModel.countDocuments({ status: "completed" }),
      rideModel.countDocuments({ status: "cancelled" }),
      rideModel.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }),
      rideModel.countDocuments({
        createdAt: {
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }),
      rideModel.countDocuments({
        createdAt: {
          $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }),
      rideModel.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$fare" } } }
      ])
    ]);

    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

    // Recent rides
    const recentRides = await rideModel
      .find()
      .populate("user", "fullname email phone")
      .populate("captain", "fullname email phone vehicle")
      .sort({ createdAt: -1 })
      .limit(10);

    // Top performing captains
    const topCaptains = await captainModel.aggregate([
      {
        $lookup: {
          from: "rides",
          localField: "_id",
          foreignField: "captain",
          as: "rides"
        }
      },
      {
        $match: {
          "rides.status": "completed"
        }
      },
      {
        $addFields: {
          totalRides: { $size: "$rides" },
          totalEarnings: { $sum: "$rides.fare" }
        }
      },
      {
        $sort: { totalRides: -1 }
      },
      {
        $limit: 5
      },
      {
        $project: {
          fullname: 1,
          email: 1,
          phone: 1,
          vehicle: 1,
          totalRides: 1,
          totalEarnings: 1
        }
      }
    ]);

    res.status(200).json({
      stats: {
        totalUsers,
        totalCaptains,
        totalRides,
        activeRides,
        completedRides,
        cancelledRides,
        todayRides,
        weeklyRides,
        monthlyRides,
        totalRevenue: revenue
      },
      recentRides,
      topCaptains
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Error fetching dashboard statistics" });
  }
});

// User Management
module.exports.getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = "", status = "" } = req.query;
  const skip = (page - 1) * limit;

  let query = {};
  
  if (search) {
    query.$or = [
      { "fullname.firstname": { $regex: search, $options: "i" } },
      { "fullname.lastname": { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } }
    ];
  }

  const users = await userModel
    .find(query)
    .select("-password")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await userModel.countDocuments(query);

  res.status(200).json({
    users,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    }
  });
});

module.exports.getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const user = await userModel
    .findById(id)
    .select("-password")
    .populate("rides");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({ user });
});

module.exports.updateUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  const user = await userModel.findByIdAndUpdate(
    id,
    { isActive },
    { new: true }
  ).select("-password");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({ 
    message: "User status updated successfully",
    user 
  });
});

// Captain Management
module.exports.getAllCaptains = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = "", status = "" } = req.query;
  const skip = (page - 1) * limit;

  let query = {};
  
  if (search) {
    query.$or = [
      { "fullname.firstname": { $regex: search, $options: "i" } },
      { "fullname.lastname": { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { "vehicle.number": { $regex: search, $options: "i" } }
    ];
  }

  if (status) {
    query.status = status;
  }

  const captains = await captainModel
    .find(query)
    .select("-password")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await captainModel.countDocuments(query);

  res.status(200).json({
    captains,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    }
  });
});

module.exports.getCaptainById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const captain = await captainModel
    .findById(id)
    .select("-password")
    .populate("rides");

  if (!captain) {
    return res.status(404).json({ message: "Captain not found" });
  }

  res.status(200).json({ captain });
});

module.exports.updateCaptainStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const captain = await captainModel.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  ).select("-password");

  if (!captain) {
    return res.status(404).json({ message: "Captain not found" });
  }

  res.status(200).json({ 
    message: "Captain status updated successfully",
    captain 
  });
});

module.exports.verifyCaptain = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isVerified, verificationNotes } = req.body;

  const captain = await captainModel.findByIdAndUpdate(
    id,
    { 
      isVerified,
      verificationNotes,
      verifiedAt: isVerified ? new Date() : null
    },
    { new: true }
  ).select("-password");

  if (!captain) {
    return res.status(404).json({ message: "Captain not found" });
  }

  res.status(200).json({ 
    message: "Captain verification updated successfully",
    captain 
  });
});

// Ride Management
module.exports.getAllRides = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    status = "", 
    dateFrom = "", 
    dateTo = "",
    search = ""
  } = req.query;
  
  const skip = (page - 1) * limit;
  let query = {};

  if (status) {
    query.status = status;
  }

  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) {
      query.createdAt.$gte = new Date(dateFrom);
    }
    if (dateTo) {
      query.createdAt.$lte = new Date(dateTo);
    }
  }

  if (search) {
    query.$or = [
      { pickup: { $regex: search, $options: "i" } },
      { destination: { $regex: search, $options: "i" } }
    ];
  }

  const rides = await rideModel
    .find(query)
    .populate("user", "fullname email phone")
    .populate("captain", "fullname email phone vehicle")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await rideModel.countDocuments(query);

  res.status(200).json({
    rides,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    }
  });
});

module.exports.getRideById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const ride = await rideModel
    .findById(id)
    .populate("user", "fullname email phone")
    .populate("captain", "fullname email phone vehicle");

  if (!ride) {
    return res.status(404).json({ message: "Ride not found" });
  }

  res.status(200).json({ ride });
});

module.exports.updateRideStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;

  const ride = await rideModel.findByIdAndUpdate(
    id,
    { 
      status,
      adminNotes,
      updatedBy: req.admin._id
    },
    { new: true }
  ).populate("user", "fullname email phone")
   .populate("captain", "fullname email phone vehicle");

  if (!ride) {
    return res.status(404).json({ message: "Ride not found" });
  }

  res.status(200).json({ 
    message: "Ride status updated successfully",
    ride 
  });
});

// Analytics
module.exports.getAnalytics = asyncHandler(async (req, res) => {
  const { period = "30d" } = req.query;
  
  let dateFilter = {};
  const now = new Date();
  
  switch (period) {
    case "7d":
      dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
      break;
    case "30d":
      dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
      break;
    case "90d":
      dateFilter = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
      break;
    case "1y":
      dateFilter = { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) };
      break;
  }

  const [
    rideStats,
    revenueStats,
    userStats,
    captainStats
  ] = await Promise.all([
    // Ride statistics
    rideModel.aggregate([
      { $match: { createdAt: dateFilter } },
      {
        $group: {
          _id: null,
          totalRides: { $sum: 1 },
          completedRides: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
          cancelledRides: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } },
          totalRevenue: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, "$fare", 0] } },
          avgFare: { $avg: { $cond: [{ $eq: ["$status", "completed"] }, "$fare", null] } }
        }
      }
    ]),
    // Revenue by day
    rideModel.aggregate([
      { $match: { status: "completed", createdAt: dateFilter } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$fare" },
          rides: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]),
    // User statistics
    userModel.aggregate([
      { $match: { createdAt: dateFilter } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]),
    // Captain statistics
    captainModel.aggregate([
      { $match: { createdAt: dateFilter } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])
  ]);

  res.status(200).json({
    rideStats: rideStats[0] || {
      totalRides: 0,
      completedRides: 0,
      cancelledRides: 0,
      totalRevenue: 0,
      avgFare: 0
    },
    revenueStats,
    userStats,
    captainStats
  });
});
// Admin Management (Super Admin only)
module.exports.getAllAdmins = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = "", role = "" } = req.query;
  const skip = (page - 1) * limit;

  let query = {};
  
  if (search) {
    query.$or = [
      { "fullname.firstname": { $regex: search, $options: "i" } },
      { "fullname.lastname": { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } }
    ];
  }

  if (role) {
    query.role = role;
  }

  const admins = await adminModel
    .find(query)
    .select("-password")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await adminModel.countDocuments(query);

  res.status(200).json({
    admins,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    }
  });
});

module.exports.createAdmin = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  const { fullname, email, password, phone, role, permissions } = req.body;

  // Check if admin already exists
  const existingAdmin = await adminModel.findOne({ email });
  if (existingAdmin) {
    return res.status(400).json({ message: "Admin with this email already exists" });
  }

  const newAdmin = await adminModel.create({
    fullname,
    email,
    password: await adminModel.hashPassword(password),
    phone,
    role: role || "admin",
    permissions: permissions || {
      userManagement: true,
      driverManagement: true,
      rideManagement: true,
      paymentManagement: false,
      analytics: true,
      support: true
    },
    isActive: true
  });

  res.status(201).json({
    message: "Admin created successfully",
    admin: {
      _id: newAdmin._id,
      fullname: newAdmin.fullname,
      email: newAdmin.email,
      phone: newAdmin.phone,
      role: newAdmin.role,
      permissions: newAdmin.permissions,
      isActive: newAdmin.isActive
    }
  });
});

module.exports.updateAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { fullname, phone, role, permissions, isActive } = req.body;

  // Prevent self-deactivation
  if (req.admin._id.toString() === id && isActive === false) {
    return res.status(400).json({ message: "Cannot deactivate your own account" });
  }

  const admin = await adminModel.findByIdAndUpdate(
    id,
    {
      ...(fullname && { fullname }),
      ...(phone && { phone }),
      ...(role && { role }),
      ...(permissions && { permissions }),
      ...(typeof isActive === 'boolean' && { isActive })
    },
    { new: true }
  ).select("-password");

  if (!admin) {
    return res.status(404).json({ message: "Admin not found" });
  }

  res.status(200).json({
    message: "Admin updated successfully",
    admin
  });
});

module.exports.deleteAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Prevent self-deletion
  if (req.admin._id.toString() === id) {
    return res.status(400).json({ message: "Cannot delete your own account" });
  }

  const admin = await adminModel.findByIdAndDelete(id);

  if (!admin) {
    return res.status(404).json({ message: "Admin not found" });
  }

  res.status(200).json({
    message: "Admin deleted successfully"
  });
});

module.exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Current password and new password are required" });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ message: "New password must be at least 8 characters long" });
  }

  // Get admin with password
  const admin = await adminModel.findById(req.admin._id).select("+password");
  if (!admin) {
    return res.status(404).json({ message: "Admin not found" });
  }

  // Verify current password
  const isCurrentPasswordValid = await admin.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    return res.status(400).json({ message: "Current password is incorrect" });
  }

  // Update password
  admin.password = await adminModel.hashPassword(newPassword);
  admin.loginAttempts = 0;
  admin.lockUntil = undefined;
  await admin.save();

  res.status(200).json({
    message: "Password changed successfully"
  });
});

// System Health Check
module.exports.getSystemHealth = asyncHandler(async (req, res) => {
  try {
    const [
      totalUsers,
      totalCaptains,
      totalAdmins,
      activeRides,
      systemUptime
    ] = await Promise.all([
      userModel.countDocuments(),
      captainModel.countDocuments(),
      adminModel.countDocuments({ isActive: true }),
      rideModel.countDocuments({ status: { $in: ["pending", "accepted", "ongoing"] } }),
      Promise.resolve(process.uptime())
    ]);

    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: Math.floor(systemUptime),
      database: {
        users: totalUsers,
        captains: totalCaptains,
        admins: totalAdmins,
        activeRides
      },
      system: {
        memory: {
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          external: Math.round(memoryUsage.external / 1024 / 1024)
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});