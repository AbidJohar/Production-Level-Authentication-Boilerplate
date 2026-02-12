import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const VerifyEmail = () => {
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmittingresendOTP, setisSubmittingresendOTP] = useState(false);
    const inputRefs = useRef([]);
    const navigate = useNavigate();
    const { verifyOtp, resendOtp } = useAuth(); // Assume you'll add this to context

    // Handle typing in the boxes
    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        // Move to next input if value is entered
        if (element.value !== "" && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    // Handle backspace to move focus back
    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }

    };

    const handleResendOTP = async (e) => {
        e.preventDefault();
         setisSubmittingresendOTP(true);
        try {
          const result =  await resendOtp();
          console.log("result in very mail page:",result);

          if(result.success){
              toast.info(result.message || "Resend OTP sucessfully");
          }
            
        } catch (error) {
            toast.error("Failed to resend OTP");
        } 
        finally {
            setisSubmittingresendOTP(false);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpString = otp.join("");
        if (otpString.length < 6) return toast.error("Please enter 6-digit OTP");

        setIsSubmitting(true);
        try {
            // Logic to call backend /auth/verify-email
            const result = await verifyOtp(otpString); 
            if (result.success) {
                toast.success(result.message || "Email verified successfully!");
                navigate("/");
            } else {
                toast.error(result.message);
            }
        } catch (err) {
            toast.error("Verification failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] -z-10" />

            <div className="w-full max-w-md p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-2xl z-10 text-center">
                <h1 className="text-3xl font-bold text-white mb-2">Verify Email</h1>
                <p className="text-gray-400 mb-8 text-sm">Enter the 6-digit code sent to your inbox.</p>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="flex justify-between gap-2">
                        {otp.map((data, index) => (
                            <input
                                key={index}
                                type="text"
                                maxLength="1"
                                ref={(el) => (inputRefs.current[index] = el)}
                                value={data}
                                onChange={(e) => handleChange(e.target, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                className="w-12 h-14 bg-white/5 border border-white/10 rounded-xl text-white text-center text-2xl font-bold focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all"
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20"
                    >
                        {isSubmitting ? "Verifying..." : "Verify Code"}
                    </button>
                </form>

                <button 
                    type="button"
                    onClick={handleResendOTP}
                    disabled={isSubmittingresendOTP}
                    className="w-full mt-3 text-white font-semibold py-3 rounded-xl transition-all  border-[1px] border-white/60"
                >
                   {isSubmittingresendOTP ? "Sending..." : "Resend OTP"}
                </button>
            </div>
        </div>
    );
};

export default VerifyEmail;