import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, ThumbsUp, Clock, Car, MessageCircle, Shield } from "lucide-react";
import { Button } from "./ui";
import { formatCurrency } from "../utils/currency";
import axios from "axios";
import Console from "../utils/console";

function RatingModal({ isOpen, onClose, ride, onRatingSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [categories, setCategories] = useState({
    driving: 0,
    punctuality: 0,
    cleanliness: 0,
    communication: 0
  });
  const [tags, setTags] = useState([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);

  const availableTags = [
    "excellent_driver", "safe_driver", "friendly", "professional", "clean_vehicle",
    "good_communication", "punctual", "helpful", "knowledgeable"
  ];

  const handleCategoryChange = (category, value) => {
    setCategories(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleTagToggle = (tag) => {
    setTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

      const response = await axios.post(
        `${serverUrl}/rating/submit`,
        {
          rideId: ride._id,
          rating,
          feedback: feedback.trim() || undefined,
          categories: Object.values(categories).some(v => v > 0) ? categories : undefined,
          tags: tags.length > 0 ? tags : undefined,
          isAnonymous
        },
        {
          headers: { token }
        }
      );

      Console.log("Rating submitted:", response.data);
      onRatingSubmitted(response.data.rating);
      onClose();
    } catch (error) {
      Console.error("Error submitting rating:", error);
      alert("Failed to submit rating. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({ value, onChange, hoveredValue, onHover }) => (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => onHover(star)}
          onMouseLeave={() => onHover(0)}
          className="focus:outline-none"
        >
          <Star
            className={`w-8 h-8 transition-colors ${
              star <= (hoveredValue || value)
                ? "text-yellow-400 fill-current"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Rate Your Ride</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Ride Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Car className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {ride.pickup} → {ride.destination}
                </p>
                <p className="text-sm text-gray-600">{formatCurrency(ride.fare)}</p>
              </div>
            </div>
          </div>

          {/* Overall Rating */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Overall Rating
            </label>
            <StarRating
              value={rating}
              onChange={setRating}
              hoveredValue={hoveredRating}
              onHover={setHoveredRating}
            />
            {rating > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </p>
            )}
          </div>

          {/* Category Ratings */}
          {rating > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Rate by Category
              </label>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Car className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Driving</span>
                  </div>
                  <StarRating
                    value={categories.driving}
                    onChange={(value) => handleCategoryChange("driving", value)}
                    hoveredValue={0}
                    onHover={() => {}}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Punctuality</span>
                  </div>
                  <StarRating
                    value={categories.punctuality}
                    onChange={(value) => handleCategoryChange("punctuality", value)}
                    hoveredValue={0}
                    onHover={() => {}}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Cleanliness</span>
                  </div>
                  <StarRating
                    value={categories.cleanliness}
                    onChange={(value) => handleCategoryChange("cleanliness", value)}
                    hoveredValue={0}
                    onHover={() => {}}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Communication</span>
                  </div>
                  <StarRating
                    value={categories.communication}
                    onChange={(value) => handleCategoryChange("communication", value)}
                    hoveredValue={0}
                    onHover={() => {}}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          {rating > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tags (Optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      tags.includes(tag)
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {tag.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Feedback */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Feedback (Optional)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your experience..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {feedback.length}/500 characters
            </p>
          </div>

          {/* Anonymous Option */}
          <div className="mb-6">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
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
              disabled={rating === 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Submitting..." : "Submit Rating"}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default RatingModal;
