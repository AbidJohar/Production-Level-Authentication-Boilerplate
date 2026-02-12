import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner"; // 1. Import from sonner

const Login = () => {
  const [state, setState] = useState("Sign Up");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const navigate = useNavigate();
  const { login, signUp } = useAuth(); // Removed 'user' as we'll use 'result.user'

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

          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-lg shadow-blue-600/20"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Wait...
              </span>
            ) : state}
          </button>
          
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