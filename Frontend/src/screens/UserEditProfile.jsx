import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button, Input, Card, FileUpload, Toggle, Toast } from "../components/ui";
import axios from "axios";
import { useUser } from "../contexts/UserContext";
import { ArrowLeft, User, Settings, Bell, Shield, HelpCircle, X } from "lucide-react";
import Console from "../utils/console";
import { useAlert } from "../hooks/useAlert";

function UserEditProfile() {
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [settings, setSettings] = useState({
    notifications: true,
    locationSharing: true,
    rideReminders: true,
    promotionalEmails: false,
  });
  const { alert, showAlert, hideAlert } = useAlert();

  const {
    handleSubmit,
    register,
    formState: { errors },
    setValue,
  } = useForm();

  const { user, setUser } = useUser();
  const navigation = useNavigate();

  const updateUserProfile = async (data) => {
    try {
      setLoading(true);
      Console.log('🔄 Starting profile update...');
      Console.log('Form data received:', data);
      Console.log('Current user:', user);
      Console.log('Token present:', !!token);
      
      // Validate required data
      if (!data.firstname || !data.lastname || !data.phone) {
        showAlert('Validation Error', 'Please fill in all required fields', 'error');
        return;
      }
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('fullname[firstname]', data.firstname);
      formData.append('fullname[lastname]', data.lastname);
      formData.append('phone', data.phone);
      
      // Add profile picture if selected
      if (profilePicture && typeof profilePicture !== 'string') {
        formData.append('profilePicture', profilePicture);
        Console.log('Adding profile picture to form data');
      }
      
      Console.log('Sending request to:', `${import.meta.env.VITE_SERVER_URL}/user/update`);
      
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/user/update`,
        formData,
        {
          headers: {
            token: token,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      Console.log('✅ Profile update response:', response.data);
      
      // Update user context with new data
      if (response.data.user) {
        // Update localStorage
        const userData = JSON.parse(localStorage.getItem("userData") || '{}');
        if (userData) {
          userData.data = response.data.user;
          localStorage.setItem("userData", JSON.stringify(userData));
          Console.log('Updated localStorage with new user data');
        }
        
        // Update user context
        setUser(response.data.user);
        Console.log('Updated user context');
      }
      
      showAlert('Profile Updated', 'Your profile has been successfully updated', 'success');
      Console.log('✅ Profile update completed successfully');

      // Navigate back after showing success message
      setTimeout(() => {
        Console.log('Navigating back to home...');
        // Use replace to avoid navigation stack issues
        navigation("/home", { replace: true });
      }, 2000);
      
    } catch (error) {
      Console.log('❌ Profile update error:', error);
      Console.log('Error response:', error.response?.data);
      Console.log('Error status:', error.response?.status);
      
      let errorMessage = 'Failed to update profile';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.[0]?.msg) {
        errorMessage = error.response.data[0].msg;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showAlert('Update Failed', errorMessage, 'error');
    } finally {
      setLoading(false);
      Console.log('Profile update process completed');
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Helper function to get correct profile picture URL
  const getProfilePictureUrl = (picture) => {
    Console.log('🔍 Getting profile picture URL for:', picture);
    
    if (!picture) {
      Console.log('❌ No picture provided');
      return null;
    }
    
    // If it's a File object, create object URL
    if (picture instanceof File) {
      const url = URL.createObjectURL(picture);
      Console.log('📁 File object detected, created URL:', url);
      return url;
    }
    
    // If it's already a full URL, return as is
    if (typeof picture === 'string' && picture.startsWith('http')) {
      Console.log('🌐 Full URL detected:', picture);
      return picture;
    }
    
    // If it's a relative path, prepend server URL
    if (typeof picture === 'string') {
      const fullUrl = `${import.meta.env.VITE_SERVER_URL}${picture}`;
      Console.log('🔗 Relative path detected, creating full URL:', fullUrl);
      return fullUrl;
    }
    
    Console.log('❓ Unknown picture type:', typeof picture);
    return null;
  };

  // Enhanced profile picture change handler
  const handleProfilePictureChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      showAlert('Invalid File', 'Please select an image file', 'error');
      return;
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showAlert('File Too Large', 'Please select an image smaller than 5MB', 'error');
      return;
    }
    
    // Show preview immediately
    setProfilePicture(file);
    
    // Upload to server
    await uploadProfilePictureOnly(file);
  };

  const uploadProfilePictureOnly = async (file) => {
    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      Console.log('Uploading profile picture...');
      
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/user/upload-profile-picture`,
        formData,
        {
          headers: {
            token: token,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      Console.log('Profile picture upload response:', response.data);
      
      // Update user context with new profile picture
      if (response.data.user) {
        const userData = JSON.parse(localStorage.getItem("userData"));
        if (userData) {
          userData.data = response.data.user;
          localStorage.setItem("userData", JSON.stringify(userData));
        }
        
        // Update user context
        setUser(response.data.user);
        
        // Update local state with server URL
        setProfilePicture(response.data.profilePicture);
      }
      
      showAlert('Success', 'Profile picture updated successfully', 'success');
      
      return response.data.profilePicture;
    } catch (error) {
      Console.log('Profile picture upload error:', error);
      
      // Reset to previous state on error
      if (user?.profilePicture) {
        setProfilePicture(user.profilePicture);
      } else {
        setProfilePicture(null);
      }
      
      const errorMessage = error.response?.data?.message || 'Failed to upload profile picture';
      showAlert('Upload Failed', errorMessage, 'error');
      
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Remove profile picture function
  const removeProfilePicture = async () => {
    try {
      setUploading(true);
      
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/user/update`,
        {
          fullname: {
            firstname: user.fullname.firstname,
            lastname: user.fullname.lastname
          },
          phone: user.phone,
          removeProfilePicture: true
        },
        {
          headers: {
            token: token,
          },
        }
      );
      
      // Update user context
      if (response.data.user) {
        const userData = JSON.parse(localStorage.getItem("userData"));
        if (userData) {
          userData.data = response.data.user;
          localStorage.setItem("userData", JSON.stringify(userData));
        }
        
        setUser(response.data.user);
      }
      
      setProfilePicture(null);
      showAlert('Success', 'Profile picture removed successfully', 'success');
      
    } catch (error) {
      Console.log('Remove profile picture error:', error);
      showAlert('Error', 'Failed to remove profile picture', 'error');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (user) {
      Console.log('🔄 Loading user data into form:', user);
      setValue('firstname', user.fullname?.firstname || '');
      setValue('lastname', user.fullname?.lastname || '');
      setValue('phone', user.phone || '');
      
      // Set existing profile picture if available
      if (user.profilePicture) {
        Console.log('📸 Loading existing profile picture:', user.profilePicture);
        // Check if it's already a full URL or just a path
        if (user.profilePicture.startsWith('http')) {
          setProfilePicture(user.profilePicture);
        } else {
          setProfilePicture(`${import.meta.env.VITE_SERVER_URL}${user.profilePicture}`);
        }
      } else {
        Console.log('📸 No existing profile picture found');
        setProfilePicture(null);
      }
    }
  }, [user, setValue]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigation(-1)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Edit Profile</h1>
          </div>
        </div>
      </div>

      {/* Main Content with Responsive Layout */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Picture Section */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="flex-shrink-0">
              <div className="relative">
                {profilePicture ? (
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                      <img 
                        src={getProfilePictureUrl(profilePicture)} 
                        alt="Profile preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          Console.log('❌ Image load error for URL:', e.target.src);
                          Console.log('Original picture value:', profilePicture);
                          Console.log('Generated URL:', getProfilePictureUrl(profilePicture));
                          setProfilePicture(null);
                        }}
                        onLoad={(e) => {
                          Console.log('✅ Image loaded successfully:', e.target.src);
                        }}
                      />
                    </div>
                    {!uploading && (
                      <button
                        type="button"
                        onClick={removeProfilePicture}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                    {uploading && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div 
                    className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors"
                    onClick={() => document.getElementById('profile-upload')?.click()}
                  >
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <input
                  id="profile-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                  disabled={uploading}
                />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Picture</h3>
              <p className="text-sm text-gray-600 mb-4">
                Upload a profile picture to personalize your account. Maximum size: 5MB.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => document.getElementById('profile-upload')?.click()}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : profilePicture ? 'Change Photo' : 'Upload Photo'}
                </Button>
                {profilePicture && !uploading && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={removeProfilePicture}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Remove
                  </Button>
                )}
              </div>
              {uploading && (
                <div className="mt-2 text-sm text-blue-600 flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  Uploading profile picture...
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Personal Information */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-orange-100 rounded-lg">
              <User className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
          </div>

          <form onSubmit={handleSubmit(updateUserProfile)} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              value={user?.email || ''}
              disabled={true}
              className="bg-gray-100"
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name"
                {...register('firstname', { 
                  required: 'First name is required',
                  minLength: { value: 2, message: 'First name must be at least 2 characters' }
                })}
                error={errors.firstname?.message}
                placeholder="Enter your first name"
              />
              <Input
                label="Last Name"
                {...register('lastname', { 
                  required: 'Last name is required',
                  minLength: { value: 2, message: 'Last name must be at least 2 characters' }
                })}
                error={errors.lastname?.message}
                placeholder="Enter your last name"
              />
            </div>

            <Input
              label="Phone Number"
              type="tel"
              {...register('phone', { 
                required: 'Phone number is required',
                pattern: { 
                  value: /^[0-9]{10}$/, 
                  message: 'Please enter a valid 10-digit phone number' 
                }
              })}
              error={errors.phone?.message}
              placeholder="Enter your phone number"
            />

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                loading={loading}
                className="px-8"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Card>

        {/* Notification Settings */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
          </div>

          <div className="space-y-4">
            <Toggle
              label="Push Notifications"
              description="Receive notifications about ride updates and important information"
              checked={settings.notifications}
              onChange={(value) => handleSettingChange('notifications', value)}
            />
            
            <Toggle
              label="Ride Reminders"
              description="Get reminded about upcoming rides and booking confirmations"
              checked={settings.rideReminders}
              onChange={(value) => handleSettingChange('rideReminders', value)}
            />
            
            <Toggle
              label="Promotional Emails"
              description="Receive emails about special offers and new features"
              checked={settings.promotionalEmails}
              onChange={(value) => handleSettingChange('promotionalEmails', value)}
            />
          </div>
        </Card>

        {/* Privacy Settings */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Privacy & Security</h3>
          </div>

          <div className="space-y-4">
            <Toggle
              label="Location Sharing"
              description="Allow captains to see your location for better pickup experience"
              checked={settings.locationSharing}
              onChange={(value) => handleSettingChange('locationSharing', value)}
            />
            
            <div className="pt-4 border-t border-gray-200">
              <Button 
                variant="outline" 
                className="w-full justify-center"
                onClick={() => navigation('/change-password')}
              >
                Change Password
              </Button>
            </div>
          </div>
        </Card>

        {/* Help & Support */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <HelpCircle className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Help & Support</h3>
          </div>

          <div className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <p className="font-medium text-gray-900">Contact Support</p>
              <p className="text-sm text-gray-600">Get help with your account or rides</p>
            </button>
            
            <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <p className="font-medium text-gray-900">Privacy Policy</p>
              <p className="text-sm text-gray-600">Learn how we protect your data</p>
            </button>
            
            <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <p className="font-medium text-gray-900">Terms of Service</p>
              <p className="text-sm text-gray-600">Read our terms and conditions</p>
            </button>
          </div>
        </Card>
        </div>
      </div>

      {/* Toast Notifications */}
      <Toast
        type={alert.type}
        message={alert.text}
        isVisible={alert.isVisible}
        onClose={hideAlert}
      />
    </div>
  );
}

export default UserEditProfile;
