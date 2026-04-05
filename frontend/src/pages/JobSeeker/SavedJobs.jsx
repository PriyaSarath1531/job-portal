import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosinstance';
import { API_PATHS } from '../../utils/apipaths';
import JobCard from '../../components/Cards/JobCard';
import Header from '../LandingPage/components/Header';
import toast from 'react-hot-toast';
import { Bookmark } from 'lucide-react';

const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedJobs = async () => {
    try {
      const { data } = await axiosInstance.get(API_PATHS.SAVED_JOBS.GET_MY);
      setSavedJobs(data);
    } catch (error) {
      toast.error('Failed to fetch saved jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const handleToggleSave = async (jobId) => {
    try {
      await axiosInstance.delete(API_PATHS.SAVED_JOBS.UNSAVE(jobId));
      toast.success('Job removed from saved list');
      setSavedJobs(savedJobs.filter(item => item.job._id !== jobId));
    } catch (error) {
      toast.error('Failed to remove job');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Saved Jobs</h1>
          <p className="text-gray-500 mt-1 font-medium">Keep track of the opportunities you're interested in</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-64 bg-white rounded-2xl animate-pulse"></div>)}
          </div>
        ) : savedJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedJobs.map((item) => (
              <JobCard
                key={item._id}
                job={item.job}
                isSaved={true}
                onToggleSave={handleToggleSave}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Bookmark className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">No saved jobs</h3>
            <p className="text-gray-500 mt-2">Browse jobs and save them to view later</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedJobs;
