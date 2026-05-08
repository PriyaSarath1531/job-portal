import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { LogOut, User, Briefcase, Shield } from 'lucide-react';
import axiosInstance from '../../../utils/axiosinstance';
import { API_PATHS } from '../../../utils/apipaths';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;
    const checkAdmin = async () => {
      if (!isAuthenticated) {
        if (mounted) setIsAdmin(false);
        return;
      }
      try {
        // If the user is not an admin, this will 403.
        await axiosInstance.get(API_PATHS.ADMIN.FLAGGED_PROFILES);
        if (mounted) setIsAdmin(true);
      } catch {
        if (mounted) setIsAdmin(false);
      }
    };
    checkAdmin();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  return (
    <header className="bg-white border-b border-gray-100 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link 
              to={!isAuthenticated ? "/" : (user.role === 'employer' ? "/employer-dashboard" : "/dashboard")} 
              className="flex items-center space-x-2 text-indigo-600"
            >
              <Briefcase className="w-8 h-8" />
              <span className="text-xl font-bold tracking-tight text-gray-900">JobPortal</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to={!isAuthenticated ? "/#find-jobs" : (user.role === 'employer' ? "/employer-dashboard" : "/dashboard")} 
              className="text-gray-600 hover:text-indigo-600 font-medium"
              onClick={(e) => {
                if (!isAuthenticated) {
                    e.preventDefault();
                    document.getElementById('find-jobs')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              {user?.role === 'employer' ? 'Dashboard' : 'Find Jobs'}
            </Link>
            <Link 
              to="/#employers" 
              className="text-gray-600 hover:text-indigo-600 font-medium"
              onClick={(e) => {
                if (window.location.pathname === '/') {
                    e.preventDefault();
                    document.getElementById('employers')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
                Employers
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin/flagged-profiles"
                    className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 text-amber-800 font-bold hover:bg-amber-100 transition-colors"
                    title="Admin panel"
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </Link>
                )}
                <Link
                  to={user.role === 'employer' ? '/company-profile' : '/profile'}
                  className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600"
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">{user.name}</span>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-indigo-600 font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-all shadow-sm"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
