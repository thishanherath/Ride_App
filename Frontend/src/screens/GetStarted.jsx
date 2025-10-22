import { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Button as ModernButton } from "../components/ui";
import { motion } from "framer-motion";
import background from "/get_started_illustration.jpg";
import { useNavigate } from "react-router-dom";
import logo from '/logo-quickride.png'

function GetStarted() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      if (JSON.parse(userData).type == "user") {
        navigate("/home");
      } else if (JSON.parse(userData).type == "captain") {
        navigate("/captain/home");
      }
    }
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Modern Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-orange-400 to-orange-600" />
      
      {/* Background Image Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${background})` }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between min-h-screen">
        {/* Logo */}
        <motion.div 
          className="p-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <img
            className="h-12 object-contain"
            src={logo}
            alt="QuickRide Logo"
          />
        </motion.div>
        
        {/* Bottom Panel */}
        <motion.div
          className="bg-white rounded-t-3xl p-8 pb-12 shadow-2xl"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Get started with QuickRide
            </h1>
            <p className="text-gray-600 mb-8 text-lg">
              Your ride is just a tap away
            </p>
            
            <ModernButton
              onClick={() => navigate("/login")}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 text-lg font-semibold"
              size="lg"
            >
              Continue
              <ArrowRight className="ml-2 w-5 h-5" />
            </ModernButton>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default GetStarted;
