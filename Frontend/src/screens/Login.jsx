import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Button, Input } from "../components/ui";
import { AuthLayout, TabSwitcher } from "../components/auth";

import axios from "axios";
import Console from "../utils/console";

function Login() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "user");
  const [showPassword, setShowPassword] = useState(false);
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

  const loginUser = async (data) => {
    if (!data.email.trim() || !data.password.trim()) return;

    try {
      setLoading(true);
      const endpoint = activeTab === "user" ? "/user/login" : "/captain/login";
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}${endpoint}`,
        data
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userData", JSON.stringify({
        type: activeTab === "driver" ? "captain" : activeTab,
        data: activeTab === "driver" ? response.data.captain : response.data.user,
      }));

      navigate(activeTab === "user" ? "/home" : "/captain/home");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed";
      setResponseError(errorMessage);
      Console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Welcome back" 
      subtitle="Sign in to your account to continue"
    >
      {/* Tab Switcher */}
      <TabSwitcher 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
      />

      {/* Login Form */}
      <AnimatePresence mode="wait">
        <motion.form
          key={activeTab}
          onSubmit={handleSubmit(loginUser)}
          className="space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
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
              to={`/${activeTab === "driver" ? "captain" : activeTab}/forgot-password`}
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

          {/* Login Button */}
          <Button
            type="submit"
            loading={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 text-base font-semibold"
            size="lg"
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
      </AnimatePresence>

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