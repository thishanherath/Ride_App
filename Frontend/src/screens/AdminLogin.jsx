import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Shield, ArrowLeft } from "lucide-react";
import { Button, Input } from "../components/ui";
import axios from "axios";
import Console from "../utils/console";

function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [responseError, setResponseError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    handleSubmit,
    register,
    formState: { errors },
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

  const loginAdmin = async (data) => {
    if (!data.email.trim() || !data.password.trim()) return;

    try {
      setLoading(true);
      setResponseError("");
      
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
      
      const response = await axios.post(
        `${serverUrl}/admin/login`,
        data
      );

      localStorage.setItem("adminToken", response.data.token);
      localStorage.setItem("adminData", JSON.stringify({
        type: "admin",
        data: response.data.admin,
      }));

      navigate("/admin/dashboard");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed";
      setResponseError(errorMessage);
      Console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Login</h1>
            <p className="text-gray-600">Access the admin dashboard</p>
          </div>

          {/* Login Form */}
          <motion.form
            onSubmit={handleSubmit(loginAdmin)}
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Email */}
            <Input
              label="Email address"
              type="email"
              placeholder="admin@quickride.com"
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
                placeholder="Enter your password"
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

            {/* Error Message */}
            {responseError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-sm text-red-600 text-center">
                  {responseError}
                </p>
              </motion.div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              loading={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-semibold"
              size="lg"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </motion.form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Authorized personnel only
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default AdminLogin;
