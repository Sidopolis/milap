import React from 'react';
import { NavLink } from 'react-router-dom';
import MilapLogo from '../../milap-logo.svg';

const Navbar: React.FC<{ pendingRequests?: number }> = ({ pendingRequests = 0 }) => {
  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-black/90 rounded-full shadow-xl px-8 py-3 flex items-center gap-8 border border-gray-800">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `text-white text-lg font-semibold px-4 py-2 rounded-full transition-all duration-200 ${
            isActive
              ? 'bg-white/10 shadow border border-white'
              : 'hover:bg-white/10 hover:scale-105'
          }`
        }
      >
        Home
      </NavLink>
      <img src={MilapLogo} alt="Milap Logo" className="h-8 w-8 mx-4 select-none" style={{ pointerEvents: 'none' }} />
      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `relative text-white text-lg font-semibold px-4 py-2 rounded-full transition-all duration-200 ${
            isActive
              ? 'bg-white/10 shadow border border-white'
              : 'hover:bg-white/10 hover:scale-105'
          }`
        }
      >
        Profile
        {pendingRequests > 0 && (
          <span className="absolute -top-2 -right-2 bg-green-400 text-black rounded-full px-2 py-0.5 text-xs font-bold border border-white shadow">{pendingRequests}</span>
        )}
      </NavLink>
    </nav>
  );
};

export default Navbar; 