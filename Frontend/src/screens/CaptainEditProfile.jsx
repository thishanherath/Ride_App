import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button, Input, Card, FileUpload, Toggle, Select, Toast } from "../components/ui";
import { Container } from "../components/layout";
import axios from "axios";
import { useCaptain } from "../contexts/CaptainContext";
import { ArrowLeft, User, Car, Settings, Bell, Shield, HelpCircle } from "lucide-react";
import Console from "../utils/console";
import { useAlert } from "../hooks/useAlert";

function CaptainEditProfile() {
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [settings, setSettings] = useState({
    notifications: true,
    rideRequests: true,
    locationSharing: true,
    promotionalEmails: false,
  });
  const { alert, showAlert, hideAlert } = useAlert();

  const {
    handleSubmit,
    register,
    formState: { errors },
    setValue,
  } = useForm();

  const { captain } = useCaptain();
  const navigation = useNavigate();

  const updateUserProfile = async (data) => {
    const captainData = {
      fullname: {
        firstname: data.firstname,
        lastname: data.lastname,
      },
      phone: data.phone,
      vehicle: {
        color: data.color,
        number: data.number,
        capacity: data.capacity,
        type: data.type.toLowerCase(),
      },
    };
    
    Console.log(captainData);
    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/captain/update`,
        { captainData },
        {
          headers: {
            token: token,
          },
        }
      );
      Console.log(response);
      showAlert('Profile Updated', 'Your profile has been successfully updated', 'success');

      setTimeout(() => {
        navigation("/captain/home");
      }, 2000);
    } catch (error) {
      showAlert('Update Failed', error.response?.data?.[0]?.msg || 'Failed to update profile', 'error');
      Console.log(error.response);
      Console.log(error);
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
    if (captain) {
      setValue('firstname', captain.fullname?.firstname || '');
      setValue('lastname', captain.fullname?.lastname || '');
      setValue('phone', captain.phone || '');
      setValue('color', captain.vehicle?.color || '');
      setValue('number', captain.vehicle?.number || '');
      setValue('capacity', captain.vehicle?.capacity || '');
      setValue('type', captain.vehicle?.type || '');
    }
  }, [captain, setValue]);
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
                Upload a profile picture to help riders identify you during pickups.
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

        {/* Profile Information Form */}
        <form onSubmit={handleSubmit(updateUserProfile)} className="space-y-6">
          {/* Personal Information */}
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-orange-100 rounded-lg">
                <User className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
            </div>

            <div className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                value={captain?.email || ''}
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
            </div>
          </Card>

          {/* Vehicle Information */}
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Car className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Vehicle Information</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Select
                  label="Vehicle Type"
                  options={[
                    { value: 'car', label: 'Car' },
                    { value: 'bike', label: 'Bike' },
                    { value: 'auto', label: 'Auto' }
                  ]}
                  value={captain?.vehicle?.type || ''}
                  onChange={(value) => setValue('type', value)}
                  error={errors.type?.message}
                  placeholder="Select vehicle type"
                />
                <input
                  type="hidden"
                  {...register('type', { required: 'Vehicle type is required' })}
                />
              </div>

              <Input
                label="Vehicle Number"
                {...register('number', { 
                  required: 'Vehicle number is required',
                  minLength: { value: 4, message: 'Vehicle number must be at least 4 characters' }
                })}
                error={errors.number?.message}
                placeholder="Enter vehicle number (e.g., MH12AB1234)"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Vehicle Color"
                  {...register('color', { 
                    required: 'Vehicle color is required',
                    minLength: { value: 3, message: 'Color must be at least 3 characters' }
                  })}
                  error={errors.color?.message}
                  placeholder="Enter vehicle color"
                />
                <Input
                  label="Seating Capacity"
                  type="number"
                  {...register('capacity', { 
                    required: 'Capacity is required',
                    min: { value: 1, message: 'Capacity must be at least 1' },
                    max: { value: 8, message: 'Capacity cannot exceed 8' }
                  })}
                  error={errors.capacity?.message}
                  placeholder="Enter seating capacity"
                />
              </div>
            </div>
          </Card>

          {/* Submit Button */}
          <Card className="p-6">
            <div className="flex justify-end">
              <Button
                type="submit"
                loading={loading}
                className="px-8"
              >
                Save Changes
              </Button>
            </div>
          </Card>
        </form>

        {/* Notification Settings */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <Bell className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
          </div>

          <div className="space-y-4">
            <Toggle
              label="Push Notifications"
              description="Receive notifications about ride requests and important updates"
              checked={settings.notifications}
              onChange={(value) => handleSettingChange('notifications', value)}
            />
            
            <Toggle
              label="Ride Request Alerts"
              description="Get instant alerts when new ride requests are available"
              checked={settings.rideRequests}
              onChange={(value) => handleSettingChange('rideRequests', value)}
            />
            
            <Toggle
              label="Promotional Emails"
              description="Receive emails about earnings opportunities and new features"
              checked={settings.promotionalEmails}
              onChange={(value) => handleSettingChange('promotionalEmails', value)}
            />
          </div>
        </Card>

        {/* Privacy Settings */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Privacy & Security</h3>
          </div>

          <div className="space-y-4">
            <Toggle
              label="Location Sharing"
              description="Share your location with riders for better pickup coordination"
              checked={settings.locationSharing}
              onChange={(value) => handleSettingChange('locationSharing', value)}
            />
            
            <div className="pt-4 border-t border-gray-200">
              <Button 
                variant="outline" 
                className="w-full justify-center"
                onClick={() => navigation('/captain/change-password')}
              >
                Change Password
              </Button>
            </div>
          </div>
        </Card>

        {/* Help & Support */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <HelpCircle className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Help & Support</h3>
          </div>

          <div className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <p className="font-medium text-gray-900">Captain Support</p>
              <p className="text-sm text-gray-600">Get help with rides, earnings, or account issues</p>
            </button>
            
            <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <p className="font-medium text-gray-900">Earnings Guide</p>
              <p className="text-sm text-gray-600">Learn how to maximize your earnings</p>
            </button>
            
            <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <p className="font-medium text-gray-900">Terms of Service</p>
              <p className="text-sm text-gray-600">Read captain terms and conditions</p>
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

export default CaptainEditProfile;
