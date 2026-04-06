import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import axiosInstance from '../../utils/axiosinstance';
import { API_PATHS } from '../../utils/apipaths';
import toast from 'react-hot-toast';
import { Camera, X, Loader2 } from 'lucide-react';

const FaceAuth = ({ mode = 'login', email, onSuccess, onClose }) => {
  const webcamRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = '/models'; // Ensure models are in public/models
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        setLoading(false);
      } catch (error) {
        console.error('Model loading failed:', error);
        toast.error('Failed to load face recognition models');
        onClose();
      }
    };
    loadModels();
  }, []);

  const captureAndVerify = async () => {
    if (!webcamRef.current) return;
    setProcessing(true);

    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        toast.error('Could not capture image');
        return;
      }

      const img = await faceapi.fetchImage(imageSrc);
      const detection = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        toast.error('No face detected. Please try again.');
        setProcessing(false);
        return;
      }

      const descriptor = Array.from(detection.descriptor);

      if (mode === 'login') {
        const { data } = await axiosInstance.post(API_PATHS.AUTH.FACE_LOGIN, { email, descriptor });
        onSuccess(data);
      } else {
        const { data } = await axiosInstance.post(API_PATHS.AUTH.REGISTER_FACE, { descriptor });
        onSuccess(data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Authentication failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              {mode === 'login' ? 'Face Login' : 'Register Face'}
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
              />
            )}
            {processing && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="text-white text-center">
                  <Loader2 className="w-8 h-8 mx-auto animate-spin mb-2" />
                  <p className="text-sm font-bold tracking-wider">PROCESSING...</p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={captureAndVerify}
            disabled={!modelsLoaded || processing}
            className="w-full mt-8 flex items-center justify-center space-x-2 bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
          >
            <Camera className="w-5 h-5" />
            <span>{mode === 'login' ? 'Verify Identity' : 'Save Face Data'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FaceAuth;
