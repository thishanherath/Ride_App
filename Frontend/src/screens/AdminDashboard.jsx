import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  Car,
  MapPin,
  DollarSign,
  TrendingUp,
  Clock,
  AlertCircle,
  LogOut,
  Settings,
  BarChart3,
  UserCheck,
  Calendar
} from "lucide-react";
import { Card, Button } from "../components/ui";
import { formatCurrency } from "../utils/currency";
import axios from "axios";
import Console from "../utils/console";

function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentRides, setRecentRides] = useState([]);
  const [topCaptains, setTopCaptains] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
      
      const response = await axios.get(`${serverUrl}/admin/dashboard`, {
        headers: { token }
      });

      setStats(response.data.stats);
      setRecentRides(response.data.recentRides);
      setTopCaptains(response.data.topCaptains);
    } catch (error) {
      Console.error("Error fetching dashboard data:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    navigate("/login");
  };

  const StatCard = ({ title, value, icon: Icon, color, change, changeType }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value?.toLocaleString() || 0}</p>
          {change && (
            <div className={`flex items-center mt-2 text-sm ${
              changeType === 'positive' ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className={`w-4 h-4 mr-1 ${
                changeType === 'positive' ? 'rotate-0' : 'rotate-180'
              }`} />
              {change}%
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  const QuickAction = ({ title, description, icon: Icon, onClick, color }) => (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-left hover:shadow-md transition-all duration-200"
    >
      <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </motion.button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, Admin</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate("/admin/settings")}
                variant="outline"
                size="sm"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats?.totalUsers}
            icon={Users}
            color="bg-blue-500"
            change="+12"
            changeType="positive"
          />
          <StatCard
            title="Total Captains"
            value={stats?.totalCaptains}
            icon={Car}
            color="bg-green-500"
            change="+8"
            changeType="positive"
          />
          <StatCard
            title="Total Rides"
            value={stats?.totalRides}
            icon={MapPin}
            color="bg-purple-500"
            change="+15"
            changeType="positive"
          />
          <StatCard
            title="Total Revenue"
            value={stats?.totalRevenue}
            icon={DollarSign}
            color="bg-orange-500"
            change="+22"
            changeType="positive"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickAction
              title="Manage Users"
              description="View and manage user accounts"
              icon={Users}
              color="bg-blue-500"
              onClick={() => navigate("/admin/users")}
            />
            <QuickAction
              title="Manage Captains"
              description="Verify and manage driver accounts"
              icon={UserCheck}
              color="bg-green-500"
              onClick={() => navigate("/admin/captains")}
            />
            <QuickAction
              title="View Rides"
              description="Monitor and manage ride requests"
              icon={MapPin}
              color="bg-purple-500"
              onClick={() => navigate("/admin/rides")}
            />
            <QuickAction
              title="Analytics"
              description="View detailed analytics and reports"
              icon={BarChart3}
              color="bg-orange-500"
              onClick={() => navigate("/admin/analytics")}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Rides */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Rides</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin/rides")}
              >
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {recentRides?.slice(0, 5).map((ride, index) => (
                <motion.div
                  key={ride._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {ride.user?.fullname?.firstname} {ride.user?.fullname?.lastname}
                      </p>
                      <p className="text-sm text-gray-600">
                        {ride.pickup} → {ride.destination}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(ride.fare)}</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      ride.status === 'completed' ? 'bg-green-100 text-green-800' :
                      ride.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                      ride.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {ride.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Top Captains */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Top Captains</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin/captains")}
              >
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {topCaptains?.slice(0, 5).map((captain, index) => (
                <motion.div
                  key={captain._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Car className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {captain.fullname?.firstname} {captain.fullname?.lastname}
                      </p>
                      <p className="text-sm text-gray-600">
                        {captain.vehicle?.type} • {captain.vehicle?.number}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{captain.totalRides} rides</p>
                    <p className="text-sm text-gray-600">{formatCurrency(captain.totalEarnings)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
