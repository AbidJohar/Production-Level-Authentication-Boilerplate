
import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";


//---------------( Create the Context )-----------------------
const AuthContext = createContext();


const API = axios.create({
//---------------( Set Base URL for Axios (Update this to your backend URL) )-----------------------
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true, // CRITICAT:This allows cookies to be sent/received
});


//---------------( Custom hook for easy access )-----------------
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
  
    
// ------------------( API INTEGRATION )---------------------
    // Inside AuthProvider
useEffect(() => {
    const verifyUser = async () => {
        try {
            const res = await API.get("/user/profile");
            if (res.data.success) {
                setUser(res.data.userData);
            }
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };
    verifyUser();
}, []);

// Separate the Interceptor so it only acts AFTER the app has loaded
useEffect(() => {
    if (loading) return; // Don't intercept while we are doing the initial check

    const interceptor = API.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                setUser(null);
                navigate("/login");
            }
            return Promise.reject(error);
        }
    );

    return () => API.interceptors.response.eject(interceptor);
}, [loading, navigate]);


 
// ------------------( Sign up )---------------------
const signUp = async (userData) => {
    try {
        const res = await API.post(`/auth/register`, userData);
        
        if (res.data.success) {
            setUser(res.data.user)
            return { success: res.data.success };
        }
    } catch (err) {
        // console.log("Full error data:", err.response?.data);
        
        // Extract both the main message AND the specific errors array
        return {
            success: false,
            message: err.response?.data?.message || "Registration failed",
            errors: err.response?.data?.errors || [] // This carries your list of issues
        };
    }
};


// ------------------( Login )---------------------
const login = async (email, password) => {
    try {
        const res = await API.post("/auth/login", { email, password });
        if (res.data.success) {
            setUser(res.data.user); // Backend set the cookie, we just update state
            return { success: res.data.success, message: res.data.message, user: res.data.user };
        }
    } catch (err) {
        return { success: false, message: err.response?.data?.message || "Login failed" };
    }
};


// ------------------( Logout )---------------------
const logout = async () => {
    try {
        const res = await API.get("/auth/logout"); // Backend should clear the cookie
        if (res.data.success) {
            setUser(null);
            return { success: res.data.success, message: res.data.message };
        }
    } catch (err) {
        console.error("Logout failed", err);
    }
};

//-------------------( Resend OTP )--------------------------

const resendOtp = async () => {
    
    const email = user?.email;
    
    if (!email) {
        return { success: false, message: "User email not found. Please login again." };
    }
    
    try {
        const response = await API.post("/auth/resend-otp", { email, otpType: "VERIFY_EMAIL" });
        if (response.data.success) {
            
            return { success: response.data.success, message: response.data.message }
        }
        
    } catch (err) {
        return {
            success: false,
            message: err.response?.data?.message || "failed to send OTP"
        };
    }
}


// ------------------( Verify OTP )---------------------
const verifyOtp = async (otp) => {
    console.log(user);
    
    try {
        const email = user?.email;
        
        if (!email) {
            return { success: false, message: "User email not found. Please login again." };
        }
        
        const res = await API.post("/auth/verify-email", { email, otp });
        console.log("response:", res)
        
        if (res.data.success) {
            // IMPORTANT: Update the local user state so isVerified becomes true
            // This prevents the need for a page refresh
            setUser(prev => ({ ...prev, isVerified: true }));
            
            return { success: res.data.success, message: res.data.message };
        }
    } catch (err) {
            return {
                success: false,
                message: err.response?.data?.message || "Verification failed"
            };
        }
    };
     
//------------------( forget Password )---------------------
const resetPassword = async (email) => {
    try {
        const res = await API.post("/auth/forget-password", { email });
        console.log("response:",res);
        
        return { success: res.data.success, message: res.data.message };
    } catch (err) {
        return { success: false, message: err.response?.data?.message || "Failed to send OTP" };
    }
};
//------------------( Verify and Reset Password )---------------------

 const verifyAndResetPassword = async (data) => {
    try {
        
        const res = await API.post("/auth/reset-password", data);
        return { success: res.data.success, message: res.data.message };
    } catch (err) {
        return { success: false, message: err.response?.data?.message || "Reset failed" };
    }
};

    const value = {
        user,
        loading,
        login,
        signUp,
        logout,
        verifyOtp,
        resendOtp,
        verifyAndResetPassword,
        resetPassword

    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
            <Loader />  
        ) : (
            children  
        )}
        </AuthContext.Provider>
    );
};