import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosinstance';
import { API_PATHS } from '../../utils/apipaths';
import Header from '../LandingPage/components/Header';
import toast from 'react-hot-toast';
import { Briefcase, Users, Edit3, Trash2, Power, ExternalLink } from 'lucide-react';
import moment from 'moment';

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      const { data } = await axiosInstance.get(API_PATHS.JOBS.GET_EMPLOYER_JOBS);
      setJobs(data);
    } catch (error) {
      toast.error('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleToggleClose = async (jobId) => {
    try {
      await axiosInstance.put(API_PATHS.JOBS.TOGGLE_CLOSE(jobId));
      toast.success('Job status updated');
      fetchJobs();
    } catch (error) {
      toast.error('Failed to update job status');
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      await axiosInstance.delete(API_PATHS.JOBS.DELETE(jobId));
      toast.success('Job deleted successfully');
      setJobs(jobs.filter(j => j._id !== jobId));
    } catch (error) {
      toast.error('Failed to delete job');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Manage Job Postings</h1>
          <p className="text-gray-500 mt-1 font-medium">View and update your active listings</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white rounded-2xl animate-pulse"></div>)}
          </div>
        ) : jobs.length > 0 ? (
          <div className="grid gap-6">
            {jobs.map((job) => (
              <div key={job._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${job.isClosed ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {job.isClosed ? 'Closed' : 'Active'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 font-medium">
                    <span className="flex items-center"><Users className="w-4 h-4 mr-1.5 text-indigo-500" /> {job.applicationCount} Applications</span>
                    <span>Posted {moment(job.createdAt).format('MMM DD, YYYY')}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to={`/applicants/${job._id}`}
                    className="flex items-center space-x-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg font-bold hover:bg-indigo-100 transition-colors text-sm"
                  >
                    <Users className="w-4 h-4" />
                    <span>View Applicants</span>
                  </Link>
                  <button
                    onClick={() => handleToggleClose(job._id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition-colors text-sm ${job.isClosed ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}
                    title={job.isClosed ? 'Reopen Job' : 'Close Job'}
                  >
                    <Power className="w-4 h-4" />
                    <span>{job.isClosed ? 'Open' : 'Close'}</span>
                  </button>
                  <button
                    onClick={() => handleDelete(job._id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Delete Job"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <Briefcase className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">No jobs posted yet</h3>
            <p className="text-gray-500 mt-2">Start by posting your first job opportunity</p>
            <Link to="/post-job" className="inline-block mt-6 bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100">
              Post a Job
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageJobs;
