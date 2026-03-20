import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosinstance';
import { API_PATHS } from '../../utils/apipaths';
import { useAuth } from '../../context/AuthContext';
import Header from '../LandingPage/components/Header';
import toast from 'react-hot-toast';
import { Briefcase, Users, CheckCircle, XCircle, TrendingUp, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmployerDashboard = () => {
  const [stats, setStats] = useState({
    totalJobsPosted: 0,
    totalApplicationsReceived: 0,
    totalHired: 0,
    totalRejected: 0,
    activeJobs: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await axiosInstance.get(API_PATHS.ANALYTICS.OVERVIEW);
        setStats(data);
      } catch (error) {
        toast.error('Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const statCards = [
    { label: 'Total Jobs Posted', value: stats.totalJobsPosted, icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Active Jobs', value: stats.activeJobs, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Applications', value: stats.totalApplicationsReceived, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Hired', value: stats.totalHired, icon: CheckCircle, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Employer Dashboard</h1>
            <p className="text-gray-500 mt-1 font-medium">Manage your job postings and applications</p>
          </div>
          <Link
            to="/post-job"
            className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all hover:-translate-y-1"
          >
            <Plus className="w-5 h-5" />
            <span>Post New Job</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((card, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${card.bg} ${card.color}`}>
                  <card.icon className="w-6 h-6" />
                </div>
              </div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{card.label}</p>
              <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{loading ? '...' : card.value}</h3>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link to="/manage-jobs" className="p-4 rounded-2xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
                  <Briefcase className="w-5 h-5" />
                </div>
                <p className="font-bold text-gray-900">Manage Jobs</p>
                <p className="text-xs text-gray-500 mt-1">View and edit your postings</p>
              </Link>
              <Link to="/company-profile" className="p-4 rounded-2xl border border-gray-100 hover:border-emerald-100 hover:bg-emerald-50/30 transition-all group">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <p className="font-bold text-gray-900">Company Profile</p>
                <p className="text-xs text-gray-500 mt-1">Update your company info</p>
              </Link>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-4">
              <TrendingUp className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Hiring Trends</h3>
            <p className="text-gray-500 mt-2 max-w-xs">You've seen a 12% increase in applications this week!</p>
            <div className="mt-6 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: '70%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;
