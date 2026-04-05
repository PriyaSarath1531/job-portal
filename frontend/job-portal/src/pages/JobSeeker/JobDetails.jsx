import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosinstance';
import { API_PATHS } from '../../utils/apipaths';
import { useAuth } from '../../context/AuthContext';
import Header from '../LandingPage/components/Header';
import toast from 'react-hot-toast';
import { MapPin, Briefcase, DollarSign, Clock, Building2, ChevronLeft, Send, CheckCircle } from 'lucide-react';
import moment from 'moment';

const JobDetails = () => {
  const { jobId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data } = await axiosInstance.get(API_PATHS.JOBS.GET_BY_ID(jobId), {
          params: { userId: user?._id },
        });
        setJob(data);
      } catch (error) {
        toast.error('Failed to fetch job details');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId, user, navigate]);

  const handleApply = async () => {
    if (!user.resume) {
      toast.error('Please upload your resume in your profile before applying');
      return;
    }
    setApplying(true);
    try {
      await axiosInstance.post(API_PATHS.APPLICATIONS.APPLY(jobId));
      toast.success('Application submitted successfully!');
      setJob({ ...job, applicationStatus: 'Applied' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center pt-20">Loading...</div>;
  if (!job) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <Header />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-500 hover:text-indigo-600 mb-6 transition-colors font-medium"
        >
          <ChevronLeft className="w-5 h-5 mr-1" /> Back to jobs
        </button>

        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="p-8 md:p-12 border-b border-gray-50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-bold text-3xl">
                  {job.company?.companyLogo ? (
                    <img src={job.company.companyLogo} alt={job.company.companyName} className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    job.company?.companyName?.charAt(0) || 'J'
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">{job.title}</h1>
                  <div className="flex items-center mt-2 text-gray-500 font-medium">
                    <Building2 className="w-5 h-5 mr-2 text-indigo-500" />
                    {job.company?.companyName}
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                {job.applicationStatus ? (
                  <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-6 py-3 rounded-xl font-bold border border-emerald-100">
                    <CheckCircle className="w-5 h-5" />
                    <span>Applied ({job.applicationStatus})</span>
                  </div>
                ) : (
                  <button
                    onClick={handleApply}
                    disabled={applying || job.isClosed}
                    className="flex items-center justify-center space-x-2 bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {applying ? 'Applying...' : job.isClosed ? 'Closed' : 'Apply Now'}
                    {!applying && !job.isClosed && <Send className="w-5 h-5" />}
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100/50">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Salary</p>
                <p className="text-gray-900 font-bold flex items-center">
                  <DollarSign className="w-4 h-4 mr-1 text-indigo-500" />
                  {job.salaryMin} - {job.salaryMax}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100/50">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Location</p>
                <p className="text-gray-900 font-bold flex items-center">
                  <MapPin className="w-4 h-4 mr-1 text-indigo-500" />
                  {job.location}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100/50">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Job Type</p>
                <p className="text-gray-900 font-bold flex items-center">
                  <Briefcase className="w-4 h-4 mr-1 text-indigo-500" />
                  {job.type}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100/50">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Posted</p>
                <p className="text-gray-900 font-bold flex items-center">
                  <Clock className="w-4 h-4 mr-1 text-indigo-500" />
                  {moment(job.createdAt).fromNow()}
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Job Description</h2>
            <div className="prose prose-indigo max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
              {job.description}
            </div>

            <div className="mt-12 p-8 bg-indigo-50 rounded-3xl border border-indigo-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">About the Company</h3>
              <p className="text-gray-600 leading-relaxed">
                {job.company?.companyDescription || 'No description available for this company.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
