import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin,
  Search,
  Filter,
  Eye,
  ArrowLeft,
  RefreshCw,
  Calendar,
  Clock,
  User,
  Car,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { Card, Button, Input, Select } from "../components/ui";
import { formatCurrency } from "../utils/currency";
import axios from "axios";
import Console from "../utils/console";

function AdminRides() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rides, setRides] = useState([]);
  const [pagination, setPagination] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRide, setSelectedRide] = useState(null);
  const [showRideModal, setShowRideModal] = useState(false);

  useEffect(() => {
    fetchRides();
  }, [currentPage, searchTerm, statusFilter, dateFrom, dateTo]);

  const fetchRides = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
      
      const params = {
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo })
      };

      const response = await axios.get(`${serverUrl}/admin/rides`, {
        headers: { token },
        params
      });

      setRides(response.data.rides);
      setPagination(response.data.pagination);
    } catch (error) {
      Console.error("Error fetching rides:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRideStatusUpdate = async (rideId, newStatus, adminNotes = "") => {
    try {
      const token = localStorage.getItem("token");
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
      
      await axios.patch(`${serverUrl}/admin/rides/${rideId}/status`, {
        status: newStatus,
        adminNotes
      }, {
        headers: { token }
      });

      // Refresh rides list
      fetchRides();
      
      // Close modal if open
      if (showRideModal) {
        setShowRideModal(false);
        setSelectedRide(null);
      }
    } catch (error) {
      Console.error("Error updating ride status:", error);
    }
  };

  const handleViewRide = async (rideId) => {
    try {
      const token = localStorage.getItem("token");
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
      
      const response = await axios.get(`${serverUrl}/admin/rides/${rideId}`, {
        headers: { token }
      });

      setSelectedRide(response.data.ride);
      setShowRideModal(true);
    } catch (error) {
      Console.error("Error fetching ride details:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'ongoing':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'ongoing':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const RideCard = ({ ride }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              Ride #{ride._id.slice(-6)}
            </h3>
            <p className="text-sm text-gray-600">
              {new Date(ride.createdAt).toLocaleDateString()} at {new Date(ride.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ride.status)}`}>
            {getStatusIcon(ride.status)}
            <span className="ml-1 capitalize">{ride.status}</span>
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewRide(ride._id)}
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">Pickup Location</p>
          <p className="font-medium text-sm">{ride.pickup}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Destination</p>
          <p className="font-medium text-sm">{ride.destination}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-gray-500">User</p>
            <p className="font-medium">
              {ride.user?.fullname?.firstname} {ride.user?.fullname?.lastname}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Car className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-gray-500">Captain</p>
            <p className="font-medium">
              {ride.captain?.fullname?.firstname} {ride.captain?.fullname?.lastname || 'Not assigned'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-gray-500">Fare</p>
            <p className="font-medium">{formatCurrency(ride.fare)}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const RideModal = ({ ride, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Ride Details - #{ride._id.slice(-6)}
            </h2>
            <Button variant="outline" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
          
          <div className="space-y-6">
            {/* Status and Actions */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ride.status)}`}>
                  {getStatusIcon(ride.status)}
                  <span className="ml-2 capitalize">{ride.status}</span>
                </span>
                <span className="text-sm text-gray-600">
                  Created: {new Date(ride.createdAt).toLocaleString()}
                </span>
              </div>
              
              {ride.status !== 'completed' && ride.status !== 'cancelled' && (
                <div className="flex space-x-2">
                  {ride.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => handleRideStatusUpdate(ride._id, 'cancelled', 'Cancelled by admin')}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Cancel Ride
                    </Button>
                  )}
                  {ride.status === 'ongoing' && (
                    <Button
                      size="sm"
                      onClick={() => handleRideStatusUpdate(ride._id, 'completed', 'Completed by admin')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Mark Complete
                    </Button>
                  )}
                </div>
              )}
            </div>
            
            {/* Trip Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Trip Information</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Pickup Location</p>
                  <p className="font-medium">{ride.pickup}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Destination</p>
                  <p className="font-medium">{ride.destination}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Distance</p>
                    <p className="font-medium">{ride.distance || 'N/A'} km</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-medium">{ride.duration || 'N/A'} mins</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* User Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">User Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">
                    {ride.user?.fullname?.firstname} {ride.user?.fullname?.lastname}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{ride.user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{ride.user?.phone}</p>
                </div>
              </div>
            </div>
            
            {/* Captain Information */}
            {ride.captain && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Captain Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">
                      {ride.captain?.fullname?.firstname} {ride.captain?.fullname?.lastname}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{ride.captain?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{ride.captain?.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Vehicle</p>
                    <p className="font-medium">
                      {ride.captain?.vehicle?.type} - {ride.captain?.vehicle?.number}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Payment Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Payment Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Fare</p>
                  <p className="font-medium text-lg">{formatCurrency(ride.fare)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium">{ride.paymentMethod || 'Cash'}</p>
                </div>
              </div>
            </div>
            
            {/* Admin Notes */}
            {ride.adminNotes && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Admin Notes</h3>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {ride.adminNotes}
                </p>
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
          <p className="text-gray-600">Loading rides...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">Ride Management</h1>
                <p className="text-gray-600">Monitor and manage all ride requests</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                onClick={fetchRides}
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
        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by pickup, destination..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </Select>
            
            <Input
              type="date"
              placeholder="From Date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            
            <Input
              type="date"
              placeholder="To Date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </Card>

        {/* Rides List */}
        <div className="space-y-4 mb-6">
          {rides.map((ride) => (
            <RideCard key={ride._id} ride={ride} />
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

      {/* Ride Details Modal */}
      {showRideModal && selectedRide && (
        <RideModal
          ride={selectedRide}
          onClose={() => {
            setShowRideModal(false);
            setSelectedRide(null);
          }}
        />
      )}
    </div>
  );
}

export default AdminRides;