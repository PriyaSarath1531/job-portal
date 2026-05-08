import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axiosinstance';
import { API_PATHS } from '../../utils/apipaths';
import toast from 'react-hot-toast';
import { Mail, Lock, User, Briefcase, Building2, UserCircle, ArrowRight, Phone, CheckCircle2, Loader2 } from 'lucide-react';
import FaceAuth from '../../components/Auth/FaceAuth';

const SignUp = () => {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: searchParams.get('role') || 'jobseeker',
  });
  const [otp, setOtp] = useState('');
  const [serverOtp, setServerOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFaceEnroll, setShowFaceEnroll] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async () => {
    if (!formData.phone) return toast.error('Enter phone number');
    setLoading(true);
    try {
      const { data } = await axiosInstance.post(API_PATHS.AUTH.SEND_OTP, { phone: formData.phone });
      setServerOtp(data.otp); // Only returned in dev mode
      toast.success(`OTP sent! Your test code is: ${data.otp}`);
      if (data.otp) {
          console.log("----------------------------");
          console.log("YOUR REGISTRATION OTP IS:", data.otp);
          console.log("----------------------------");
      }
    } catch (error) {
      console.error("OTP Error Detail:", error);
      const msg = error.response?.data?.message || error.message || 'Failed to send OTP';
      toast.error(msg);
      if (error.message === "Network Error") {
          toast.error("Please ensure the backend is running at http://localhost:8000");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return toast.error('Enter OTP');
    setLoading(true);
    try {
      const { data } = await axiosInstance.post(API_PATHS.AUTH.VERIFY_OTP, { 
        phone: formData.phone, 
        otp: serverOtp, 
        enteredOtp: otp 
      });
      if (data.success) {
        setIsPhoneVerified(true);
        toast.success('Phone verified!');
      }
    } catch (error) {
      toast.error('Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitBasic = async (e) => {
    e.preventDefault();
    if (!isPhoneVerified) return toast.error('Verify your phone first');
    setLoading(true);
    try {
      const { data } = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        ...formData,
        isPhoneVerified: true
      });
      login(data, data.token);
      
      // Both Job seekers and Employers MUST enroll face for "perfect security"
      toast.success('Basic registration complete. Now enroll your face for secure login.');
      setShowFaceEnroll(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (showFaceEnroll) {
    return (
      <FaceAuth
        mode="register"
        onSuccess={() => {
          toast.success('Face enrolled! Your account is now fully secured.');
          setShowFaceEnroll(false);
          setStep(3);
        }}
      />
    );
  }

  if (step === 3) {
      return (
          <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
              <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-2xl border border-gray-100 shadow-xl">
                  <div className="text-center">
                      <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                      <h2 className="text-3xl font-extrabold text-gray-900">Registration Successful</h2>
                      <p className="mt-2 text-gray-500">Your face is enrolled. You can now log in securely using face recognition.</p>
                      <button 
                        onClick={() => {
                            if (formData.role === 'employer') navigate('/employer-dashboard');
                            else navigate('/dashboard');
                        }}
                        className="mt-8 w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
                      >
                          Go to Dashboard
                      </button>
                  </div>
              </div>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-2xl border border-gray-100 shadow-xl shadow-indigo-50/50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-xl text-indigo-600 mb-4">
            <UserCircle className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create Account</h2>
          <p className="mt-2 text-sm text-gray-500">Step 1: Basic Information</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmitBasic}>
          <div className="flex p-1 bg-gray-50 rounded-xl border border-gray-100">
            <button
              type="button"
              className={`flex-1 flex items-center justify-center py-2 px-4 rounded-lg text-sm font-bold transition-all ${
                formData.role === 'jobseeker'
                  ? 'bg-white text-indigo-600 shadow-sm border border-gray-100'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setFormData({ ...formData, role: 'jobseeker' })}
            >
              <User className="w-4 h-4 mr-2" />
              Job Seeker
            </button>
            <button
              type="button"
              className={`flex-1 flex items-center justify-center py-2 px-4 rounded-lg text-sm font-bold transition-all ${
                formData.role === 'employer'
                  ? 'bg-white text-indigo-600 shadow-sm border border-gray-100'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setFormData({ ...formData, role: 'employer' })}
            >
              <Building2 className="w-4 h-4 mr-2" />
              Employer
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="name"
                  type="text"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm transition-all bg-gray-50/50 focus:bg-white"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm transition-all bg-gray-50/50 focus:bg-white"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Mobile Number</label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                    name="phone"
                    type="tel"
                    required
                    disabled={isPhoneVerified}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm transition-all bg-gray-50/50 focus:bg-white disabled:opacity-50"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    />
                </div>
                {!isPhoneVerified && (
                    <button 
                        type="button" 
                        onClick={handleSendOtp}
                        className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all"
                    >
                        Send OTP
                    </button>
                )}
              </div>
            </div>

            {!isPhoneVerified && serverOtp && (
                <div className="flex space-x-2 animate-in fade-in slide-in-from-top-2">
                    <input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                    />
                    <button 
                        type="button" 
                        onClick={handleVerifyOtp}
                        className="px-6 py-3 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all"
                    >
                        Verify
                    </button>
                </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm transition-all bg-gray-50/50 focus:bg-white"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !isPhoneVerified}
            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center">
                <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                Processing...
              </span>
            ) : (
              <span className="flex items-center">
                {formData.role === 'jobseeker' ? 'Continue to Face Enrollment' : 'Create Account'} 
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;

