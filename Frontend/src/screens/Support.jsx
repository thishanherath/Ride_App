import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  MapPin,
  Send,
  HelpCircle,
  Book,
  Shield,
  AlertCircle,
  CheckCircle,
  ExternalLink
} from "lucide-react";
import { Card, Button, Input } from "../components/ui";
import { Header } from "../components/layout";
import { Sidebar } from "../components/layout";
import { useUser } from "../contexts/UserContext";
import { useNavigation } from "../hooks/useNavigation";

function Support() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const { 
    sidebarOpen, 
    currentPath, 
    openSidebar, 
    closeSidebar, 
    navigateTo, 
    handleLogout 
  } = useNavigation();
  
  // Determine user type from current path
  const userType = location.pathname.includes('/captain/') ? 'captain' : 'user';
  
  const [selectedCategory, setSelectedCategory] = useState("");
  const [message, setMessage] = useState("");
  const [contactInfo, setContactInfo] = useState({
    name: "",
    email: "",
    phone: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const supportCategories = [
    { id: 'ride', label: 'Ride Issues', icon: MapPin, description: 'Problems with booking or rides' },
    { id: 'payment', label: 'Payment & Billing', icon: Shield, description: 'Payment problems or refunds' },
    { id: 'account', label: 'Account Issues', icon: HelpCircle, description: 'Login or profile problems' },
    { id: 'technical', label: 'Technical Support', icon: AlertCircle, description: 'App bugs or technical issues' },
    { id: 'general', label: 'General Inquiry', icon: MessageCircle, description: 'Other questions or feedback' }
  ];

  const contactMethods = [
    {
      type: 'phone',
      label: 'Call Us',
      value: '+94 11 234 5678',
      description: 'Available 24/7',
      icon: Phone,
      color: 'green'
    },
    {
      type: 'email',
      label: 'Email Support',
      value: 'support@quickride.lk',
      description: 'Response within 24 hours',
      icon: Mail,
      color: 'blue'
    },
    {
      type: 'chat',
      label: 'Live Chat',
      value: 'Chat with us',
      description: 'Available 9 AM - 9 PM',
      icon: MessageCircle,
      color: 'purple'
    }
  ];

  const faqItems = [
    {
      question: "How do I book a ride?",
      answer: "Open the app, enter your pickup and destination, select vehicle type, and confirm booking."
    },
    {
      question: "How can I cancel a ride?",
      answer: "You can cancel a ride from the ride details screen before the driver arrives."
    },
    {
      question: "What payment methods are accepted?",
      answer: "We accept cash, credit/debit cards, and mobile payments."
    },
    {
      question: "How is the fare calculated?",
      answer: "Fare is based on distance, time, and vehicle type with transparent pricing."
    }
  ];

  const handleSubmit = async () => {
    if (!selectedCategory || !message.trim()) {
      alert("Please select a category and enter your message");
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Submitting support request:', {
        category: selectedCategory,
        message: message.trim(),
        contactInfo,
        timestamp: new Date().toISOString()
      });
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting support request:', error);
      alert('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Request Submitted!</h2>
          <p className="text-gray-600 mb-6 max-w-md">
            We've received your support request. Our team will get back to you within 24 hours.
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
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        user={user}
        userType={userType}
        onNavigate={navigateTo}
        currentPath={currentPath}
        onLogout={handleLogout}
      />

      {/* Header */}
      <Header
        title="Contact Support"
        showMenu={true}
        showNotifications={true}
        user={user}
        onMenuClick={openSidebar}
        onNotificationClick={() => navigateTo(`/${userType}/notifications`)}
        onProfileClick={() => navigateTo(`/${userType}/edit-profile`)}
      />

      {/* Back Button */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>
      </div>

      <div className="px-6 py-6 max-w-4xl mx-auto">
        {/* Quick Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {contactMethods.map((method) => {
            const Icon = method.icon;
            return (
              <Card key={method.type} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 bg-${method.color}-100 rounded-full flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 text-${method.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{method.label}</h3>
                    <p className="text-sm text-gray-600">{method.description}</p>
                    <p className={`text-sm font-medium text-${method.color}-600`}>{method.value}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </div>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Support Form */}
          <div>
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Send us a message</h2>
              
              {/* Category Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What can we help you with?
                </label>
                <div className="space-y-2">
                  {supportCategories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                          selectedCategory === category.id
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-5 h-5 ${
                            selectedCategory === category.id ? 'text-orange-600' : 'text-gray-500'
                          }`} />
                          <div>
                            <p className="font-medium text-gray-900">{category.label}</p>
                            <p className="text-sm text-gray-600">{category.description}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Contact Information */}
              <div className="mb-4 space-y-3">
                <Input
                  label="Your Name"
                  value={contactInfo.name}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                />
                <Input
                  label="Phone Number (Optional)"
                  value={contactInfo.phone}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter your phone number"
                />
              </div>

              {/* Message */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe your issue
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please provide as much detail as possible about your issue..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                  rows={5}
                  maxLength={1000}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {message.length}/1000 characters
                </p>
              </div>

              <Button
                onClick={handleSubmit}
                loading={loading}
                disabled={!selectedCategory || !message.trim()}
                className="w-full bg-orange-500 hover:bg-orange-600"
                icon={<Send className="w-4 h-4" />}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </Button>
            </Card>
          </div>

          {/* FAQ Section */}
          <div>
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Book className="w-5 h-5 text-blue-600" />
                Frequently Asked Questions
              </h2>
              
              <div className="space-y-4">
                {faqItems.map((item, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <h3 className="font-medium text-gray-900 mb-2">{item.question}</h3>
                    <p className="text-sm text-gray-600">{item.answer}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Business Hours */}
            <Card className="p-6 mt-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-600" />
                Support Hours
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone Support:</span>
                  <span className="font-medium">24/7</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Live Chat:</span>
                  <span className="font-medium">9:00 AM - 9:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email Response:</span>
                  <span className="font-medium">Within 24 hours</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Support;