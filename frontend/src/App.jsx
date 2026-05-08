import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Auth Pages
import Login from './pages/Auth/Login';
import SignUp from './pages/Auth/SignUp';

// General Pages
import LandingPage from './pages/LandingPage/LandingPage';

// Job Seeker Pages
import JobSeekerDashboard from './pages/JobSeeker/JobseekerDashboard';
import JobDetails from './pages/JobSeeker/JobDetails';
import SavedJobs from './pages/JobSeeker/SavedJobs';
import UserProfile from './pages/JobSeeker/UserProfile';

// Employer Pages
import EmployerDashboard from './pages/Employer/EmployerDashboard';
import JobPostingForm from './pages/Employer/JobPostingForm';
import ManageJobs from './pages/Employer/ManageJobs';
import ApplicationViewer from './pages/Employer/ApplicationViewer';
import EmployerProfilePage from './pages/Employer/EmployerProfilePage';
import EditProfileDetails from './pages/Employer/EditProfileDetails';
import FlaggedProfiles from './pages/Admin/FlaggedProfiles';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Job Seeker Protected Routes */}
          <Route element={<ProtectedRoute requiredRole="jobseeker" />}>
            <Route path="/dashboard" element={<JobSeekerDashboard />} />
            <Route path="/job/:jobId" element={<JobDetails />} />
            <Route path="/saved-jobs" element={<SavedJobs />} />
            <Route path="/profile" element={<UserProfile />} />
          </Route>

          {/* Employer Protected Routes */}
          <Route element={<ProtectedRoute requiredRole="employer" />}>
            <Route path="/employer-dashboard" element={<EmployerDashboard />} />
            <Route path="/post-job" element={<JobPostingForm />} />
            <Route path="/manage-jobs" element={<ManageJobs />} />
            <Route path="/applicants/:jobId" element={<ApplicationViewer />} />
            <Route path="/company-profile" element={<EmployerProfilePage />} />
            <Route path="/edit-profile" element={<EditProfileDetails />} />
          </Route>

          {/* Admin (email allowlist) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin/flagged-profiles" element={<FlaggedProfiles />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <Toaster position="top-center" />
    </AuthProvider>
  );
};

export default App;
