import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Star,
  Heart,
  MessageSquare,
  Send,
  ThumbsUp,
  Award,
  Users,
  TrendingUp,
  Zap,
  Shield,
  Clock,
  Car,
  Smartphone,
  Globe,
  CheckCircle
} from "lucide-react";
import { Card, Button, Input } from "../components/ui";

function RateApp() {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: 'ui', label: 'User Interface', icon: Smartphone, color: 'blue' },
    { id: 'performance', label: 'Performance', icon: Zap, color: 'yellow' },
    { id: 'reliability', label: 'Reliability', icon: Shield, color: 'green' },
    { id: 'features', label: 'Features', icon: Award, color: 'purple' },
    { id: 'support', label: 'Customer Support', icon: Users, color: 'pink' },
    { id: 'overall', label: 'Overall Experience', icon: TrendingUp, color: 'indigo' }
  ];

  const quickFeedback = [
    "Love the app! 😍",
    "Great user experience",
    "Fast and reliable",
    "Easy to use",
    "Excellent service",
    "Highly recommend",
    "Could be better",
    "Needs improvement"
  ];

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleQuickFeedback = (text) => {
    setFeedback(prev => prev ? `${prev} ${text}` : text);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would make an actual API call to submit the rating
      console.log('Submitting app rating:', {
        rating,
        feedback: feedback.trim(),
        categories: selectedCategories,
        timestamp: new Date().toISOString()
      });
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRatingText = (rating) => {
    const texts = {
      1: "Poor",
      2: "Fair", 
      3: "Good",
      4: "Very Good",
      5: "Excellent"
    };
    return texts[rating] || "";
  };

  const getRatingColor = (rating) => {
    if (rating <= 2) return "text-red-500";
    if (rating === 3) return "text-yellow-500";
    return "text-green-500";
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Thank You!</h2>
          <p className="text-gray-600 mb-6 max-w-md">
            Your feedback helps us improve QuickRide and provide better service to all our users.
          </p>
          <Button
            onClick={() => navigate(-1)}
            className="bg-green-500 hover:bg-green-600"
          >
            Back to App
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-orange-200/50 sticky top-0 z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-full hover:bg-orange-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Rate QuickRide</h1>
              <p className="text-sm text-gray-500">Share your experience with us</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            <span className="text-sm text-gray-600">We value your feedback</span>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 max-w-2xl mx-auto">
        {/* App Info Card */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Car className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">QuickRide</h2>
              <p className="text-orange-100">Your trusted ride companion</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-orange-100">
                <span className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  Sri Lanka
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  10K+ Users
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Rating Section */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            How would you rate QuickRide?
          </h3>
          
          <div className="flex justify-center mb-4">
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-10 h-10 transition-all duration-200 ${
                      star <= (hoveredRating || rating)
                        ? "text-yellow-400 fill-current drop-shadow-sm"
                        : "text-gray-300 hover:text-gray-400"
                    }`}
                  />
                </motion.button>
              ))}
            </div>
          </div>
          
          {rating > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <p className={`text-lg font-semibold ${getRatingColor(rating)}`}>
                {getRatingText(rating)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {rating >= 4 ? "Thank you for the great rating! 🎉" : 
                 rating === 3 ? "We appreciate your feedback! 👍" :
                 "We'll work hard to improve! 💪"}
              </p>
            </motion.div>
          )}
        </Card>

        {/* Categories */}
        {rating > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-500" />
                What did you like most? (Optional)
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const isSelected = selectedCategories.includes(category.id);
                  
                  return (
                    <motion.button
                      key={category.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleCategoryToggle(category.id)}
                      className={`p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                        isSelected
                          ? `border-${category.color}-500 bg-${category.color}-50`
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isSelected ? `bg-${category.color}-500` : 'bg-gray-100'
                        }`}>
                          <Icon className={`w-4 h-4 ${
                            isSelected ? 'text-white' : 'text-gray-600'
                          }`} />
                        </div>
                        <span className={`text-sm font-medium ${
                          isSelected ? `text-${category.color}-700` : 'text-gray-700'
                        }`}>
                          {category.label}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Feedback Section */}
        {rating > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                Tell us more (Optional)
              </h3>
              
              {/* Quick Feedback Buttons */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">Quick feedback:</p>
                <div className="flex flex-wrap gap-2">
                  {quickFeedback.map((text, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickFeedback(text)}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors"
                    >
                      {text}
                    </button>
                  ))}
                </div>
              </div>
              
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your thoughts about QuickRide... What do you love? What could we improve?"
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-2">
                {feedback.length}/500 characters
              </p>
            </Card>
          </motion.div>
        )}

        {/* Submit Button */}
        {rating > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              onClick={handleSubmit}
              loading={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-4 text-lg font-semibold"
              icon={<Send className="w-5 h-5" />}
            >
              {loading ? 'Submitting...' : 'Submit Rating'}
            </Button>
            
            <p className="text-center text-xs text-gray-500 mt-3">
              Your feedback is anonymous and helps us improve QuickRide for everyone
            </p>
          </motion.div>
        )}

        {/* App Stats */}
        <Card className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">QuickRide by the Numbers</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">10K+</div>
              <div className="text-sm text-gray-600">Happy Users</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">50K+</div>
              <div className="text-sm text-gray-600">Rides Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">4.8</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default RateApp;