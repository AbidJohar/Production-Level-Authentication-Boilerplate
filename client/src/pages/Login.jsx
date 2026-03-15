import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import {useGoogleLogin} from '@react-oauth/google'

const Login = () => {
  const [state, setState] = useState("Sign Up");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoolgeSubmitting, setIsisGoolgeSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const navigate = useNavigate();
  const { login, signUp, googleLogin } = useAuth(); // Removed 'user' as we'll use 'result.user'

  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});

    const result = state === "Sign Up"
      ? await signUp(formData)
      : await login(formData.email, formData.password);

    if (result.success) {
      // Use the user data directly from the result of the API call
      const userData = result.user;

      if (userData?.isVerified) {
        toast.success("Welcome back!", {
          description: "Login Successful"
        });
        navigate("/");
      } else {
        toast.info("Verification Required", {
          description: "Please check your email for the OTP code."
        });
        navigate("/verify-email");
      }
    } else {
      if (result.errors && result.errors.length > 0) {
        const errorObj = {};
        result.errors.forEach((err) => {
          errorObj[err.field] = err.message;
        });
        setFieldErrors(errorObj);
        toast.error("Validation Error", {
          description: "Please check the fields for errors."
        });
      } else {
        toast.error("Authentication Failed", {
          description: result.message || "An unexpected error occurred."
        });
      }
    }
    setIsSubmitting(false);
  };

 const handleGoogleLogin = useGoogleLogin({
  onSuccess: async (res) => {
    setIsisGoolgeSubmitting(true);

    const result = await googleLogin(res.code);  // ← call context method

    if (result.success) {
      toast.success("Welcome!", { description: "Google login successful." });
      navigate("/");
    } else {
      toast.error("Google Login Failed", {
        description: result.message || "An unexpected error occurred.",
      });
    }

    setIsisGoolgeSubmitting(false);
  },
  onError: () => {
    toast.error("Google Login Failed", {
      description: "Unable to connect with Google. Please try again.",
    });
  },
  flow: "auth-code",
});


  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 relative overflow-hidden">
      {/* ToastContainer removed from here */}
      <div className="w-full max-w-md p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-2xl z-10">
        <h1 className="text-3xl font-bold text-white text-center mb-10">{state}</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {state === "Sign Up" && (
            <div>
              <label className="block text-gray-300 text-sm mb-2 ml-1 text-left">Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                onChange={handleChange}
                className={`w-full bg-white/5 border ${fieldErrors.name ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all`}
              />
              {fieldErrors.name && <p className="text-red-500 text-xs mt-1 ml-1 text-left">{fieldErrors.name}</p>}
            </div>
          )}

          <div>
            <label className="block text-gray-300 text-sm mb-2 ml-1 text-left">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="example@gmail.com"
              onChange={handleChange}
              className={`w-full bg-white/5 border ${fieldErrors.email ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all`}
            />
            {fieldErrors.email && <p className="text-red-500 text-xs mt-1 ml-1 text-left">{fieldErrors.email}</p>}
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-2 ml-1 text-left">Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              onChange={handleChange}
              className={`w-full bg-white/5 border ${fieldErrors.password ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all`}
            />
            {fieldErrors.password && <p className="text-red-500 text-xs mt-1 ml-1 text-left">{fieldErrors.password}</p>}
          </div>
          {/* --- FORGOT PASSWORD SECTION --- */}
          {state === "Login" && (
            <div className="flex justify-end pr-1">
              <span
                onClick={() => navigate("/reset-password")}
                className="text-sm text-blue-500 hover:text-blue-400 cursor-pointer transition-colors"
              >
                Forgot password?
              </span>
            </div>
          )}

          <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto p-4">
            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.97] text-white font-bold py-3 rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-600/30 flex items-center justify-center overflow-hidden"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="tracking-tight">Processing...</span>
                </div>
              ) : (
                <span className="tracking-wide text-lg">{state}</span>
              )}
            </button>

            {/* Modern "OR" Divider */}
            <div className="flex items-center w-full gap-4">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/20 to-white/10" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">OR</span>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-white/20 to-white/10" />
            </div>

            {/* Google Login */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-3.5 rounded-2xl transition-all duration-200 active:scale-[0.97] backdrop-blur-md hover:border-white/20 shadow-sm"
            >
                 {isGoolgeSubmitting ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="tracking-tight">Connecting...</span>
                </div>
              ) :  
                (
                  <>
                  
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span className="text-sm">Continue with Google</span>
               </>
                )}
            </button>
          </div>

          <div className="text-center mt-6 text-sm text-gray-400">
            {state === "Sign Up" ? (
              <p>Already have an account? <span onClick={() => setState("Login")} className="text-blue-500 cursor-pointer hover:underline font-medium">Login</span></p>
            ) : (
              <p>Don't have an account? <span onClick={() => setState("Sign Up")} className="text-blue-500 cursor-pointer hover:underline font-medium">Sign Up</span></p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;