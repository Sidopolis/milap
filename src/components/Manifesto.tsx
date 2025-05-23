import React, { useEffect, useRef, useState } from 'react';

const sidhantFacts = [
  "Let's build something legendary.",
  "Code, coffee, and community.",
  "Dream big. Ship fast.",
  "Builder at heart, always learning."
];

const Manifesto = () => {
  const manifestoRef = useRef<HTMLElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [factIndex, setFactIndex] = useState(0);
  const [showAbout, setShowAbout] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const fullText = 'The Milap Manifesto';
  
  useEffect(() => {
    if (window.gsap) {
      window.gsap.fromTo(
        manifestoRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1.2, delay: 0.3, ease: 'power2.out' }
      );
    }
  }, []);

  // Animated underline style for important words
  const animatedUnderline =
    'relative font-semibold text-white cursor-pointer group transition-colors duration-300';
  const underlineSpan =
    'absolute left-0 -bottom-1 h-0.5 bg-gradient-to-r from-white via-gray-200 to-white transition-all duration-300 w-0 group-hover:w-full';
  const accentText = 'group-hover:text-white';

  // Special gradient animation for "match" word - starts white, shows gradient on hover
  const gradientText = 'relative text-white hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-blue-400 hover:via-purple-500 hover:to-pink-400 transition-all duration-700 ease-in-out';
  
  // Emoji split effect for "tribe" word
  const handleEmojiHover = () => {
    setShowEmoji(true);
  };
  const handleEmojiLeave = () => {
    setShowEmoji(false);
  };

  // Handle cycling facts for Sidhant
  const handleSidhantHover = () => {
    setShowTooltip(true);
    setFactIndex((prev) => (prev + 1) % sidhantFacts.length);
  };

  // Close about card on outside click
  useEffect(() => {
    if (!showAbout) return;
    const handle = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('#about-sidhant-card')) return;
      setShowAbout(false);
    };
    window.addEventListener('mousedown', handle);
    return () => window.removeEventListener('mousedown', handle);
  }, [showAbout]);

  return (
    <section ref={manifestoRef} className="py-16">
      <div className="max-w-2xl mx-auto text-center px-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-white font-inter mb-10">
          The Milap Manifesto
        </h2>
        <p className="text-gray-300 text-base sm:text-lg mb-8">
          Hey <span className={`${animatedUnderline} ${accentText}`}>builders<span className={underlineSpan}></span></span> ✌️ I'm <span
            className="relative font-semibold text-white cursor-pointer group hover:underline"
            onMouseEnter={handleSidhantHover}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowAbout(true)}
          >Sidhant</span>, founder of Milap.
        </p>
        <p className="text-white text-lg sm:text-xl font-normal mb-8">
          Milap isn't another platform. It's a movement for creators and makers to actually <span className={`${animatedUnderline} ${accentText}`}>connect<span className={underlineSpan}></span></span>.
        </p>
        <p className="text-gray-300 text-base sm:text-lg mb-8">
          No endless scrolling. No shouting into the void. Just real people, real projects. 💯
        </p>
        <div className="py-5 px-4 bg-white/5 rounded-xl mb-8">
          <p className="text-gray-300 text-base sm:text-lg mb-1">
            We've all been there—alone with our ideas, wondering who else is building something cool.
          </p>
          <p className="font-medium text-white text-base sm:text-lg">
            That's why Milap exists: to match you with people building the same thing.
          </p>
        </div>
        <p className="text-gray-300 text-base sm:text-lg mb-8">
          Tag your project. Find your <span 
            className="relative font-semibold cursor-pointer"
            onMouseEnter={handleEmojiHover}
            onMouseLeave={handleEmojiLeave}
          >
            tribe
            {showEmoji && (
              <span className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs animate-fade-in">
                👥✨
              </span>
            )}
          </span>. Connect instantly. ⚡
        </p>
        <p className="text-white text-lg sm:text-xl font-normal mb-8">
          Here, you just need your drive and the <span className={`${animatedUnderline} ${accentText}`}>energy<span className={underlineSpan}></span></span> of like-minded builders.
        </p>
        <p className="text-2xl font-semibold text-white mt-12">
          Ready to find your <span className={gradientText}>match</span> and build something epic? 
        </p>
      </div>
      {/* About Sidhant Floating Card */}
      {showAbout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div id="about-sidhant-card" className="relative bg-[#18181b] rounded-2xl shadow-2xl border border-gray-800 p-10 w-full max-w-xs flex flex-col items-center animate-fade-in">
            {/* Placeholder black-and-white photo */}
            <div className="w-24 h-24 rounded-full overflow-hidden mb-6 border-4 border-white/10 shadow">
              <img
                src="/face_bw.png"
                alt="Sidhant"
                className="w-full h-full object-cover grayscale"
              />
            </div>
            <div className="text-xl font-bold text-white mb-2">Sidhant</div>
            <div className="text-gray-400 text-sm mb-4">Founder & Builder</div>
            <div className="w-12 border-t border-gray-700 mb-5"></div>
            <div className="text-gray-200 text-base mb-6 text-center leading-relaxed">
              🚀 Dreamer, builder, and community matchmaker.<br/>
              I believe in <span className="font-semibold text-white">shipping fast</span>, <span className="font-semibold text-white">learning out loud</span>, and helping makers find their tribe.<br/>
              If you're building something cool, let's connect and make it legendary.<br/>
              <span className="text-2xl mt-2 inline-block">💡☕️</span>
            </div>
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl px-2"
              onClick={() => setShowAbout(false)}
              aria-label="Close about Sidhant"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default Manifesto;