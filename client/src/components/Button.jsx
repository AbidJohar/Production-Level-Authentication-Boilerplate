/* eslint-disable react/prop-types */

// Instruction : If you want to make its UI look, next level then try to keep bg-color rgb(195, 195, 197)

import {useNavigate} from 'react-router-dom'
const Button = ({
  name = 'Button',
  onClick,
  type = 'button',
  className = '',
  style,
  icon,
}) => {


const handleClick = (e) => {
    // Check if onClick exists, then call it
    if (onClick) {
      onClick(e); 
    }
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      className={`px-6 py-2 text-black focus:outline-none rounded-full border-[1px] border-black/20 font-bold  
         ${className}`}
      style={style}
    >
      {icon && <span className="icon">{icon}</span>}
      {name}
    </button>
  );
};

export default Button;
