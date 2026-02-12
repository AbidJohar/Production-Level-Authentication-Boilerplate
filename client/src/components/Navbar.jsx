import React from 'react'
import Button from './Button'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner'; // 1. Swapped to sonner

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result.success) {
        toast.success(result.message); // Sonner success toast
        navigate('/login');
      }
    } catch (err) {
      toast.error("Logout failed. Please try again.");
    }
  };

  return (
    <nav className='fixed top-0 w-full z-50 flex items-center justify-between px-8 md:px-16 py-4 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10'>
      {/* Logo Area */}
      <div 
        className='flex items-center gap-2 cursor-pointer' 
        onClick={() => navigate('/')}
      >
        <div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-600/20'>
          A
        </div>
        <h1 className='font-bold text-2xl tracking-tight text-white'>
          Auth<span className='text-blue-500'>.</span>
        </h1>
      </div>

      {/* Action Button & User Info */}
      <div className='flex items-center gap-6'>
        {user ? (
          <div className='flex items-center gap-4'>
             
            <Button 
              name='Logout' 
              onClick={handleLogout} 
              className="bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white px-6 py-2 rounded-full transition-all duration-300" 
            />
          </div>
        ) : (
          <Button 
            name='Login' 
            onClick={() => navigate('/login')} 
            // Using your requested UI color pattern
            className="bg-[#c3c3c5] hover:bg-white text-black px-8 py-2 rounded-full transition-all duration-300" 
          />
        )}
      </div>
    </nav>
  )
}

export default Navbar