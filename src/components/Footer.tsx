import React, { useState } from 'react';

const Footer = () => {
  const [hover, setHover] = useState(false);
  return (
    <footer className="py-10 border-t border-gray-800 text-center text-gray-500 font-inter text-sm flex flex-col items-center">
      <div
        className="mb-2 transition-transform duration-300"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{ transform: hover ? 'scale(1.2) rotate(-10deg)' : 'scale(1)' }}
      >
        🚀
      </div>
      <p>
        © {new Date().getFullYear()} Milap. All rights reserved. <span className="text-gray-400 font-bold">Made with passion.</span>
      </p>
    </footer>
  );
};

export default Footer;