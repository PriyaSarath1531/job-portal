import React from 'react'
import { Briefcase } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const Header = () => {
  const isAuthenticated = true
  const user = {
    fullname: "Alex",
    role: "employer",
  }

  const navigate = useNavigate()

  return (
    <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center rounded-lg">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-blue-900">JobSeek</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <span
              onClick={() => navigate("/find-jobs")}
              className="cursor-pointer text-gray-700 hover:text-blue-500 font-medium"
            >
              Find Jobs
            </span>

            <span
              onClick={() =>
                navigate(
                  isAuthenticated && user?.role === "employer"
                    ? "/employer/dashboard"
                    : "/login"
                )
              }
              className="cursor-pointer text-gray-700 hover:text-blue-500 font-medium"
            >
              For Employers
            </span>
          </nav>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-gray-700">
                  Welcome, {user.fullname}
                </span>

                <span
                  onClick={() =>
                    navigate(
                      user.role === "employer"
                        ? "/employer/dashboard"
                        : "/find-jobs"
                    )
                  }
                  className="cursor-pointer bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Dashboard
                </span>
              </>
            ) : (
              <>
                <span
                  onClick={() => navigate("/login")}
                  className="cursor-pointer text-gray-700 hover:text-blue-500"
                >
                  Login
                </span>

                <span
                  onClick={() => navigate("/signup")}
                  className="cursor-pointer bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg"
                >
                  Sign Up
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  )
}

export default Header
