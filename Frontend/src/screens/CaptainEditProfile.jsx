import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Card } from "../components/ui";
import axios from "axios";
import { useCaptain } from "../contexts/CaptainContext";
import { ArrowLeft, User, Camera, X, CheckCircle, AlertCircle, Car, Bell, Shield } from "lucide-react";
import { Header } from "../components/layout";
import { Sidebar } from "../components/layout";
import { useNavigation } from "../hooks/useNavigation";

function CaptainEditProfile() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { captain, setCaptain } = useCaptain();
  
  // Navigation hook
  const { 
    sidebarOpen, 
    currentPath, 
    openSidebar, 
    closeSidebar, 
    navigateTo, 
    handleLogout 
  } = useNavigation();

  // State management
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [initialized, setInitialized] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  
  // Form fields
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    phone: '',
    vehicleColor: '',
    vehicleNumber: '',
    vehicleCapacity: '',
    vehicleType: ''
  });

  // Initialize form data when captain loads (only once)
  useEffect(() => {
    if (captain?.fullname && !initialized) {
      setFormData({
        firstname: captain.fullname.firstname || '',
        lastname: captain.fullname.lastname || '',
        phone: captain.phone || '',
        vehicleColor: captain.vehicle?.color || '',
        vehicleNumber: captain.vehicle?.number || '',
        vehicleCapacity: captain.vehicle?.capacity || '',
        vehicleType: captain.vehicle?.type || ''
      });
      setInitialized(true);
    }
  }, [captain, initialized]);

  // Load local profile picture on component mount
  useEffect(() => {
    if (captain?._id && !captain.profilePictureLocal) {
      const localImage = getLocalProfilePicture(captain._id);
      if (localImage && localImage !== captain.profilePicture) {
        console.log('Found local profile picture for captain, updating context');
        const updatedCaptain = {
          ...captain,
          profilePicture: localImage,
          profilePictureLocal: true,
          _lastUpdated: Date.now()
        };
        setCaptain(updatedCaptain);
      }
    }
  }, [captain?._id]);

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Show message helper
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // Local profile picture storage utilities
  const saveProfilePictureLocally = (file, captainId) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target.result;
        const profilePictureKey = `captainProfilePicture_${captainId}`;
        const profilePictureInfo = {
          data: imageData,
          filename: file.name,
          type: file.type,
          size: file.size,
          lastModified: Date.now()
        };
        
        localStorage.setItem(profilePictureKey, JSON.stringify(profilePictureInfo));
        console.log('Captain profile picture saved locally:', profilePictureKey);
        resolve(imageData);
      };
      reader.readAsDataURL(file);
    });
  };

  const getLocalProfilePicture = (captainId) => {
    const profilePictureKey = `captainProfilePicture_${captainId}`;
    const stored = localStorage.getItem(profilePictureKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.data; // Return the base64 data URL
      } catch (error) {
        console.error('Error parsing stored captain profile picture:', error);
        return null;
      }
    }
    return null;
  };

  const removeLocalProfilePicture = (captainId) => {
    const profilePictureKey = `captainProfilePicture_${captainId}`;
    localStorage.removeItem(profilePictureKey);
    console.log('Local captain profile picture removed:', profilePictureKey);
  };

  // Save profile changes
  const handleSave = async () => {
    console.log('Captain save button clicked');
    
    // Validation
    if (!formData.firstname.trim() || !formData.lastname.trim() || !formData.phone.trim()) {
      showMessage('error', 'Please fill in all required fields');
      return;
    }
    
    if (!token) {
      showMessage('error', 'Please login again');
      navigate('/captain/login');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Sending captain update request...');
      
      const captainData = {
        fullname: {
          firstname: formData.firstname.trim(),
          lastname: formData.lastname.trim()
        },
        phone: formData.phone.trim(),
        vehicle: {
          color: formData.vehicleColor.trim(),
          number: formData.vehicleNumber.trim(),
          capacity: parseInt(formData.vehicleCapacity) || 1,
          type: formData.vehicleType.toLowerCase()
        }
      };
      
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/captain/update`,
        { captainData },
        {
          headers: { token: token }
        }
      );
      
      console.log('Captain update response:', response.data);
      
      if (response.data?.captain) {
        console.log('Updating captain context...');
        
        // Update captain context with a small delay to prevent issues
        setTimeout(() => {
          setCaptain(response.data.captain);
        }, 100);
        
        // Update localStorage
        const userData = JSON.parse(localStorage.getItem("userData") || '{}');
        if (userData) {
          userData.data = response.data.captain;
          localStorage.setItem("userData", JSON.stringify(userData));
        }
        
        showMessage('success', 'Profile updated successfully!');
        console.log('Captain profile update completed successfully');
      }
      
    } catch (error) {
      console.error('Captain profile update error:', error);
      console.error('Error response:', error.response);
      const errorMsg = error.response?.data?.message || 'Failed to update profile';
      showMessage('error', errorMsg);
    } finally {
      setLoading(false);
      console.log('Captain save operation finished');
    }
  };

  // Profile picture upload (local storage)
  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('Captain file selected:', file.name, file.type, file.size);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showMessage('error', 'Please select an image file (JPG, PNG, GIF, WebP)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showMessage('error', 'File too large. Please select an image smaller than 5MB');
      return;
    }

    try {
      setUploading(true);
      setIsUpdatingProfile(true);
      console.log('Processing captain image locally...');
      
      // Save image locally first
      const imageDataUrl = await saveProfilePictureLocally(file, captain._id);
      console.log('Captain image saved locally, data URL length:', imageDataUrl.length);
      
      // Create updated captain object with proper structure
      const updatedCaptain = {
        ...captain,
        profilePicture: imageDataUrl,
        profilePictureLocal: true,
        _lastUpdated: Date.now()
      };
      
      console.log('Preparing to update captain context...');
      
      // Update localStorage first to ensure data persistence
      const userData = JSON.parse(localStorage.getItem("userData") || '{}');
      if (userData && userData.type === "captain") {
        userData.data = updatedCaptain;
        localStorage.setItem("userData", JSON.stringify(userData));
        console.log('Updated localStorage with new captain profile picture');
      }
      
      // Use requestAnimationFrame for smoother updates
      requestAnimationFrame(() => {
        console.log('Updating captain context with local image');
        setCaptain(updatedCaptain);
        
        // Use another frame for event dispatching
        requestAnimationFrame(() => {
          window.dispatchEvent(new CustomEvent('captainProfileUpdated', { 
            detail: { captain: updatedCaptain } 
          }));
          console.log('Dispatched captain profile update event');
          
          showMessage('success', 'Profile picture updated successfully!');
          console.log('Local captain profile picture update completed');
          
          // Reset states after everything is done
          setTimeout(() => {
            setIsUpdatingProfile(false);
            setUploading(false);
          }, 100);
        });
      });
      
    } catch (error) {
      console.error('Local captain upload error:', error);
      showMessage('error', 'Failed to process profile picture');
      setIsUpdatingProfile(false);
      setUploading(false);
    } finally {
      // Clear the input value to allow re-uploading the same file
      event.target.value = '';
    }
  };

  // Remove profile picture (local)
  const handleRemoveProfilePicture = async () => {
    if (!confirm('Are you sure you want to remove your profile picture?')) {
      return;
    }

    try {
      setUploading(true);
      console.log('Removing local captain profile picture...');
      
      // Remove from local storage first
      removeLocalProfilePicture(captain._id);
      
      // Create updated captain object
      const updatedCaptain = {
        ...captain,
        profilePicture: null,
        profilePictureLocal: false,
        _lastUpdated: Date.now()
      };
      
      // Update localStorage first
      const userData = JSON.parse(localStorage.getItem("userData") || '{}');
      if (userData && userData.type === "captain") {
        userData.data = updatedCaptain;
        localStorage.setItem("userData", JSON.stringify(userData));
        console.log('Updated localStorage - removed captain profile picture');
      }
      
      // Use stable update approach
      setTimeout(() => {
        console.log('Updating captain context - removing profile picture');
        setCaptain(updatedCaptain);
        
        // Dispatch events after captain context is updated
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('captainProfileUpdated', { 
            detail: { captain: updatedCaptain } 
          }));
          console.log('Dispatched captain profile removal event');
        }, 50);
        
        showMessage('success', 'Profile picture removed successfully!');
        console.log('Local captain profile picture removal completed');
      }, 100);
      
    } catch (error) {
      console.error('Captain remove error:', error);
      const errorMsg = error.response?.data?.message || 'Failed to remove profile picture';
      showMessage('error', errorMsg);
    } finally {
      // Delay the loading state reset
      setTimeout(() => {
        setUploading(false);
      }, 200);
    }
  };
  // Add error boundary protection
  if (!captain || !captain.fullname) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading captain data...</p>
        </div>
      </div>
    );
  }

  // Show processing overlay during profile updates to prevent blank pages
  if (isUpdatingProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Keep the basic structure but show overlay */}
        <div className="relative">
          {/* Sidebar */}
          <Sidebar 
            isOpen={sidebarOpen}
            onClose={closeSidebar}
            user={captain}
            userType="captain"
            onNavigate={navigateTo}
            currentPath={currentPath}
            onLogout={handleLogout}
          />

          {/* Header */}
          <Header
            title="Edit Profile"
            showMenu={true}
            showNotifications={true}
            user={captain}
            onMenuClick={openSidebar}
            onNotificationClick={() => navigateTo('/captain/notifications')}
            onProfileClick={() => {}}
          />
          
          {/* Processing Overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Updating profile picture...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        user={captain}
        userType="captain"
        onNavigate={navigateTo}
        currentPath={currentPath}
        onLogout={handleLogout}
      />

      {/* Header */}
      <Header
        title="Edit Profile"
        showMenu={true}
        showNotifications={true}
        user={captain}
        onMenuClick={openSidebar}
        onNotificationClick={() => navigateTo('/captain/notifications')}
        onProfileClick={() => {}}
      />
      
      {/* Back Button */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Message Display */}
          {message.text && (
            <div className={`
              p-4 rounded-lg border flex items-center space-x-3
              ${message.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
              }
            `}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          )}
          
          {/* Profile Picture */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Picture</h3>
            
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
                  {captain?.profilePicture ? (
                    <img 
                      src={captain.profilePicture.startsWith('data:') 
                        ? captain.profilePicture // Local data URL
                        : captain.profilePicture.startsWith('http') 
                          ? `${captain.profilePicture}?t=${captain._lastUpdated || Date.now()}`
                          : `${import.meta.env.VITE_SERVER_URL}${captain.profilePicture}?t=${captain._lastUpdated || Date.now()}`
                      } 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      key={captain._lastUpdated || captain._id}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* Remove button */}
                {captain?.profilePicture && !uploading && (
                  <button
                    onClick={handleRemoveProfilePicture}
                    className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
                
                {uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-3">
                  Upload a profile picture to help riders identify you during pickups. Maximum size: 5MB.
                </p>
                
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    className="hidden"
                    disabled={uploading}
                    id="captain-profile-picture-upload"
                  />
                  <label 
                    htmlFor="captain-profile-picture-upload"
                    className={`
                      inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium
                      ${uploading 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white text-gray-700 hover:bg-gray-50 cursor-pointer'
                      }
                      transition-colors duration-200
                    `}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    {uploading ? 'Uploading...' : captain?.profilePicture ? 'Change Photo' : 'Upload Photo'}
                  </label>
                </div>
              </div>
            </div>
          </Card>

          {/* Personal Information */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
            
            <div className="space-y-4">
              {/* Email (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={captain?.email || ''}
                  disabled={true}
                  className="bg-gray-100"
                />
              </div>
              
              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <Input
                    value={formData.firstname}
                    onChange={(e) => handleInputChange('firstname', e.target.value)}
                    placeholder="Enter your first name"
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <Input
                    value={formData.lastname}
                    onChange={(e) => handleInputChange('lastname', e.target.value)}
                    placeholder="Enter your last name"
                    disabled={loading}
                  />
                </div>
              </div>
              
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                  disabled={loading}
                />
              </div>
            </div>
          </Card>

          {/* Vehicle Information */}
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Car className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-medium text-gray-900">Vehicle Information</h3>
            </div>
            
            <div className="space-y-4">
              {/* Vehicle Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Type *
                </label>
                <select
                  value={formData.vehicleType}
                  onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  disabled={loading}
                >
                  <option value="">Select vehicle type</option>
                  <option value="car">Car</option>
                  <option value="bike">Bike</option>
                  <option value="auto">Auto</option>
                </select>
              </div>

              {/* Vehicle Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Number *
                </label>
                <Input
                  value={formData.vehicleNumber}
                  onChange={(e) => handleInputChange('vehicleNumber', e.target.value)}
                  placeholder="Enter vehicle number (e.g., MH12AB1234)"
                  disabled={loading}
                />
              </div>

              {/* Vehicle Color and Capacity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Color *
                  </label>
                  <Input
                    value={formData.vehicleColor}
                    onChange={(e) => handleInputChange('vehicleColor', e.target.value)}
                    placeholder="Enter vehicle color"
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Seating Capacity *
                  </label>
                  <Input
                    type="number"
                    value={formData.vehicleCapacity}
                    onChange={(e) => handleInputChange('vehicleCapacity', e.target.value)}
                    placeholder="Enter seating capacity"
                    min="1"
                    max="8"
                    disabled={loading}
                  />
                </div>
              </div>
              
              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSave}
                  disabled={loading || uploading}
                  className="px-8"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}

export default CaptainEditProfile;
