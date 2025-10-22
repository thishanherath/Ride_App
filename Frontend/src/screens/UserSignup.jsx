import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function UserSignup() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to unified signup with user tab pre-selected
    navigate("/signup?tab=user", { replace: true });
  }, [navigate]);

  return null;
}

export default UserSignup;
