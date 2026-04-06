import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../utils/axiosinstance';
import { API_PATHS } from '../../utils/apipaths';
import Header from '../LandingPage/components/Header';
import toast from 'react-hot-toast';
import { User, Mail, FileText, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';

const ApplicationViewer = () => {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const { data } = await axiosInstance.get(API_PATHS.APPLICATIONS.GET_BY_JOB(jobId));
      setApplications(data);
    } catch (error) {
      toast.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [jobId]);

  const handleStatusUpdate = async (appId, status) => {
    try {
      await axiosInstance.put(API_PATHS.APPLICATIONS.UPDATE_STATUS(appId), { status });
      toast.success(`Application ${status}`);
      fetchApplications();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const statusColors = {
    Applied: 'bg-blue-100 text-blue-700',
    'Under Review': 'bg-indigo-100 text-indigo-700',
    'Interview Scheduled': 'bg-purple-100 text-purple-700',
    Rejected: 'bg-red-100 text-red-700',
    Accepted: 'bg-emerald-100 text-emerald-700',
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Applicants</h1>
          <p className="text-gray-500 mt-1 font-medium">Review and manage candidates for this position</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse"></div>)}
          </div>
        ) : applications.length > 0 ? (
          <div className="grid gap-6">
            {applications.map((app) => (
              <div key={app._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-all hover:shadow-md">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                    {app.applicant?.avatar ? (
                      <img src={app.applicant.avatar} alt={app.applicant.name} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <User className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center">
                      {app.applicant?.name}
                      {(app.applicant?.isVerified || app.applicant?.trustScore > 80) && (
                        <ShieldCheck className="w-4 h-4 text-emerald-500 ml-1.5" title="Verified Candidate" />
                      )}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 font-medium">
                      <Mail className="w-4 h-4 mr-1.5 text-gray-400" />
                      {app.applicant?.email}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColors[app.status]}`}>
                    {app.status}
                  </div>
                  
                  {app.applicant?.resume && (
                    <a
                      href={app.applicant.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 font-bold text-sm bg-indigo-50 px-4 py-2 rounded-lg transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      <span>View Resume</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </a>
                  )}

                  <div className="flex items-center gap-2 border-l border-gray-100 pl-4">
                    <button
                      onClick={() => handleStatusUpdate(app._id, 'Accepted')}
                      className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                      title="Accept Candidate"
                    >
                      <CheckCircle className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(app._id, 'Rejected')}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Reject Candidate"
                    >
                      <XCircle className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(app._id, 'Under Review')}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      title="Move to Under Review"
                    >
                      <Clock className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <Users className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">No applicants yet</h3>
            <p className="text-gray-500 mt-2">Check back later for new applications</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationViewer;
 </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationViewer;
