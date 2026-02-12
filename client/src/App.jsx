import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import { ProtectedRoute, GuestRoute, UnverifiedRoute } from './components/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import {Toaster} from "sonner";
import Dashboard from './pages/Dashboard.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <>
      <ToastContainer />
      {/* 2. Configure Sonner Toaster */}
      <Toaster 
        theme="dark" 
        position="bottom-right" 
        richColors 
        closeButton
      />
      <Routes>
        
        {/* Protected: only logged-in verified users */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Guest only: logged-in users get bounced back to dashboard */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />

        <Route
          path="/reset-password"
          element={
            <GuestRoute>
              <ResetPassword />
            </GuestRoute>
          }
        />

        {/* Semi-public: needs its own logic (user exists but isVerified is false) */}
        <Route path="/verify-email" element={
          <UnverifiedRoute>

            <VerifyEmail />
          </UnverifiedRoute>
          } />

      </Routes>
    </>
  );
}