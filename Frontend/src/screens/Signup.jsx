import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft, ChevronRight, Car, Palette, Hash, Users } from "lucide-react";
import { Button, Input } from "../components/ui";
import { AuthLayout, TabSwitcher } from "../components/auth";
import axios from "axios";
import Console from "../utils/console";

function Signup() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "user");
  const [showPassword, setShowPassword] = useState(false);
  const [showVehiclePanel, setShowVehiclePanel] = useState(false);
  const [responseError, setResponseError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset
  } = useForm();

  // Reset form when switching tabs
  useEffect(() => {
    reset();
    setResponseError("");
    setShowVehiclePanel(false);
  }, [activeTab, reset]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (responseError) {
      const timer = setTimeout(() => {
        setResponseError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [responseError]);

  const signupUser = async (data) => {
    try {
      setLoading(true);
      setResponseError("");
      
      // Check if VITE_SERVER_URL is configured
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
      
      if (!import.meta.env.VITE_SERVER_URL) {
        console.warn('VITE_SERVER_URL is not set. Using default: http://localhost:4000');
      }
      
      // Debug: Log form data
      console.log("Form data received:", data);
      console.log("Active tab:", activeTab);
      
      let userData;
      let endpoint;

      if (activeTab === "user") {
        userData = {
          fullname: {
            firstname: data.firstname,
            lastname: data.lastname,
          },
          email: data.email,
          password: data.password,
          phone: data.phone
        };
        endpoint = "/user/register";
      } else if (activeTab === "driver") {
        userData = {
          fullname: {
            firstname: data.firstname,
            lastname: data.lastname,
          },
          email: data.email,
          password: data.password,
          phone: data.phone,
          vehicle: {
            color: data.color,
            number: data.number,
            capacity: parseInt(data.capacity),
            type: data.type,
          },
        };
        endpoint = "/captain/register";
      }

      // Debug: Log request details
      const requestUrl = `${serverUrl}${endpoint}`;
      console.log("Request URL:", requestUrl);
      console.log("Request data:", userData);

      const response = await axios.post(
        requestUrl,
        userData
      );

      // Debug: Log response
      console.log("Response received:", response.data);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userData", JSON.stringify({
        type: activeTab === "driver" ? "captain" : activeTab,
        data: activeTab === "driver" ? response.data.captain : response.data.user,
      }));

      navigate(activeTab === "user" ? "/home" : "/captain/home");
    } catch (error) {
      // Debug: Log error details
      console.error("Registration error:", error);
      console.error("Error response:", error.response);
      console.error("Error data:", error.response?.data);
      
      let errorMessage = "Registration failed. Please try again.";
      
      if (error.response?.data) {
        if (Array.isArray(error.response.data)) {
          errorMessage = error.response.data[0]?.msg || error.response.data[0]?.message || errorMessage;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        errorMessage = `Network error: ${error.message}`;
      }
      
      setResponseError(errorMessage);

      if (activeTab === "driver") {
        setShowVehiclePanel(false);
      }
      
      Console.log(error);
    } finally {
      setLoading(false);
    }
  };



  const vehicleTypes = [
    { value: "car", label: "Car" },
    { value: "bike", label: "Bike" },
    { value: "auto", label: "Auto" }
  ];

  return (
    <AuthLayout 
      title="Create your account" 
      subtitle="Join QuickRide and start your journey"
    >
      {/* Tab Switcher */}
      <TabSwitcher 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
      />

      {/* Signup Form */}
      <AnimatePresence mode="wait">
        <motion.form
          key={activeTab}
          onSubmit={handleSubmit(signupUser)}
          className="spacing-responsive-md"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Personal Information Panel */}
          {!showVehiclePanel && (
            <>
              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <Input
                  label="First name"
                  placeholder="John"
                  icon={<User className="w-5 h-5" />}
                  {...register("firstname", {
                    required: "First name is required",
                    minLength: {
                      value: 3,
                      message: "First name must be at least 3 characters"
                    }
                  })}
                  error={errors.firstname?.message}
                />
                <Input
                  label="Last name"
                  placeholder="Doe"
                  icon={<User className="w-5 h-5" />}
                  {...register("lastname", {
                    required: "Last name is required",
                    minLength: {
                      value: 2,
                      message: "Last name must be at least 2 characters"
                    }
                  })}
                  error={errors.lastname?.message}
                />
              </div>

              {/* Phone Number */}
              <Input
                label="Phone Number"
                type="tel"
                placeholder="Enter your phone number"
                icon={<Phone className="w-5 h-5" />}
                {...register("phone", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Please enter a valid 10-digit phone number"
                  }
                })}
                error={errors.phone?.message}
              />

              {/* Email */}
              <Input
                label="Email address"
                type="email"
                placeholder="Enter your email"
                icon={<Mail className="w-5 h-5" />}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Invalid email address"
                  }
                })}
                error={errors.email?.message}
              />

              {/* Password */}
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  icon={<Lock className="w-5 h-5" />}
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters"
                    }
                  })}
                  error={errors.password?.message}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {responseError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <p className="text-sm text-red-600 text-center">
                      {responseError}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Next/Submit Button */}
              {activeTab === "driver" ? (
                <Button
                  type="button"
                  onClick={handleSubmit(() => setShowVehiclePanel(true))}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 text-base font-semibold"
                  size="lg"
                >
                  Next: Vehicle Details
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  loading={loading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 text-base font-semibold"
                  size="lg"
                >
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              )}
            </>
          )}

          {/* Vehicle Information Panel (Driver only) */}
          {showVehiclePanel && activeTab === "driver" && (
            <>
              {/* Progress Indicator */}
              <div className="flex items-center justify-between mb-6">
                <button
                  type="button"
                  onClick={() => setShowVehiclePanel(false)}
                  className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </button>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-500 ml-2">Step 2 of 2</span>
                </div>
              </div>

              {/* Section Header */}
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Vehicle Information</h3>
                <p className="text-sm text-gray-600">Tell us about your vehicle to complete registration</p>
              </div>

              {/* Vehicle Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <Input
                  label="Vehicle Color"
                  placeholder="Red"
                  icon={<Palette className="w-5 h-5" />}
                  {...register("color", {
                    required: "Vehicle color is required",
                    minLength: {
                      value: 3,
                      message: "Vehicle color must be at least 3 characters"
                    }
                  })}
                  error={errors.color?.message}
                />
                <Input
                  label="Capacity"
                  type="number"
                  placeholder="4"
                  min="1"
                  max="8"
                  icon={<Users className="w-5 h-5" />}
                  {...register("capacity", {
                    required: "Vehicle capacity is required",
                    min: {
                      value: 1,
                      message: "Capacity must be at least 1"
                    },
                    max: {
                      value: 8,
                      message: "Capacity cannot exceed 8"
                    }
                  })}
                  error={errors.capacity?.message}
                />
              </div>

              <Input
                label="Vehicle Number"
                placeholder="MH12AB1234"
                icon={<Hash className="w-5 h-5" />}
                {...register("number", {
                  required: "Vehicle number is required",
                  minLength: {
                    value: 3,
                    message: "Vehicle number must be at least 3 characters"
                  }
                })}
                error={errors.number?.message}
              />

              {/* Vehicle Type Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Type
                </label>
                <div className="relative">
                  <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    {...register("type", {
                      required: "Vehicle type is required"
                    })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all duration-200 appearance-none"
                  >
                    <option value="">Select vehicle type</option>
                    {vehicleTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
                )}
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {responseError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <p className="text-sm text-red-600 text-center">
                      {responseError}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <Button
                type="submit"
                loading={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 text-base font-semibold"
                size="lg"
              >
                {loading ? "Creating account..." : "Create Driver Account"}
              </Button>
            </>
          )}

          {/* Login Link */}
          <p className="text-sm text-center text-gray-600">
            Already have an account?{" "}
            <Link 
              to="/login" 
              className="font-semibold text-orange-600 hover:text-orange-500 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </motion.form>
      </AnimatePresence>


    </AuthLayout>
  );
}

export default Signup;