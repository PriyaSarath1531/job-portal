import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axiosinstance';
import { API_PATHS } from '../../utils/apipaths';
import uploadImage from '../../utils/uploadimage';
import Header from '../LandingPage/components/Header';
import toast from 'react-hot-toast';
import { User, Mail, FileText, Upload, Trash2, Camera, MapPin, Briefcase } from 'lucide-react';

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    avatar: user?.avatar || '',
    resume: user?.resume || '',
  });

  const handleFileChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const { imageUrl } = await uploadImage(file);
      const updatedData = { ...formData, [type]: imageUrl };
      setFormData(updatedData);
      
      // Auto-save the change to the profile
      const { data } = await axiosInstance.put(API_PATHS.USER.UPDATE_PROFILE, updatedData);
      updateUser(data);
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} updated!`);
    } catch (error) {
      toast.error(`Failed to upload ${type}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axiosInstance.put(API_PATHS.USER.UPDATE_PROFILE, formData);
      updateUser(data);
      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResume = async () => {
    if (!window.confirm('Are you sure you want to delete your resume?')) return;
    try {
      await axiosInstance.delete(API_PATHS.USER.DELETE_RESUME, { data: { resumeUrl: user.resume } });
      updateUser({ ...user, resume: '' });
      setFormData({ ...formData, resume: '' });
      toast.success('Resume deleted');
    } catch (error) {
      toast.error('Failed to delete resume');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-32 bg-indigo-600 relative">
            <div className="absolute -bottom-12 left-8 group">
              <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg border border-gray-100 relative overflow-hidden">
                {formData.avatar ? (
                  <img src={formData.avatar} alt={user?.name} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div className="w-full h-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <User className="w-10 h-10" />
                  </div>
                )}
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="w-6 h-6 text-white" />
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />
                </label>
              </div>
            </div>
          </div>

          <div className="pt-16 p-8">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900">{user?.name}</h1>
                <div className="flex items-center text-gray-500 mt-1 font-medium">
                  <Mail className="w-4 h-4 mr-2" /> {user?.email}
                </div>
              </div>
              <button
                onClick={() => setEditing(!editing)}
                className="text-sm font-bold text-indigo-600 border-2 border-indigo-100 px-4 py-2 rounded-xl hover:bg-indigo-50 transition-colors"
              >
                {editing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {editing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-lg">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm bg-gray-50/50"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
                >
                  Save Changes
                </button>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100/50">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-indigo-500" /> Resume / CV
                  </h3>
                  {user?.resume ? (
                    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                      <div className="flex items-center space-x-3 truncate">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                          <FileText className="w-5 h-5" />
                        </div>
                        <a href={user.resume} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-indigo-600 truncate hover:underline">
                          View Resume
                        </a>
                      </div>
                      <button onClick={handleDeleteResume} className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-2xl bg-white hover:bg-indigo-50/30 hover:border-indigo-200 transition-all cursor-pointer group">
                      <Upload className="w-8 h-8 text-gray-300 mb-2 group-hover:text-indigo-500 transition-colors" />
                      <span className="text-sm font-bold text-gray-400 group-hover:text-indigo-600 transition-colors">Click to upload resume</span>
                      <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">PDF, DOC, DOCX up to 5MB</span>
                      <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => handleFileChange(e, 'resume')} />
                    </label>
                  )}
                </div>

                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100/50">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500 font-medium">Profile Completion</span>
                            <span className="text-sm font-bold text-indigo-600">80%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600 rounded-full" style={{ width: '80%' }}></div>
                        </div>
                        <p className="text-xs text-gray-400">Complete your profile to get 2x more visibility from recruiters.</p>
                    </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
