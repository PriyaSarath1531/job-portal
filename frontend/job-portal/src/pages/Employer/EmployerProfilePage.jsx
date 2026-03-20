import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axiosinstance';
import { API_PATHS } from '../../utils/apipaths';
import uploadImage from '../../utils/uploadimage';
import Header from '../LandingPage/components/Header';
import toast from 'react-hot-toast';
import { Building2, Mail, MapPin, Globe, Camera, Edit3, Link as LinkIcon, FileText } from 'lucide-react';

const EmployerProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    companyName: user?.companyName || '',
    companyDescription: user?.companyDescription || '',
    companyLogo: user?.companyLogo || '',
  });

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const { imageUrl } = await uploadImage(file);
      const updatedData = { ...formData, companyLogo: imageUrl };
      setFormData(updatedData);
      
      const { data } = await axiosInstance.put(API_PATHS.USER.UPDATE_PROFILE, updatedData);
      updateUser(data);
      toast.success('Company logo updated!');
    } catch (error) {
      toast.error('Failed to upload logo');
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
      toast.success('Company profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <Header />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-48 bg-gradient-to-r from-indigo-600 to-indigo-800 relative">
            <div className="absolute -bottom-16 left-12 group">
              <div className="w-32 h-32 rounded-3xl bg-white p-2 shadow-xl border border-gray-50 relative overflow-hidden">
                {formData.companyLogo ? (
                  <img src={formData.companyLogo} alt={formData.companyName} className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  <div className="w-full h-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Building2 className="w-12 h-12" />
                  </div>
                )}
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="w-8 h-8 text-white" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              </div>
            </div>
          </div>

          <div className="pt-20 p-12">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
              <div className="flex-1">
                <h1 className="text-3xl font-extrabold text-gray-900">{user?.companyName || 'Update Company Name'}</h1>
                <div className="flex flex-wrap gap-4 mt-3 text-gray-500 font-medium">
                  <span className="flex items-center"><Mail className="w-4 h-4 mr-2 text-indigo-500" /> {user?.email}</span>
                  <span className="flex items-center"><Building2 className="w-4 h-4 mr-2 text-indigo-500" /> Hiring Account</span>
                </div>
              </div>
              <button
                onClick={() => setEditing(!editing)}
                className="flex items-center space-x-2 bg-indigo-50 text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-100 transition-colors"
              >
                <Edit3 className="w-5 h-5" />
                <span>{editing ? 'Cancel' : 'Edit Profile'}</span>
              </button>
            </div>

            {editing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-8 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Company Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm bg-gray-50/50"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Primary Contact Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm bg-gray-50/50"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Company Description</label>
                  <textarea
                    rows="6"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm bg-gray-50/50"
                    placeholder="Tell candidates about your company culture and mission..."
                    value={formData.companyDescription}
                    onChange={(e) => setFormData({ ...formData, companyDescription: e.target.value })}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
                >
                  Save Profile Details
                </button>
              </form>
            ) : (
              <div className="space-y-12">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-3 text-indigo-500" /> About Company
                  </h3>
                  <div className="prose prose-indigo max-w-none text-gray-600 leading-relaxed bg-gray-50/50 p-8 rounded-3xl border border-gray-100/50">
                    {user?.companyDescription || 'No description provided. Add one to help candidates learn about your company.'}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Account Type</p>
                      <p className="text-gray-900 font-bold">Employer / Recruiter</p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                      <LinkIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Company ID</p>
                      <p className="text-gray-900 font-bold truncate max-w-[150px]">{user?._id}</p>
                    </div>
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

export default EmployerProfilePage;
