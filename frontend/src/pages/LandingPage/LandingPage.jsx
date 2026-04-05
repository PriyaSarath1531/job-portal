

import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <Features />
      </main>
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500">
          <p>&copy; 2024 JobPortal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
