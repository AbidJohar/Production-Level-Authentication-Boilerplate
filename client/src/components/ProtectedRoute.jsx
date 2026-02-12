import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Blocks logged-out users from accessing private pages (e.g. dashboard)
// If not logged in → redirect to /login
export const ProtectedRoute = ({ children }) => {
  const { user} = useAuth();


   if(!user) return <Navigate to="/login" replace />
  
   if (!user.isVerified) return <Navigate to="/verify-email" replace />
  
   return children;
};

// Blocks logged-in users from accessing public-only pages (e.g. login, signup)
// If logged in → redirect to /
export const GuestRoute = ({ children }) => {
  const { user} = useAuth();


  return user?.isVerified ? <Navigate to="/" replace /> : children;
};

export const UnverifiedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;

  if (user.isVerified) return <Navigate to="/" />;

  return children;
};