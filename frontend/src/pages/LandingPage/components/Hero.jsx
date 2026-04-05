import React from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Briefcase, ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <div className="relative bg-white pt-24 pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
            <h1>
              <span className="block text-sm font-semibold uppercase tracking-wide text-indigo-600 sm:text-base lg:text-sm xl:text-base">
                New and Better Way to Hire
              </span>
              <span className="mt-1 block text-4xl tracking-tight font-extrabold sm:text-5xl xl:text-6xl">
                <span className="block text-gray-900">Find your dream job</span>
                <span className="block text-indigo-600">in one click</span>
              </span>
            </h1>
            <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
              We provide a complete solution for job seekers and employers to find the best match for their needs. Browse thousands of jobs and apply with ease.
            </p>
            <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Link
                  to="/signup?role=jobseeker"
                  className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10 shadow-lg shadow-indigo-100 transition-all hover:-translate-y-1"
                >
                  Find a Job <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  to="/signup?role=employer"
                  className="flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-xl text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-all hover:-translate-y-1"
                >
                  Hire Talent
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
            <div className="relative mx-auto w-full rounded-2xl shadow-2xl overflow-hidden border border-gray-100 bg-gray-50 aspect-square flex items-center justify-center">
                {/* Modern visual placeholder */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-white opacity-50"></div>
                <div className="relative flex flex-col items-center space-y-4">
                    <div className="w-24 h-24 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl rotate-12">
                        <Briefcase className="w-12 h-12 text-white" />
                    </div>
                    <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg -rotate-12 absolute -top-4 -right-12">
                        <MapPin className="w-8 h-8 text-white" />
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 max-w-xs transform translate-y-8">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <Search className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">Job Matching</p>
                                <p className="text-xs text-gray-500">Finding the perfect match...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
