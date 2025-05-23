import React, { useRef, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';

const avatars = [
  'AK', 'SJ', 'LM', 'PR', 'YT', 'MG'
];

const videos = [
  '/4684807-hd_1920_1080_25fps.mp4',
  '/17629504-hd_1920_1080_30fps.mp4',
  '/3010400-hd_1920_1080_24fps.mp4',
  '/3249674-uhd_3840_2160_25fps.mp4',
  '/4065218-uhd_4096_2160_25fps.mp4',
];

interface HeroProps {
  children?: ReactNode;
}

const Hero: React.FC<HeroProps> = ({ children }) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [userCount, setUserCount] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (window.gsap) {
      window.gsap.fromTo(
        heroRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out' }
      );
    }
  }, []);

  // Crossfade between videos
  useEffect(() => {
    const timeout = setTimeout(() => {
      setFade(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % videos.length);
        setFade(true);
      }, 500); // fade duration
    }, 4000); // show each video for 6s
    return () => clearTimeout(timeout);
  }, [current]);

  // When video changes, update src
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.src = videos[current];
      videoRef.current.load();
      videoRef.current.play();
    }
  }, [current]);

  // Fetch real-time user count from Firebase
  useEffect(() => {
    const usersRef = ref(db, 'users');
    return onValue(usersRef, (snapshot) => {
      const val = snapshot.val() || {};
      setUserCount(Object.keys(val).length);
    });
  }, []);

  return (
    <section ref={heroRef} className="relative w-full aspect-video max-h-[90vh] min-h-[400px] overflow-hidden bg-black">
      {/* Video background */}
      <video
        ref={videoRef}
        src={videos[current]}
        autoPlay
        muted
        loop
        playsInline
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${fade ? 'opacity-100' : 'opacity-0'}`}
        style={{ zIndex: 1 }}
      />
      {/* Stronger dark overlay for readability */}
      <div className="absolute inset-0 bg-black bg-opacity-50 z-10" />
      {/* Hero content */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4">
        <div className="text-xs tracking-widest text-gray-300 mb-2 uppercase font-semibold">BETA</div>
        <h1 className="text-6xl sm:text-7xl font-semimedium tracking-tight text-white font-inter mb-6">Milap</h1>
        <p className="text-xl sm:text-2xl text-gray-200 font-normal mb-8 text-center">
          Where builders connect and create together.
        </p>
        <button
          className="px-8 py-4 text-lg font-light text-black bg-white rounded-lg shadow-md transition-all duration-200 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
          onClick={() => navigate('/profile')}
        >
          Join Now
        </button>
        {/* Builder avatars row */}
        <div className="flex justify-center mt-8 space-x-2">
          {avatars.map((initials, i) => (
            <div key={i} className="w-8 h-8 rounded-full bg-gray-700 text-white flex items-center justify-center text-xs font-bold border border-gray-600 shadow-sm">
              {initials}
            </div>
          ))}
          <span className="ml-3 text-gray-200 text-base self-center">
            {userCount !== null ? `${userCount} builder${userCount === 1 ? '' : 's'}` : '...'} joined
          </span>
        </div>
        <div className="mt-3 text-gray-200 text-sm">
          Real builders. Real projects. Real progress.
        </div>
        {children && <div className="w-full flex justify-center">{children}</div>}
      </div>
    </section>
  );
};

export default Hero;