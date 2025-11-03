import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  Filter,
  Eye,
  UserCheck,
  UserX,
  ArrowLeft,
  Download,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Shield
} from "lucide-react";
import { Card, Button, Input } from "../components/ui";
import { formatCurrency } from "../utils/currency";
import axios from "axios";
import Console from "../utils/console";

function AdminUsers() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
      
      const response = await axios.get(`${serverUrl}/admin/users`, {
        headers: { token },
        params: {
          page: currentPage,
          limit: 10,
          search: searchTerm
        }
      });

      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (error) {
      Console.error("Error fetching users:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUserStatusToggle = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
      
      await axios.patch(`${serverUrl}/admin/users/${userId}/status`, {
        isActive: !currentStatus
      }, {
        headers: { token }
      });

      // Refresh users list
      fetchUsers();
    } catch (error) {
      Console.error("Error updating user status:", error);
    }
  };

  const handleViewUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
      
      const response = await axios.get(`${serverUrl}/admin/users/${userId}`, {
        headers: { token }
      });

      setSelectedUser(response.data.user);
      setShowUserModal(true);
    } catch (error) {
      Console.error("Error fetching user details:", error);
    }
  };

  const UserCard = ({ user }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {user.fullname?.firstname} {user.fullname?.lastname}
            </h3>
            <p className="text-sm text-gray-600">{user.email}</p>
            <p className="text-sm text-gray-500">{user.phone}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            user.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {user.isActive ? 'Active' : 'Inactive'}
          </span>
          
          <div className="flex space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewUser(user._id)}
            >
              <Eye className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUserStatusToggle(user._id, user.isActive)}
              className={user.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}
            >
              {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Joined</p>
          <p className="font-medium">
            {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Email Verified</p>
          <p className={`font-medium ${user.emailVerified ? 'text-green-600' : 'text-red-600'}`}>
            {user.emailVerified ? 'Yes' : 'No'}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Total Rides</p>
          <p className="font-medium">{user.rides?.length || 0}</p>
        </div>
      </div>
    </motion.div>
  );

  const UserModal = ({ user, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">User Details</h2>
            <Button variant="outline" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
          
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{user.fullname?.firstname} {user.fullname?.lastname}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{user.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    user.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Account Info */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Account Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Joined Date</p>
                  <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email Verified</p>
                  <p className={`font-medium ${user.emailVerified ? 'text-green-600' : 'text-red-600'}`}>
                    {user.emailVerified ? 'Verified' : 'Not Verified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Rides</p>
                  <p className="font-medium">{user.rides?.length || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-medium">{new Date(user.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            {/* Recent Rides */}
            {user.rides && user.rides.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Recent Rides</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {user.rides.slice(0, 5).map((ride, index) => (
                    <div key={ride._id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{ride.pickup} → {ride.destination}</p>
                        <p className="text-xs text-gray-500">{new Date(ride.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{formatCurrency(ride.fare)}</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          ride.status === 'completed' ? 'bg-green-100 text-green-800' :
                          ride.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                          ride.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {ride.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600">Manage and monitor user accounts</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                onClick={fetchUsers}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Search and Filters */}
        <Card className="p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search users by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Users List */}
        <div className="space-y-4 mb-6">
          {users.map((user) => (
            <UserCard key={user._id} user={user} />
          ))}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            <span className="text-sm text-gray-600">
              Page {currentPage} of {pagination.pages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
              disabled={currentPage === pagination.pages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <UserModal
          user={selectedUser}
          onClose={() => {
            setShowUserModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}

export default AdminUsers;