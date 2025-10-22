import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button, Input, Card, FileUpload, Toggle, Toast } from "../components/ui";
import { Container, Header } from "../components/layout";
import axios from "axios";
import { useUser } from "../contexts/UserContext";
import { ArrowLeft, User, Settings, Bell, Shield, HelpCircle } from "lucide-react";
import Console from "../utils/console";
import { useAlert } from "../hooks/useAlert";

function UserEditProfile() {
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(false);
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

  const { user } = useUser();
  const navigation = useNavigate();

  const updateUserProfile = async (data) => {
    const userData = {
      fullname: {
        firstname: data.firstname,
        lastname: data.lastname,
      },
      phone: data.phone,
    };
    
    Console.log(userData);
    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/user/update`,
        userData,
        {
          headers: {
            token: token,
          },
        }
      );
      Console.log(response);
      showAlert('Profile Updated', 'Your profile has been successfully updated', 'success');

      setTimeout(() => {
        navigation("/home");
      }, 2000);
    } catch (error) {
      showAlert('Update Failed', error.response?.data?.[0]?.msg || 'Failed to update profile', 'error');
      Console.log(error.response);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  useEffect(() => {
    if (user) {
      setValue('firstname', user.fullname?.firstname || '');
      setValue('lastname', user.fullname?.lastname || '');
      setValue('phone', user.phone || '');
    }
  }, [user, setValue]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <Container>
          <div className="flex items-center justify-between py-4">
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
        </Container>
      </div>

      <Container className="py-6 space-y-6">
        {/* Profile Picture Section */}
        <Card className="p-6">
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              <FileUpload
                preview={true}
                value={profilePicture}
                onChange={setProfilePicture}
                accept="image/*"
                className="w-24 h-24"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Picture</h3>
              <p className="text-sm text-gray-600 mb-4">
                Upload a profile picture to personalize your account. This helps captains identify you during rides.
              </p>
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => document.querySelector('input[type="file"]')?.click()}
                >
                  Change Photo
                </Button>
                {profilePicture && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setProfilePicture(null)}
                  >
                    Remove
                  </Button>
                )}
              </div>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </Container>

      {/* Toast Notifications */}
      {alert.isVisible && (
        <Toast
          type={alert.type}
          message={alert.text}
          onClose={hideAlert}
        />
      )}
    </div>
  );
}

export default UserEditProfile;
