import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Card } from "../components/ui";
import axios from "axios";
import { useUser } from "../contexts/UserContext";
import { ArrowLeft, User, Camera, X, CheckCircle, AlertCircle } from "lucide-react";
import { Header } from "../components/layout";
import { Sidebar } from "../components/layout";
import { useNavigation } from "../hooks/useNavigation";

function UserEditProfile() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  
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
    phone: ''
  });

  // Initialize form data when user loads (only once)
  useEffect(() => {
    if (user?.fullname && !initialized) {
      setFormData({
        firstname: user.fullname.firstname || '',
        lastname: user.fullname.lastname || '',
        phone: user.phone || ''
      });
      setInitialized(true);
    }
  }, [user, initialized]);

  // Load local profile picture on component mount
  useEffect(() => {
    if (user?._id && !user.profilePictureLocal) {
      const localImage = getLocalProfilePicture(user._id);
      if (localImage && localImage !== user.profilePicture) {
        console.log('Found local profile picture, updating user context');
        const updatedUser = {
          ...user,
          profilePicture: localImage,
          profilePictureLocal: true,
          _lastUpdated: Date.now()
        };
        setUser(updatedUser);
      }
    }
  }, [user?._id]);

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

  // Save profile changes
  const handleSave = async () => {
    console.log('Save button clicked');
    
    // Validation
    if (!formData.firstname.trim() || !formData.lastname.trim() || !formData.phone.trim()) {
      showMessage('error', 'Please fill in all fields');
      return;
    }
    
    if (!token) {
      showMessage('error', 'Please login again');
      navigate('/login');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Sending update request...');
      
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/user/update`,
        {
          fullname: {
            firstname: formData.firstname.trim(),
            lastname: formData.lastname.trim()
          },
          phone: formData.phone.trim()
        },
        {
          headers: { token: token }
        }
      );
      
      console.log('Update response:', response.data);
      
      if (response.data?.user) {
        console.log('Updating user context...');
        
        // Update user context with a small delay to prevent issues
        setTimeout(() => {
          setUser(response.data.user);
        }, 100);
        
        // Update localStorage
        const userData = JSON.parse(localStorage.getItem("userData") || '{}');
        if (userData) {
          userData.data = response.data.user;
          localStorage.setItem("userData", JSON.stringify(userData));
        }
        
        showMessage('success', 'Profile updated successfully!');
        console.log('Profile update completed successfully');
      }
      
    } catch (error) {
      console.error('Profile update error:', error);
      console.error('Error response:', error.response);
      const errorMsg = error.response?.data?.message || 'Failed to update profile';
      showMessage('error', errorMsg);
    } finally {
      setLoading(false);
      console.log('Save operation finished');
    }
  };

  // Local profile picture storage utilities
  const saveProfilePictureLocally = (file, userId) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target.result;
        const profilePictureKey = `profilePicture_${userId}`;
        const profilePictureInfo = {
          data: imageData,
          filename: file.name,
          type: file.type,
          size: file.size,
          lastModified: Date.now()
        };
        
        localStorage.setItem(profilePictureKey, JSON.stringify(profilePictureInfo));
        console.log('Profile picture saved locally:', profilePictureKey);
        resolve(imageData);
      };
      reader.readAsDataURL(file);
    });
  };

  const getLocalProfilePicture = (userId) => {
    const profilePictureKey = `profilePicture_${userId}`;
    const stored = localStorage.getItem(profilePictureKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.data; // Return the base64 data URL
      } catch (error) {
        console.error('Error parsing stored profile picture:', error);
        return null;
      }
    }
    return null;
  };

  const removeLocalProfilePicture = (userId) => {
    const profilePictureKey = `profilePicture_${userId}`;
    localStorage.removeItem(profilePictureKey);
    console.log('Local profile picture removed:', profilePictureKey);
  };

  // Profile picture upload (local storage)
  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('File selected:', file.name, file.type, file.size);

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
      console.log('Processing image locally...');
      
      // Save image locally first
      const imageDataUrl = await saveProfilePictureLocally(file, user._id);
      console.log('Image saved locally, data URL length:', imageDataUrl.length);
      
      // Create updated user object with proper structure
      const updatedUser = {
        ...user,
        profilePicture: imageDataUrl,
        profilePictureLocal: true,
        _lastUpdated: Date.now()
      };
      
      console.log('Preparing to update user context...');
      
      // Update localStorage first to ensure data persistence
      const userData = JSON.parse(localStorage.getItem("userData") || '{}');
      if (userData && userData.type === "user") {
        userData.data = updatedUser;
        localStorage.setItem("userData", JSON.stringify(userData));
        console.log('Updated localStorage with new profile picture');
      }
      
      // Use requestAnimationFrame for smoother updates
      requestAnimationFrame(() => {
        console.log('Updating user context with local image');
        setUser(updatedUser);
        
        // Use another frame for event dispatching
        requestAnimationFrame(() => {
          window.dispatchEvent(new CustomEvent('userProfileUpdated', { 
            detail: { user: updatedUser } 
          }));
          console.log('Dispatched profile update event');
          
          showMessage('success', 'Profile picture updated successfully!');
          console.log('Local profile picture update completed');
          
          // Reset states after everything is done
          setTimeout(() => {
            setIsUpdatingProfile(false);
            setUploading(false);
          }, 100);
        });
      });
      
    } catch (error) {
      console.error('Local upload error:', error);
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
      console.log('Removing local profile picture...');
      
      // Remove from local storage first
      removeLocalProfilePicture(user._id);
      
      // Create updated user object
      const updatedUser = {
        ...user,
        profilePicture: null,
        profilePictureLocal: false,
        _lastUpdated: Date.now()
      };
      
      // Update localStorage first
      const userData = JSON.parse(localStorage.getItem("userData") || '{}');
      if (userData && userData.type === "user") {
        userData.data = updatedUser;
        localStorage.setItem("userData", JSON.stringify(userData));
        console.log('Updated localStorage - removed profile picture');
      }
      
      // Use stable update approach
      setTimeout(() => {
        console.log('Updating user context - removing profile picture');
        setUser(updatedUser);
        
        // Dispatch events after user context is updated
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('userProfileUpdated', { 
            detail: { user: updatedUser } 
          }));
          console.log('Dispatched profile removal event');
        }, 50);
        
        showMessage('success', 'Profile picture removed successfully!');
        console.log('Local profile picture removal completed');
      }, 100);
      
    } catch (error) {
      console.error('Remove error:', error);
      showMessage('error', 'Failed to remove profile picture');
    } finally {
      // Delay the loading state reset
      setTimeout(() => {
        setUploading(false);
      }, 200);
    }
  };

  // Add error boundary protection
  if (!user || !user.fullname) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
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
            user={user}
            userType="user"
            onNavigate={navigateTo}
            currentPath={currentPath}
            onLogout={handleLogout}
          />

          {/* Header */}
          <Header
            title="Edit Profile"
            showMenu={true}
            showNotifications={true}
            user={user}
            onMenuClick={openSidebar}
            onNotificationClick={() => navigateTo('/user/notifications')}
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
        user={user}
        userType="user"
        onNavigate={navigateTo}
        currentPath={currentPath}
        onLogout={handleLogout}
      />

      {/* Header */}
      <Header
        title="Edit Profile"
        showMenu={true}
        showNotifications={true}
        user={user}
        onMenuClick={openSidebar}
        onNotificationClick={() => navigateTo('/user/notifications')}
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
                  {user?.profilePicture ? (
                    <img 
                      src={
                        user.profilePicture.startsWith('data:') 
                          ? user.profilePicture // Local data URL
                          : user.profilePicture.startsWith('http') 
                            ? `${user.profilePicture}?t=${user._lastUpdated || Date.now()}`
                            : `${import.meta.env.VITE_SERVER_URL}${user.profilePicture}?t=${user._lastUpdated || Date.now()}`
                      } 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      key={user._lastUpdated || user._id}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* Remove button */}
                {user?.profilePicture && !uploading && (
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
                  Upload a profile picture to personalize your account. Maximum size: 5MB.
                </p>
                
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    className="hidden"
                    disabled={uploading}
                    id="profile-picture-upload"
                  />
                  <label 
                    htmlFor="profile-picture-upload"
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
                    {uploading ? 'Uploading...' : user?.profilePicture ? 'Change Photo' : 'Upload Photo'}
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
                  value={user?.email || ''}
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

export default UserEditProfile;