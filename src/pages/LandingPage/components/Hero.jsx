import { motion } from "framer-motion"
import { Search, ArrowRight, Users, Building2, TrendingUp } from "lucide-react"
import { useNavigate } from "react-router-dom"

const Hero = () => {
  const isAuthenticated = true
  const user = {
    fullname: "Alex",
    role: "employer",
  }

  const navigate = useNavigate()

  const stats = [
    { icon: Users, label: "Active Users", value: "1,200+" },
    { icon: Building2, label: "Companies", value: "500+" },
    { icon: TrendingUp, label: "Jobs Posted", value: "3,400+" },
  ]

  return (
    <section className="bg-gray-50 py-20">
      <div className="container mx-auto px-4 text-center">

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
        >
          Find Your Dream Job <br />
          <span className="text-blue-600">With JobSeek</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto"
        >
          Connecting talent with opportunity. Your future starts here and now.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex justify-center gap-4 mb-16"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/find-jobs")}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            <Search size={18} />
            Search Jobs
            <ArrowRight size={18} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              navigate(
                isAuthenticated && user.role === "employer"
                  ? "/employer/dashboard"
                  : "/login"
              )
            }
            className="bg-white-900 text-gray px-6 py-3 rounded-lg font-medium border border-gray-300 hover:bg-gray-100"
          >
            Post a Job
          </motion.button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
          {stats.map((Stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.2 }}
              className="bg-white p-6 rounded-xl shadow-sm"
            >
              <Stat.icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900">
                {Stat.value}
              </div>
              <div className="text-gray-600">{Stat.label}</div>
            </motion.div>
          ))}
        </div>

      </div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-300 rounded-full opacity-30 filter blur-3xl animate-blob">
           <div className="absolute bottom-20 right-10 w-32 h-32 bg-blue-300 rounded-full opacity-30 filter blur-3xl animate-blob">
            <div className="absolute top-10 right-20 w-32 h-32 bg-purple-300 rounded-full opacity-30 filter blur-3xl animate-blob">
           </div>
        </div>
        </div>
      </div>
    </section>
  )
}

export default Hero

