import React from "react";

const Loader = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[100px] animate-pulse" />
      
      <div className="relative flex items-center justify-center">
        {/* Outer Ring */}
        <div className="w-20 h-20 rounded-full border-t-2 border-b-2 border-blue-500 animate-spin" />
        
        {/* Inner Glowing Core */}
        <div className="absolute w-12 h-12 rounded-full bg-blue-600/20 blur-sm animate-pulse shadow-[0_0_20px_rgba(37,99,235,0.5)]" />
        
        {/* Center Dot */}
        <div className="absolute w-2 h-2 rounded-full bg-white shadow-[0_0_10px_#fff]" />
      </div>
      
      <p className="absolute mt-32 text-gray-500 text-sm font-light tracking-[0.2em] uppercase animate-pulse">
        Initializing…
      </p>
    </div>
  );
};

export default Loader;