import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCaptain } from "../contexts/CaptainContext";
import VerifyEmail from "../components/VerifyEmail";
import Loading from "./Loading";

function CaptainProtectedWrapper({ children }) {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { captain, setCaptain } = useCaptain();

  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(null);

  useEffect(() => {
    console.log('🔍 CaptainProtectedWrapper - Starting auth check');
    console.log('Token exists:', !!token);
    console.log('Server URL:', import.meta.env.VITE_SERVER_URL);
    
    if (!token) {
      console.log('❌ No token found, redirecting to login');
      navigate("/captain/login");
      return;
    }

    console.log('📡 Making API call to /captain/profile');
    axios
      .get(`${import.meta.env.VITE_SERVER_URL}/captain/profile`, {
        headers: {
          token: token,
        },
      })
      .then((response) => {
        console.log('✅ Captain profile API success:', response.data);
        if (response.status === 200) {
          const captain = response.data.captain;
          setCaptain(captain);
          localStorage.setItem(
            "userData",
            JSON.stringify({ type: "captain", data: captain, }));
          console.log('✅ Captain data set successfully:', captain);
        }
        setIsVerified(true); // Disable email verification check
      })
      .catch((err) => {
        console.error('❌ Captain profile API error:', err);
        console.error('Error response:', err.response?.data);
        console.error('Error status:', err.response?.status);
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        navigate("/captain/login");
      })
      .finally(() => {
        console.log('🏁 Captain auth check completed');
        setLoading(false);
      });
  }, [token]);

  if (loading) return <Loading />;

  if (isVerified === false) {
    return <VerifyEmail user={captain} role={"captain"} />;
  }

  return <>{children}</>;
}

export default CaptainProtectedWrapper;
