import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import axiosInstance from '../../utils/axiosinstance';
import { API_PATHS } from '../../utils/apipaths';
import toast from 'react-hot-toast';
import { Camera, X, Loader2 } from 'lucide-react';

const FaceAuth = ({ mode = 'login', email, onSuccess, onClose }) => {
  const webcamRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [capturedCount, setCapturedCount] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState('');

  useEffect(() => {
    // Helpful when users say "registration cancelled" after clicking Create Account:
    // most often the camera permission prompt was dismissed/blocked.
    if (cameraError) toast.error(cameraError);
  }, [cameraError]);

  const captureFrame = () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    return imageSrc || null;
  };

  const captureAndVerify = async () => {
    if (!cameraReady) {
      toast.error('Camera is still warming up. Please wait a moment.');
      return;
    }
    setProcessing(true);
    try {
      if (mode === 'login') {
        const image = captureFrame();
        if (!image) {
          toast.error(cameraReady ? 'Could not capture image' : 'Camera not ready. Please allow camera access.');
          return;
        }
        const { data } = await axiosInstance.post(API_PATHS.AUTH.FACE_LOGIN, { email, image });
        onSuccess(data);
      } else if (mode === 'verify') {
        const image = captureFrame();
        if (!image) {
            toast.error(cameraReady ? 'Could not capture image' : 'Camera not ready. Please allow camera access.');
            return;
        }
        const { data } = await axiosInstance.post(API_PATHS.AUTH.VERIFY_FACE, { image });
        if (data.success) {
            onSuccess();
        } else {
            toast.error(data.message || 'Face verification failed');
        }
      } else {
        const images = [];
        const TARGET = 5;
        setCapturedCount(0);

        for (let i = 0; i < TARGET; i += 1) {
          // Increase delay for the first capture to allow camera to adjust, 
          // then smaller delays for subsequent captures.
          const delay = i === 0 ? 1000 : 500;
          // eslint-disable-next-line no-await-in-loop
          await new Promise((r) => setTimeout(r, delay));
          const img = captureFrame();
          if (img) {
            images.push(img);
            setCapturedCount(images.length);
          }
        }

        if (images.length < 3) {
          toast.error(cameraReady ? 'Could not capture enough images. Please try again.' : 'Camera not ready. Please allow camera access.');
          return;
        }

        const { data } = await axiosInstance.post(API_PATHS.AUTH.REGISTER_FACE, { images });
        onSuccess(data);
      }
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.detail?.message ||
        error.response?.data?.detail ||
        error.message ||
        'Authentication failed';
      toast.error(msg);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>
        )}

        <div className="p-8">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              {mode === 'login' ? 'Face Login' : mode === 'verify' ? 'Live Verification' : 'Register Face'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Position your face in the center of the camera
            </p>
          </div>

          <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100 border-2 border-gray-100">
            {loading ? (
              <div className="absolute inset-0 flex flex-center items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              </div>
            ) : (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover"
                videoConstraints={{ facingMode: 'user' }}
                onUserMedia={() => {
                  setCameraReady(true);
                  setCameraError('');
                }}
                onUserMediaError={() => {
                  setCameraReady(false);
                  setCameraError('Camera permission denied or not available. Allow camera access and retry.');
                }}
              />
            )}
            {processing && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="text-white text-center">
                  <Loader2 className="w-8 h-8 mx-auto animate-spin mb-2" />
                  <p className="text-sm font-bold tracking-wider">
                    {mode === 'register' ? `CAPTURING (${capturedCount}/5)...` : 'PROCESSING...'}
                  </p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={captureAndVerify}
            disabled={processing || !!cameraError}
            className="w-full mt-8 flex items-center justify-center space-x-2 bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
          >
            <Camera className="w-5 h-5" />
            <span>
              {processing
                ? (mode === 'login' ? 'Verifying…' : mode === 'verify' ? 'Verifying…' : 'Saving…')
                : (mode === 'login' ? 'Verify Identity' : mode === 'verify' ? 'Scan & Apply' : 'Save Face Data')}
            </span>
          </button>

          {cameraError && (
            <p className="mt-3 text-sm text-rose-600 font-semibold">
              {cameraError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FaceAuth;
