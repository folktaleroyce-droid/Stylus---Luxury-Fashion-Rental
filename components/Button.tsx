import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "px-8 py-3 font-serif uppercase tracking-widest text-sm transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gradient-to-r from-golden-orange to-golden-light text-espresso font-bold hover:shadow-[0_0_15px_rgba(225,175,77,0.5)] hover:scale-105",
    secondary: "bg-espresso border border-golden-orange text-golden-orange hover:bg-golden-orange hover:text-espresso",
    outline: "bg-transparent border border-cream text-cream hover:bg-cream hover:text-espresso"
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${widthClass} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};