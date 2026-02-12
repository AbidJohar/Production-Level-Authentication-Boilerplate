import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

const ResetPassword = () => {
  const { resetPassword, verifyAndResetPassword } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Request OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await resetPassword(email);
    
    if (result.success) {
      toast.success("OTP Sent!", { description: result.message });
      setIsOtpSent(true);
    } else {
      toast.error("Error", { description: result.message });
    }
    setIsSubmitting(false);
  };

  // Step 2: Verify OTP and Reset Password
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const result = await verifyAndResetPassword({ email, otp, newPassword });
    
    if (result.success) {
      toast.success("Password Reset Successfully!", { description: "You can now login with your new password." });
      navigate("/login");
    } else {
      toast.error("Reset Failed", { description: result.message });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px]" />
      
      <div className="w-full max-w-md p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-2xl relative z-10">
        
        <button onClick={() => navigate("/login")} className="flex items-center gap-2 text-gray-500 hover:text-white text-sm mb-8 transition-colors">
          <span>←</span> Back to login
        </button>

        {!isOtpSent ? (
          <>
            <div className="mb-8">
              <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center mb-4 text-xl">🔑</div>
              <h1 className="text-3xl font-bold text-white mb-2">Forgot Password?</h1>
              <p className="text-gray-400 text-sm">Enter your email to receive a 6-digit OTP code.</p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label className="block text-gray-300 text-sm mb-2 ml-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all"
                  required
                />
              </div>
              <button disabled={isSubmitting} type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50">
                {isSubmitting ? "Sending..." : "Send OTP"}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="mb-8">
              <div className="w-12 h-12 bg-green-600/20 border border-green-500/30 rounded-xl flex items-center justify-center mb-4 text-xl">🛡️</div>
              <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
              <p className="text-gray-400 text-sm">Enter the OTP sent to <span className="text-white">{email}</span> and your new password.</p>
            </div>

            <form onSubmit={handleResetSubmit} className="space-y-5">
              <div>
                <label className="block text-gray-300 text-sm mb-2 ml-1 text-left">OTP Code</label>
                <input
                  type="text"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white tracking-[1em] text-center focus:outline-none focus:border-blue-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2 ml-1 text-left">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all"
                  required
                />
              </div>

              <button disabled={isSubmitting} type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50">
                {isSubmitting ? "Updating..." : "Reset Password"}
              </button>
              
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;