

import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ArrowRight } from 'lucide-react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        
        {/* Find Jobs Section */}
        <section id="find-jobs" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Find Your Next Role</h2>
              <p className="mt-4 text-lg text-gray-500">Browse categories and find the perfect match.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {['Technology', 'Design', 'Marketing', 'Sales', 'Finance', 'Healthcare', 'Education', 'Customer Support'].map(cat => (
                <div key={cat} className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-indigo-500 hover:shadow-md transition-all text-center cursor-pointer group">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-gray-900">{cat}</h3>
                  <p className="text-xs text-gray-500 mt-1">100+ open roles</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
                <Link to="/signup" className="inline-flex items-center text-indigo-600 font-bold hover:text-indigo-700">
                    Browse all jobs <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
            </div>
          </div>
        </section>

        <Features />

        {/* Employers Section */}
        <section id="employers" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Trusted by Top Employers</h2>
              <p className="mt-4 text-lg text-gray-500">Over 500+ companies use JobPortal to find their next hires.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-8 items-center opacity-50 grayscale hover:grayscale-0 transition-all">
               {/* Placeholders for logos */}
               {[1,2,3,4,5,6].map(i => (
                 <div key={i} className="flex justify-center">
                    <div className="h-12 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
                 </div>
               ))}
            </div>
            <div className="mt-20 bg-indigo-600 rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-3xl font-bold mb-4">Are you hiring?</h3>
                    <p className="text-indigo-100 mb-8 max-w-2xl mx-auto">Get your job posting in front of thousands of qualified candidates today.</p>
                    <Link to="/signup?role=employer" className="inline-block px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-xl">
                        Start Posting Jobs
                    </Link>
                </div>
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-indigo-500 rounded-full opacity-20"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-400 rounded-full opacity-20"></div>
            </div>
          </div>
        </section>
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
