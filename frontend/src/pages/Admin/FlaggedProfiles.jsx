import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosinstance';
import { API_PATHS } from '../../utils/apipaths';
import toast from 'react-hot-toast';

const FlaggedProfiles = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(API_PATHS.ADMIN.FLAGGED_PROFILES);
      setUsers(data.users || []);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load flagged profiles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (userId) => {
    try {
      await axiosInstance.post(API_PATHS.ADMIN.APPROVE_PROFILE(userId));
      toast.success('Approved');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Approve failed');
    }
  };

  const reject = async (userId) => {
    try {
      await axiosInstance.post(API_PATHS.ADMIN.REJECT_PROFILE(userId));
      toast.success('Rejected');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Reject failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">Flagged Job Seeker Profiles</h1>
          <button
            onClick={load}
            className="px-4 py-2 rounded-xl bg-white border border-gray-200 font-bold text-gray-700 hover:bg-gray-100"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-6 border border-gray-100">Loading…</div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 border border-gray-100">No flagged profiles.</div>
        ) : (
          <div className="space-y-4">
            {users.map((u) => (
              <div key={u._id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-extrabold text-gray-900">{u.name}</div>
                    <div className="text-sm text-gray-500">{u.email}</div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold">
                        {u.verificationStatus || 'genuine'}
                      </span>
                      <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 font-bold">
                        {u.accountStatus}
                      </span>
                      <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 font-bold">
                        Trust: {u.trustScore}
                      </span>
                      {typeof u.verificationConfidence === 'number' && (
                        <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold">
                          AI: {Math.round(u.verificationConfidence * 100)}%
                        </span>
                      )}
                    </div>

                    {Array.isArray(u.verificationReasons) && u.verificationReasons.length > 0 && (
                      <ul className="mt-3 list-disc list-inside text-sm text-gray-700">
                        {u.verificationReasons.slice(0, 6).map((r, idx) => (
                          <li key={idx}>{r}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => approve(u._id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-extrabold hover:bg-emerald-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => reject(u._id)}
                      className="px-4 py-2 rounded-xl bg-rose-600 text-white font-extrabold hover:bg-rose-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FlaggedProfiles;

