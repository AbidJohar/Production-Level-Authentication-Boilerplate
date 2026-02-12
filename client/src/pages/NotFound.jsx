import { useNavigate } from 'react-router-dom';
import Button from '../components/Button'; // Reusing your existing Button component

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="text-center z-10">
        {/* Animated 404 Text */}
        <h1 className="text-[150px] md:text-[200px] font-black text-white leading-none tracking-tighter opacity-20 animate-pulse">
          404
        </h1>
        
        <div className="-mt-12 md:-mt-20">
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
            Lost in the <span className="text-blue-500">Void?</span>
          </h2>
          <p className="text-gray-400 max-w-md mt-8 mb-10 leading-relaxed">
            The page you're looking for has vanished into deep space or never existed in this dimension.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Button 
              name="Take Me Home" 
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-full transition-all shadow-lg shadow-blue-600/20"
            />
            
            <button 
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-white text-sm font-medium transition-colors px-6 py-3"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>

      {/* Subtle Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
    </div>
  );
};

export default NotFound;