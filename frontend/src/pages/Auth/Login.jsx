import React, { useState, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axiosinstance';
import { API_PATHS } from '../../utils/apipaths';
import toast from 'react-hot-toast';
import { Mail, Lock, Briefcase, ArrowRight, Camera, User, Building2 } from 'lucide-react';
import FaceAuth from '../../components/Auth/FaceAuth';

const Login = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState('credentials'); // 'credentials' or 'face'
  const [userId, setUserId] = useState('');
  const [showWebcam, setShowWebcam] = useState(false);
  const webcamRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam && (roleParam === 'jobseeker' || roleParam === 'employer')) {
      setRole(roleParam);
    }
  }, [searchParams]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axiosInstance.post('/api/auth/login', { email, password });
      
      if (res.data.userId) {
        setUserId(res.data.userId);
        setStep('face');
        setShowWebcam(true);
        toast.success('Now verify your face');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const captureFace = async () => {
    if (!webcamRef.current) return;
    
    setLoading(true);
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      const base64Image = imageSrc.replace(/^data:image\/\w+;base64,/, '');

      const formData = new FormData();
      const blob = await fetch(imageSrc).then(r => r.blob());
      formData.append('image', blob);

      const res = await axiosInstance.post('/api/face/verify', {
        userId,
      }, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Alternative: using base64
      const res2 = await axiosInstance.post('/api/face/verify-base64', {
        userId,
        image: base64Image,
      });

      if (res2.data.success) {
        localStorage.setItem('token', res2.data.token);
        toast.success('Login successful!');
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Face verification failed');
    } finally {
      setLoading(false);
    }
  };

  const [showFaceAuth, setShowFaceAuth] = useState(false);
  const [showFaceEnroll, setShowFaceEnroll] = useState(false);
  const [tempUserData, setTempUserData] = useState(null);

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axiosInstance.post(API_PATHS.AUTH.LOGIN, { email, password });
      
      if (!data.isFaceEnrolled) {
          // Store data temporarily, but don't finalize login until face is enrolled
          setTempUserData(data);
          // We set the token now because REGISTER_FACE requires authentication
          localStorage.setItem('token', data.token); 
          toast.success('Password verified. Please enroll your face to secure your account.');
          setShowFaceEnroll(true);
          return;
      }

      login(data, data.token);
      toast.success('Successfully logged in!');
      if (data.role === 'employer') {
        navigate('/employer-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFaceEnrollSuccess = () => {
    if (tempUserData) {
        const finalizedUser = { ...tempUserData, isFaceEnrolled: true };
        login(finalizedUser, finalizedUser.token);
        toast.success('Face enrolled and logged in successfully!');
        if (finalizedUser.role === 'employer') {
            navigate('/employer-dashboard');
        } else {
            navigate('/dashboard');
        }
    }
  };

  const handleFaceAuthSuccess = (data) => {
    login(data, data.token);
    toast.success(`Welcome back, ${data.name}!`);
    if (data.role === 'employer') {
      navigate('/employer-dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Login</h1>

        {step === 'credentials' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Continue'}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600 text-center mb-4">Face Verification Required</p>

            {!showWebcam ? (
              <button
                onClick={() => setShowWebcam(true)}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg"
              >
                Start Face Scan
              </button>
            ) : (
              <>
                <div className="relative w-full bg-black rounded-lg overflow-hidden">
                  <Webcam
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    width="100%"
                    height="300"
                  />
                </div>
                <button
                  onClick={captureFace}
                  disabled={loading}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify Face'}
                </button>
              </>
            )}
          </div>
        )}

        <p className="text-center text-gray-600 mt-4">
          No account? <a href="/signup" className="text-blue-500 hover:underline">Sign Up</a>
        </p>
      </div>
    </div>
  );
};

export default Login;

