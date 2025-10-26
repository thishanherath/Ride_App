import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, Bug, Lightbulb, MessageSquare, Shield, Star } from "lucide-react";
import { Button } from "./ui";
import axios from "axios";
import Console from "../utils/console";

function FeedbackModal({ isOpen, onClose, onFeedbackSubmitted }) {
  const [formData, setFormData] = useState({
    type: "general",
    category: "other",
    priority: "medium",
    subject: "",
    description: "",
    isAnonymous: false
  });
  const [loading, setLoading] = useState(false);

  const feedbackTypes = [
    { value: "bug_report", label: "Bug Report", icon: Bug, color: "text-red-600" },
    { value: "feature_request", label: "Feature Request", icon: Lightbulb, color: "text-blue-600" },
    { value: "complaint", label: "Complaint", icon: AlertCircle, color: "text-orange-600" },
    { value: "suggestion", label: "Suggestion", icon: MessageSquare, color: "text-green-600" },
    { value: "safety_concern", label: "Safety Concern", icon: Shield, color: "text-red-600" },
    { value: "general", label: "General", icon: Star, color: "text-gray-600" }
  ];

  const categories = [
    { value: "app_issue", label: "App Issue" },
    { value: "driver_issue", label: "Driver Issue" },
    { value: "payment_issue", label: "Payment Issue" },
    { value: "ride_issue", label: "Ride Issue" },
    { value: "account_issue", label: "Account Issue" },
    { value: "technical_issue", label: "Technical Issue" },
    { value: "safety_issue", label: "Safety Issue" },
    { value: "other", label: "Other" }
  ];

  const priorities = [
    { value: "low", label: "Low", color: "text-green-600" },
    { value: "medium", label: "Medium", color: "text-yellow-600" },
    { value: "high", label: "High", color: "text-orange-600" },
    { value: "urgent", label: "Urgent", color: "text-red-600" }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.subject.trim() || !formData.description.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

      const response = await axios.post(
        `${serverUrl}/feedback/submit`,
        formData,
        {
          headers: { token }
        }
      );

      Console.log("Feedback submitted:", response.data);
      onFeedbackSubmitted(response.data.feedback);
      onClose();
      
      // Reset form
      setFormData({
        type: "general",
        category: "other",
        priority: "medium",
        subject: "",
        description: "",
        isAnonymous: false
      });
    } catch (error) {
      Console.error("Error submitting feedback:", error);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Submit Feedback</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Feedback Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Feedback Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {feedbackTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleInputChange("type", type.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.type === type.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className={`w-4 h-4 ${type.color}`} />
                      <span className="text-sm font-medium text-gray-700">
                        {type.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange("category", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <div className="flex space-x-2">
              {priorities.map((priority) => (
                <button
                  key={priority.value}
                  type="button"
                  onClick={() => handleInputChange("priority", priority.value)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    formData.priority === priority.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className={`text-sm font-medium ${priority.color}`}>
                    {priority.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject *
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => handleInputChange("subject", e.target.value)}
              placeholder="Brief description of your feedback"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.subject.length}/200 characters
            </p>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Please provide detailed information about your feedback..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              maxLength={2000}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/2000 characters
            </p>
          </div>

          {/* Anonymous Option */}
          <div className="mb-6">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isAnonymous}
                onChange={(e) => handleInputChange("isAnonymous", e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Submit anonymously</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              loading={loading}
              disabled={!formData.subject.trim() || !formData.description.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Submitting..." : "Submit Feedback"}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default FeedbackModal;
