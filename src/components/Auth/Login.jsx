// src/components/Auth/Login.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowRight, FaRobot } from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }
    setLoading(true);
    const success = await login(email, password);
    if (!success) {
      console.log("Login failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="bg-white/30 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/40">
        <div className="text-center mb-8">
          {/* Robot Logo */}
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-purple-600 to-violet-600 flex items-center justify-center shadow-lg">
            <FaRobot className="text-white text-3xl" />
          </div>
          
          {/* ✅ Welcome text with same gradient as button and simple shadow */}
                  <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 via-purple-500 to-violet-600 bg-clip-text text-transparent" 
              style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.05)' }}>
            Welcome to UniGuide
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mt-2">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative group">
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-200" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/50 text-gray-800 placeholder:text-gray-400"
                placeholder="admin@university.edu"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative group">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-200" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/50 text-gray-800 placeholder:text-gray-400"
                placeholder="••••••••"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-500 transition-colors duration-200"
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
          </div>

          {/* <div className="flex justify-end">
            <Link 
              to="/forgot-password" 
              className="text-sm text-purple-500 hover:text-purple-600 transition-colors duration-200 font-medium"
            >
              Forgot password?
            </Link>
          </div> */}

          {/* Button with same gradient */}
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full py-3 bg-gradient-to-r from-purple-600 via-purple-500 to-violet-600 text-white rounded-xl font-semibold overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            
            <span className="relative flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform duration-200" />
                </>
              )}
            </span>
          </button>
        </form>

        <p className="text-center mt-6 text-gray-500 text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-purple-500 hover:text-purple-600 font-semibold transition-colors duration-200">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;