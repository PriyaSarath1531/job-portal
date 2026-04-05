import React from 'react';
import { Search, Shield, Zap, TrendingUp } from 'lucide-react';

const features = [
  {
    name: 'Smart Search',
    description: 'Find jobs by category, location, and salary with our advanced search algorithms.',
    icon: Search,
  },
  {
    name: 'Verified Employers',
    description: 'We ensure all job postings are from legitimate and verified companies.',
    icon: Shield,
  },
  {
    name: 'Quick Apply',
    description: 'Apply to multiple jobs in seconds with your saved profile and resume.',
    icon: Zap,
  },
  {
    name: 'Career Tracking',
    description: 'Monitor your application status and get real-time updates from employers.',
    icon: TrendingUp,
  },
];

const Features = () => {
  return (
    <div className="bg-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            A better way to build your career
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Everything you need to find your next great opportunity or the perfect candidate for your team.
          </p>
        </div>

        <div className="mt-20">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10 lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.name} className="relative bg-white p-8 rounded-2xl shadow-sm border border-gray-100 transition-all hover:-translate-y-1 hover:shadow-md">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-100">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-bold text-gray-900">{feature.name}</p>
                </dt>
                <dd className="mt-4 ml-16 text-base text-gray-500">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default Features;
