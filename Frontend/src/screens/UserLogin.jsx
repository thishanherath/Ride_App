import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function UserLogin() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to unified login with user tab pre-selected
    navigate("/login?tab=user", { replace: true });
  }, [navigate]);

  return null;
}

export default UserLogin;
