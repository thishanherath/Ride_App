import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, LogIn } from "lucide-react";
import { Button, Input } from "../components/ui";
import { AuthLayout } from "../components/auth";

import axios from "axios";
import Console from "../utils/console";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [responseError, setResponseError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginStatus, setLoginStatus] = useState("");
  const navigate = useNavigate();

  const {
    handleSubmit,
    register,
    formState: { errors }
  } = useForm();

  // Clear error after 5 seconds
  useEffect(() => {
    if (responseError) {
      const timer = setTimeout(() => {
        setResponseError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [responseError]);

  // Test backend connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
        console.log("Testing backend connection to:", serverUrl);
        
        const response = await axios.get(`${serverUrl}/`);
        console.log("Backend connection successful:", response.data);
      } catch (error) {
        console.error("Backend connection failed:", error.message);
        if (error.code === 'ERR_NETWORK') {
          setResponseError("Cannot connect to server. Please make sure the backend is running on port 4000.");
        }
      }
    };
    
    testConnection();
  }, []);

  // Unified login function that tries all user types
  const loginUser = async (data) => {
    if (!data.email.trim() || !data.password.trim()) {
      setResponseError("Please enter both email and password");
      return;
    }

    try {
      setLoading(true);
      setResponseError("");
      setLoginStatus("");
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
      
      console.log("Attempting login with:", { email: data.email, serverUrl });

      // Try to login as user first
      setLoginStatus("Checking passenger credentials...");
      try {
        console.log("Trying user login...");
        const userResponse = await axios.post(`${serverUrl}/user/login`, {
          email: data.email,
          password: data.password
        });
        
        console.log("User login response:", userResponse.data);
        
        // User login successful
        setLoginStatus("Passenger login successful! Redirecting...");
        localStorage.setItem("token", userResponse.data.token);
        localStorage.setItem("userData", JSON.stringify({
          type: "user",
          data: userResponse.data.user,
        }));
        
        Console.log("User login successful");
        setTimeout(() => navigate("/home"), 500);
        return;
      } catch (userError) {
        console.log("User login failed:", userError.response?.data || userError.message);
        // Only continue if it's a 401/404 error (wrong credentials), not a network error
        if (userError.response?.status !== 401 && userError.response?.status !== 404) {
          throw userError; // Re-throw network errors
        }
      }

      // Try to login as captain
      setLoginStatus("Checking driver credentials...");
      try {
        console.log("Trying captain login...");
        const captainResponse = await axios.post(`${serverUrl}/captain/login`, {
          email: data.email,
          password: data.password
        });
        
        console.log("Captain login response:", captainResponse.data);
        
        // Captain login successful
        setLoginStatus("Driver login successful! Redirecting...");
        localStorage.setItem("token", captainResponse.data.token);
        localStorage.setItem("userData", JSON.stringify({
          type: "captain",
          data: captainResponse.data.captain,
        }));
        
        Console.log("Captain login successful");
        setTimeout(() => navigate("/captain/home"), 500);
        return;
      } catch (captainError) {
        console.log("Captain login failed:", captainError.response?.data || captainError.message);
        // Only continue if it's a 401/404 error (wrong credentials), not a network error
        if (captainError.response?.status !== 401 && captainError.response?.status !== 404) {
          throw captainError; // Re-throw network errors
        }
      }

      // Try to login as admin
      setLoginStatus("Checking admin credentials...");
      try {
        console.log("Trying admin login...");
        const adminResponse = await axios.post(`${serverUrl}/admin/login`, {
          email: data.email,
          password: data.password
        });
        
        console.log("Admin login response:", adminResponse.data);
        
        // Admin login successful
        setLoginStatus("Admin login successful! Redirecting...");
        localStorage.setItem("token", adminResponse.data.token);
        localStorage.setItem("userData", JSON.stringify({
          type: "admin",
          data: adminResponse.data.admin,
        }));
        
        Console.log("Admin login successful");
        setTimeout(() => navigate("/admin/dashboard"), 500);
        return;
      } catch (adminError) {
        console.log("Admin login failed:", adminError.response?.data || adminError.message);
        // Only continue if it's a 401/404 error (wrong credentials), not a network error
        if (adminError.response?.status !== 401 && adminError.response?.status !== 404) {
          throw adminError; // Re-throw network errors
        }
      }

      // If we reach here, all login attempts failed with 401/404 (invalid credentials)
      setResponseError("Invalid email or password. Please check your credentials and try again.");
      
    } catch (error) {
      console.error("Login error:", error);
      
      // Handle different types of errors
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        setResponseError("Network error. Please check your internet connection and try again.");
      } else if (error.response?.status === 500) {
        setResponseError("Server error. Please try again later.");
      } else if (error.response?.data?.message) {
        setResponseError(error.response.data.message);
      } else {
        setResponseError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
      setLoginStatus("");
    }
  };

  return (
    <AuthLayout 
      title="Welcome back" 
      subtitle="Sign in with your email and password"
    >
      {/* Role Info Banner */}
      <motion.div
        className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4 mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-orange-700">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span className="font-medium">Passengers</span>
          </div>
          <div className="flex items-center gap-2 text-orange-700">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span className="font-medium">Drivers</span>
          </div>
          <div className="flex items-center gap-2 text-orange-700">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span className="font-medium">Admins</span>
          </div>
        </div>
        <p className="text-center text-xs text-orange-600 mt-2">
          One login for all user types - we'll automatically redirect you to the right dashboard
        </p>
      </motion.div>

      {/* Unified Login Form */}
      <motion.form
        onSubmit={handleSubmit(loginUser)}
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
          {/* Email Input */}
          <div>
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
          </div>

          {/* Password Input */}
          <div>
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                icon={<Lock className="w-5 h-5" />}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters"
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
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <Link 
              to="/forgot-password"
              className="text-sm text-orange-600 hover:text-orange-500 font-medium transition-colors"
            >
              Forgot password?
            </Link>
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

          {/* Login Status */}
          <AnimatePresence>
            {loginStatus && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <p className="text-sm text-blue-700 text-center font-medium">
                  {loginStatus}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Button */}
          <Button
            type="submit"
            loading={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 text-base font-semibold"
            size="lg"
            icon={<LogIn className="w-5 h-5" />}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>

          {/* Sign Up Link */}
          <p className="text-sm text-center text-gray-600">
            Don't have an account?{" "}
            <Link 
              to="/signup" 
              className="font-semibold text-orange-600 hover:text-orange-500 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </motion.form>

      {/* Privacy Policy */}
      <motion.p 
        className="text-xs text-center text-gray-500 mt-8 leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        This site is protected by reCAPTCHA and the Google{" "}
        <span className="font-medium underline cursor-pointer hover:text-gray-700">
          Privacy Policy
        </span>{" "}
        and{" "}
        <span className="font-medium underline cursor-pointer hover:text-gray-700">
          Terms of Service
        </span>{" "}
        apply.
      </motion.p>
    </AuthLayout>
  );
}

export default Login;