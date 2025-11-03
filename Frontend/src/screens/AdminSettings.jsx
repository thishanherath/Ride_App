import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Settings,
  User,
  Lock,
  Shield,
  Activity,
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { Card, Button, Input } from "../components/ui";
import axios from "axios";
import Console from "../utils/console";

function AdminSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstname: "",
    lastname: "",
    phone: ""
  });
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [messages, setMessages] = useState({
    profile: null,
    password: null
  });

  useEffect(() => {
    fetchAdminData();
    fetchSystemHealth();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
      
      const response = await axios.get(`${serverUrl}/admin/profile`, {
        headers: { token }
      });

      const adminData = response.data.admin;
      setAdmin(adminData);
      setProfileForm({
        firstname: adminData.fullname?.firstname || "",
        lastname: adminData.fullname?.lastname || "",
        phone: adminData.phone || ""
      });
    } catch (error) {
      Console.error("Error fetching admin data:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemHealth = async () => {
    try {
      const token = localStorage.getItem("token");
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
      
      const response = await axios.get(`${serverUrl}/admin/health`, {
        headers: { token }
      });

      setSystemHealth(response.data);
    } catch (error) {
      Console.error("Error fetching system health:", error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessages({ ...messages, profile: null });

    try {
      const token = localStorage.getItem("token");
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
      
      await axios.patch(`${serverUrl}/admin/admin-info`, {
        fullname: {
          firstname: profileForm.firstname,
          lastname: profileForm.lastname
        },
        phone: profileForm.phone
      }, {
        headers: { token }
      });

      setMessages({
        ...messages,
        profile: { type: 'success', text: 'Profile updated successfully!' }
      });
      
      // Refresh admin data
      fetchAdminData();
    } catch (error) {
      Console.error("Error updating profile:", error);
      setMessages({
        ...messages,
        profile: { 
          type: 'error', 
          text: error.response?.data?.message || 'Failed to update profile' 
        }
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessages({ ...messages, password: null });

    // Validation
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessages({
        ...messages,
        password: { type: 'error', text: 'New passwords do not match' }
      });
      setSaving(false);
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setMessages({
        ...messages,
        password: { type: 'error', text: 'New password must be at least 8 characters long' }
      });
      setSaving(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
      
      await axios.patch(`${serverUrl}/admin/change-password`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      }, {
        headers: { token }
      });

      setMessages({
        ...messages,
        password: { type: 'success', text: 'Password changed successfully!' }
      });
      
      // Clear form
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error) {
      Console.error("Error changing password:", error);
      setMessages({
        ...messages,
        password: { 
          type: 'error', 
          text: error.response?.data?.message || 'Failed to change password' 
        }
      });
    } finally {
      setSaving(false);
    }
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const TabButton = ({ id, label, icon: Icon, active, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        active
          ? 'bg-blue-100 text-blue-700 border border-blue-200'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );

  const MessageAlert = ({ message }) => {
    if (!message) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center space-x-2 p-3 rounded-lg mb-4 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}
      >
        {message.type === 'success' ? (
          <CheckCircle className="w-4 h-4" />
        ) : (
          <AlertCircle className="w-4 h-4" />
        )}
        <span className="text-sm">{message.text}</span>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
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
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin/dashboard")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
                <p className="text-gray-600">Manage your account and system preferences</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex space-x-2 mb-6">
            <TabButton
              id="profile"
              label="Profile"
              icon={User}
              active={activeTab === "profile"}
              onClick={setActiveTab}
            />
            <TabButton
              id="security"
              label="Security"
              icon={Lock}
              active={activeTab === "security"}
              onClick={setActiveTab}
            />
            <TabButton
              id="system"
              label="System Health"
              icon={Activity}
              active={activeTab === "system"}
              onClick={setActiveTab}
            />
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                    <p className="text-gray-600">Update your personal information and contact details</p>
                  </div>
                </div>

                <MessageAlert message={messages.profile} />

                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <Input
                        type="text"
                        value={profileForm.firstname}
                        onChange={(e) => setProfileForm({
                          ...profileForm,
                          firstname: e.target.value
                        })}
                        placeholder="Enter first name"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <Input
                        type="text"
                        value={profileForm.lastname}
                        onChange={(e) => setProfileForm({
                          ...profileForm,
                          lastname: e.target.value
                        })}
                        placeholder="Enter last name"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={admin?.email || ""}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({
                        ...profileForm,
                        phone: e.target.value
                      })}
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={saving}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {saving ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Lock className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
                    <p className="text-gray-600">Change your password and manage security preferences</p>
                  </div>
                </div>

                <MessageAlert message={messages.password} />

                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({
                          ...passwordForm,
                          currentPassword: e.target.value
                        })}
                        placeholder="Enter current password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({
                          ...showPasswords,
                          current: !showPasswords.current
                        })}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({
                          ...passwordForm,
                          newPassword: e.target.value
                        })}
                        placeholder="Enter new password"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({
                          ...showPasswords,
                          new: !showPasswords.new
                        })}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Password must be at least 8 characters long</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({
                          ...passwordForm,
                          confirmPassword: e.target.value
                        })}
                        placeholder="Confirm new password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({
                          ...showPasswords,
                          confirm: !showPasswords.confirm
                        })}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={saving}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {saving ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Changing...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Change Password
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          )}

          {/* System Health Tab */}
          {activeTab === "system" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Activity className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">System Health</h2>
                      <p className="text-gray-600">Monitor system performance and status</p>
                    </div>
                  </div>
                  
                  <Button
                    onClick={fetchSystemHealth}
                    variant="outline"
                    size="sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>

                {systemHealth && (
                  <div className="space-y-6">
                    {/* System Status */}
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <div>
                          <h3 className="font-semibold text-green-900">System Status</h3>
                          <p className="text-sm text-green-700">All systems operational</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        {systemHealth.status}
                      </span>
                    </div>

                    {/* System Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900">System Information</h3>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600">Uptime</span>
                            <span className="font-medium">{formatUptime(systemHealth.uptime)}</span>
                          </div>
                          
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600">Memory Usage</span>
                            <span className="font-medium">
                              {systemHealth.system?.memory?.used}MB / {systemHealth.system?.memory?.total}MB
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600">Last Updated</span>
                            <span className="font-medium">
                              {new Date(systemHealth.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900">Database Statistics</h3>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                            <span className="text-gray-600">Total Users</span>
                            <span className="font-medium text-blue-600">
                              {systemHealth.database?.users?.toLocaleString()}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                            <span className="text-gray-600">Total Captains</span>
                            <span className="font-medium text-green-600">
                              {systemHealth.database?.captains?.toLocaleString()}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                            <span className="text-gray-600">Active Rides</span>
                            <span className="font-medium text-purple-600">
                              {systemHealth.database?.activeRides?.toLocaleString()}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                            <span className="text-gray-600">Active Admins</span>
                            <span className="font-medium text-orange-600">
                              {systemHealth.database?.admins?.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminSettings;