import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, Clock, DollarSign, Bookmark, BookmarkCheck, ShieldCheck } from 'lucide-react';
import moment from 'moment';

const JobCard = ({ job, isSaved, onToggleSave }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl hover:shadow-indigo-50/50 transition-all group relative">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-xl group-hover:scale-110 transition-transform">
            {job.company?.companyLogo ? (
              <img src={job.company.companyLogo} alt={job.company.companyName} className="w-full h-full object-cover rounded-xl" />
            ) : (
              job.company?.companyName?.charAt(0) || 'J'
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
              <Link to={`/job/${job._id}`}>{job.title}</Link>
            </h3>
            <div className="flex items-center text-sm text-gray-500 font-medium">
              {job.company?.companyName}
              {(job.company?.isVerified || job.company?.trustScore > 80) && (
                <ShieldCheck className="w-4 h-4 text-emerald-500 ml-1" title="Verified Employer" />
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => onToggleSave(job._id)}
          className={`p-2 rounded-lg transition-colors ${
            isSaved ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:bg-gray-50 hover:text-indigo-600'
          }`}
        >
          {isSaved ? <BookmarkCheck className="w-5 h-5 fill-current" /> : <Bookmark className="w-5 h-5" />}
        </button>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center text-gray-500 text-sm">
          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
          {job.location}
        </div>
        <div className="flex items-center text-gray-500 text-sm">
          <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
          {job.type}
        </div>
        <div className="flex items-center text-gray-500 text-sm">
          <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
          {job.salaryMin} - {job.salaryMax}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
        <div className="flex items-center text-xs text-gray-400 font-medium">
          <Clock className="w-3.5 h-3.5 mr-1" />
          {moment(job.createdAt).fromNow()}
        </div>
        <Link
          to={`/job/${job._id}`}
          className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center"
        >
          Details
        </Link>
      </div>
      
      {job.applicationStatus && (
        <div className="absolute top-4 right-16 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700">
          {job.applicationStatus}
        </div>
      )}
    </div>
  );
};

export default JobCard;
