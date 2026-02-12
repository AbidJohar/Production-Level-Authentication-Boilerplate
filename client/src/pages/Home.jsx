import React from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";  
import { useNavigate } from "react-router-dom";


const Home = () => {
    const { user } = useAuth(); // Destructure user to check auth status
    const navigate =  useNavigate()
    return (
        <div className="bg-[#0a0a0a] min-h-screen text-white overflow-hidden">
            <Navbar />
            
            <header className="relative w-full h-screen flex flex-col items-center justify-center px-4">
                {/* Background Decoration (Glow) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -z-10" />
                
                <div className="text-center space-y-6 max-w-4xl">
                    <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
                        {user ? (
                            <>Welcome Back, <br /> <span className="text-blue-500">{user.name}</span></>
                        ) : (
                            <>The Ultimate <br /> <span className="text-blue-500">Auth Starter.</span></>
                        )}
                    </h1>
                    
                    <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
                        {user 
                            ? "You have successfully authenticated using our secure HttpOnly cookie system. Explore your protected dashboard below."
                            : "A production-ready authentication boilerplate. Featuring JWT in HttpOnly cookies, Zod validation, and Context API best practices."
                        }
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <button onClick={()=>navigate("/dashboard") } className="px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-all duration-300 shadow-lg shadow-white/10">
                            {user ? "Go to Dashboard" : "Get Started"}
                        </button>
                    </div>
                </div>
 
            </header>
        </div>
    );
};

export default Home;