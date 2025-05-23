import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Hero from './components/Hero';
import Manifesto from './components/Manifesto';
import Footer from './components/Footer';
import ProfileProjects from './components/ProfileProjects';
import Navbar from './components/Navbar';
import FloatingChat from './components/FloatingChat';
import MilapLogo from '../milap-logo.svg';

const Landing = () => {
  return (
    <>
      <Hero />
      <Manifesto />
      <Footer />
    </>
  );
};

function App() {
  return (
    <div className="bg-[#111] text-white min-h-screen font-inter pb-28">
      <Router>
        <Navbar />
        <FloatingChat />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/profile" element={<ProfileProjects />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;