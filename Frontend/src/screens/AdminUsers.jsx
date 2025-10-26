import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Search,
  Filter,
  MoreVertical,
  User,
  Mail,
  Phone,
  Calendar,
  Eye,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Card, Button, Input } from "../components/ui";
import axios from "axios";
import Console from "../utils/console";

function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
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
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      Console.error("Error fetching users:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminData");
        navigate("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleUserClick = async (userId) => {
    try {
      const token = localStorage.getItem("adminToken");
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

  const handleStatusChange = async (userId, isActive) => {
    try {
      const token = localStorage.getItem("adminToken");
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
      
      await axios.patch(`${serverUrl}/admin/users/${userId}/status`, {
        isActive
      }, {
        headers: { token }
      });

      // Update local state
      setUsers(users.map(user => 
        user._id === userId ? { ...user, isActive } : user
      ));
      
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser({ ...selectedUser, isActive });
      }
    } catch (error) {
      Console.error("Error updating user status:", error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const UserCard = ({ user }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 cursor-pointer"
      onClick={() => handleUserClick(user._id)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {user.fullname?.firstname} {user.fullname?.lastname}
            </h3>
            <p className="text-sm text-gray-600">{user.email}</p>
            <p className="text-sm text-gray-500">{user.phone}</p>
          </div>
        </div>
        <div className="text-right">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {user.isActive ? 'Active' : 'Inactive'}
          </span>
          <p className="text-sm text-gray-500 mt-1">
            {formatDate(user.createdAt)}
          </p>
        </div>
      </div>
    </motion.div>
  );

  const UserModal = ({ user, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <User className="w-5 h-5 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">
                {user.fullname?.firstname} {user.fullname?.lastname}
              </p>
              <p className="text-sm text-gray-600">Full Name</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">{user.email}</p>
              <p className="text-sm text-gray-600">Email</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Phone className="w-5 h-5 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">{user.phone}</p>
              <p className="text-sm text-gray-600">Phone</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">{formatDate(user.createdAt)}</p>
              <p className="text-sm text-gray-600">Joined Date</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {user.isActive ? 'Active' : 'Inactive'}
            </span>
            <p className="text-sm text-gray-600">Status</p>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <Button
            onClick={() => handleStatusChange(user._id, !user.isActive)}
            variant={user.isActive ? "outline" : "default"}
            className={user.isActive ? "text-red-600 border-red-200 hover:bg-red-50" : ""}
          >
            {user.isActive ? (
              <>
                <UserX className="w-4 h-4 mr-2" />
                Deactivate
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4 mr-2" />
                Activate
              </>
            )}
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
          >
            Close
          </Button>
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
              <button
                onClick={() => navigate(-1)}
                className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600">Manage user accounts and permissions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search users by name, email, or phone..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {users.map((user) => (
            <UserCard key={user._id} user={user} />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* User Modal */}
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
