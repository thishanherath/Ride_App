import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function CaptainLogin() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to unified login with driver tab pre-selected
    navigate("/login?tab=driver", { replace: true });
  }, [navigate]);

  return null;
}

export default CaptainLogin;
