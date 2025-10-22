import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function CaptainSignup() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to unified signup with driver tab pre-selected
    navigate("/signup?tab=driver", { replace: true });
  }, [navigate]);

  return null;
}

export default CaptainSignup;
