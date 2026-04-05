import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosinstance';
import { API_PATHS } from '../../utils/apipaths';
import { useAuth } from '../../context/AuthContext';
import JobCard from '../../components/Cards/JobCard';
import Header from '../LandingPage/components/Header';
import toast from 'react-hot-toast';
import { Search, MapPin, Filter, X } from 'lucide-react';

const JobSeekerDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState({
    keyword: '',
    location: '',
    category: '',
    type: '',
  });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(API_PATHS.JOBS.GET_ALL, {
        params: { ...search, userId: user?._id },
      });
      setJobs(data);
    } catch (error) {
      toast.error('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleToggleSave = async (jobId) => {
    try {
      const job = jobs.find((j) => j._id === jobId);
      if (job.isSaved) {
        await axiosInstance.delete(API_PATHS.SAVED_JOBS.UNSAVE(jobId));
        toast.success('Job removed from saved list');
      } else {
        await axiosInstance.post(API_PATHS.SAVED_JOBS.SAVE(jobId));
        toast.success('Job saved successfully');
      }
      fetchJobs(); // Refresh to update saved state
    } catch (error) {
      toast.error('Failed to update saved status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Job title, keywords..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                value={search.keyword}
                onChange={(e) => setSearch({ ...search, keyword: e.target.value })}
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Location..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                value={search.location}
                onChange={(e) => setSearch({ ...search, location: e.target.value })}
              />
            </div>
            <select
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
              value={search.type}
              onChange={(e) => setSearch({ ...search, type: e.target.value })}
            >
              <option value="">Job Type</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Remote">Remote</option>
              <option value="Internship">Internship</option>
              <option value="Contract">Contract</option>
            </select>
            <button
              type="submit"
              className="bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
            >
              Search Jobs
            </button>
          </form>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recommended for you</h2>
          <span className="text-sm text-gray-500 font-medium">{jobs.length} jobs found</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white h-64 rounded-2xl border border-gray-100 animate-pulse"></div>
            ))}
          </div>
        ) : jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                isSaved={job.isSaved}
                onToggleSave={handleToggleSave}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <Briefcase className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">No jobs found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search filters</p>
            <button
              onClick={() => {
                setSearch({ keyword: '', location: '', category: '', type: '' });
                fetchJobs();
              }}
              className="mt-6 text-indigo-600 font-bold hover:text-indigo-700"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobSeekerDashboard;
