import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Car,
  Search,
  Eye,
  UserCheck,
  UserX,
  ArrowLeft,
  RefreshCw,
  Shield,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { Card, Button, Input } from "../components/ui";
import { formatCurrency } from "../utils/currency";
import axios from "axios";
import Console from "../utils/console";

function AdminCaptains() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [captains, setCaptains] = useState([]);
  const [pagination, setPagination] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCaptain, setSelectedCaptain] = useState(null);
  const [showCaptainModal, setShowCaptainModal] = useState(false);

  useEffect(() => {
    fetchCaptains();
  }, [currentPage, searchTerm]);

  const fetchCaptains = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
      
      const response = await axios.get(`${serverUrl}/admin/captains`, {
        headers: { token },
        params: {
          page: currentPage,
          limit: 10,
          search: searchTerm
        }
      });

      setCaptains(response.data.captains);
      setPagination(response.data.pagination);
    } catch (error) {
      Console.error("Error fetching captains:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCaptainStatusToggle = async (captainId, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
      
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      
      await axios.patch(`${serverUrl}/admin/captains/${captainId}/status`, {
        status: newStatus
      }, {
        headers: { token }
      });

      // Refresh captains list
      fetchCaptains();
    } catch (error) {
      Console.error("Error updating captain status:", error);
    }
  };

  const handleVerifyCaptain = async (captainId, isVerified) => {
    try {
      const token = localStorage.getItem("token");
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
      
      await axios.patch(`${serverUrl}/admin/captains/${captainId}/verify`, {
        isVerified: !isVerified,
        verificationNotes: !isVerified ? "Verified by admin" : "Verification removed by admin"
      }, {
        headers: { token }
      });

      // Refresh captains list
      fetchCaptains();
    } catch (error) {
      Console.error("Error updating captain verification:", error);
    }
  };

  const handleViewCaptain = async (captainId) => {
    try {
      const token = localStorage.getItem("token");
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
      
      const response = await axios.get(`${serverUrl}/admin/captains/${captainId}`, {
        headers: { token }
      });

      setSelectedCaptain(response.data.captain);
      setShowCaptainModal(true);
    } catch (error) {
      Console.error("Error fetching captain details:", error);
    }
  };

  const CaptainCard = ({ captain }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Car className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {captain.fullname?.firstname} {captain.fullname?.lastname}
            </h3>
            <p className="text-sm text-gray-600">{captain.email}</p>
            <p className="text-sm text-gray-500">{captain.phone}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            captain.status === "active" 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {captain.status === "active" ? 'Active' : 'Inactive'}
          </span>
          
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            captain.isVerified 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {captain.isVerified ? 'Verified' : 'Pending'}
          </span>
          
          <div className="flex space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewCaptain(captain._id)}
            >
              <Eye className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleVerifyCaptain(captain._id, captain.isVerified)}
              className={captain.isVerified ? 'text-yellow-600 hover:bg-yellow-50' : 'text-blue-600 hover:bg-blue-50'}
            >
              {captain.isVerified ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCaptainStatusToggle(captain._id, captain.status)}
              className={captain.status === "active" ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}
            >
              {captain.status === "active" ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Vehicle</p>
          <p className="font-medium">
            {captain.vehicle?.type} - {captain.vehicle?.color}
          </p>
        </div>
        <div>
          <p className="text-gray-500">License Plate</p>
          <p className="font-medium">{captain.vehicle?.number}</p>
        </div>
        <div>
          <p className="text-gray-500">Joined</p>
          <p className="font-medium">
            {new Date(captain.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Total Rides</p>
          <p className="font-medium">{captain.rides?.length || 0}</p>
        </div>
      </div>
    </motion.div>
  );

  const CaptainModal = ({ captain, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Captain Details</h2>
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
                  <p className="font-medium">{captain.fullname?.firstname} {captain.fullname?.lastname}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{captain.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{captain.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    captain.status === "active" 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {captain.status === "active" ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Vehicle Info */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Vehicle Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Vehicle Type</p>
                  <p className="font-medium">{captain.vehicle?.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Color</p>
                  <p className="font-medium">{captain.vehicle?.color}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">License Plate</p>
                  <p className="font-medium">{captain.vehicle?.number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Capacity</p>
                  <p className="font-medium">{captain.vehicle?.capacity} passengers</p>
                </div>
              </div>
            </div>
            
            {/* Verification Status */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Verification Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Verification Status</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    captain.isVerified 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {captain.isVerified ? 'Verified' : 'Pending Verification'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email Verified</p>
                  <p className={`font-medium ${captain.emailVerified ? 'text-green-600' : 'text-red-600'}`}>
                    {captain.emailVerified ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Account Info */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Account Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Joined Date</p>
                  <p className="font-medium">{new Date(captain.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-medium">{new Date(captain.updatedAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Rides</p>
                  <p className="font-medium">{captain.rides?.length || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Socket ID</p>
                  <p className="font-medium text-xs">{captain.socketId || 'Not connected'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading captains...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">Captain Management</h1>
                <p className="text-gray-600">Manage and verify driver accounts</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                onClick={fetchCaptains}
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
                  placeholder="Search captains by name, email, phone, or vehicle..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Captains List */}
        <div className="space-y-4 mb-6">
          {captains.map((captain) => (
            <CaptainCard key={captain._id} captain={captain} />
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

      {/* Captain Details Modal */}
      {showCaptainModal && selectedCaptain && (
        <CaptainModal
          captain={selectedCaptain}
          onClose={() => {
            setShowCaptainModal(false);
            setSelectedCaptain(null);
          }}
        />
      )}
    </div>
  );
}

export default AdminCaptains;