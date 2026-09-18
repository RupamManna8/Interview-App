// LoginSignup.jsx
import React, { useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Sparkles,
  X,
  Briefcase,
  TrendingUp,
  Award,
  Clock,
  Target,
  Shield,
} from "lucide-react";
import { UserContext } from "../../Context/UserContext.jsx";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../Routes/paths";

const LoginSignup = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const isSignupMode = !isLogin;

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { login, signup, googleLogin } = useContext(UserContext);

  // Handle input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let result;

      if (isLogin) {
        // Login
        result = await login(formData.email, formData.password);
      } else {
        // Signup with validation
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }

        if (formData.password.length < 8) {
          setError("Password must be at least 8 characters");
          setLoading(false);
          return;
        }

        result = await signup(formData.name, formData.email, formData.password);
      }

      if (result.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate(ROUTE_PATHS.USER_DASHBOARD);
        }, 1500);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-cyan-500/5 to-indigo-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-indigo-500/[0.02] to-purple-500/[0.02] rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-6xl flex flex-col lg:flex-row items-stretch gap-6 lg:gap-8">
        {/* Left Side - Branding & Features */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="hidden lg:flex flex-1 items-center"
        >
          <div className="max-w-lg">
            {/* Logo */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  InterviewIQ
                </h1>
                <p className="text-xs text-slate-500">AI-Powered Interview Intelligence</p>
              </div>
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-slate-900 mb-3 leading-tight"
            >
              Transform Your Interview Performance
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-base text-slate-600 mb-8 leading-relaxed"
            >
              Master every interview with real-time AI feedback, personalized insights, and data-driven strategies that get you hired.
            </motion.p>

            {/* Feature List */}
            <div className="space-y-3">
              {[
                { icon: Target, text: "AI-powered interview simulations", color: "from-indigo-500 to-indigo-600" },
                { icon: TrendingUp, text: "Real-time performance analytics", color: "from-emerald-500 to-emerald-600" },
                { icon: Award, text: "Personalized skill gap analysis", color: "from-amber-500 to-amber-600" },
                { icon: Clock, text: "Industry-specific question banks", color: "from-cyan-500 to-cyan-600" },
                { icon: Shield, text: "Placement readiness tracking", color: "from-purple-500 to-purple-600" },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-3 group"
                >
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${feature.color} bg-opacity-10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-slate-700 font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Trust Badge */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-8 pt-6 border-t border-slate-200"
            >
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 border-2 border-white"></div>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">Trusted by 10,000+ professionals</p>
                  <p className="text-xs text-slate-500">Average 92% interview success rate</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Login/Signup Card - Compact Version */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-[460px] mx-auto lg:mx-0"
        >
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden backdrop-blur-sm">
            {/* Decorative top gradient */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600"></div>
            
            {/* Header with toggle - Compact */}
            <div className="p-5 pb-3">
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  onClick={() => navigate(ROUTE_PATHS.HOME)}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all"
                  aria-label="Exit to landing page"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <motion.div
                  animate={{ rotate: isLogin ? 0 : 180 }}
                  transition={{ duration: 0.4, type: "spring" }}
                  className="w-10 h-10 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl flex items-center justify-center shadow-sm"
                >
                  {isLogin ? (
                    <LogIn className="w-5 h-5 text-indigo-600" />
                  ) : (
                    <UserPlus className="w-5 h-5 text-indigo-600" />
                  )}
                </motion.div>
              </div>

              <div className="mb-4">
                <h2 className="text-xl font-bold text-slate-900">
                  {isLogin ? "Welcome Back" : "Create Account"}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {isLogin 
                    ? "Sign in to continue your interview journey" 
                    : "Start your journey to interview mastery"}
                </p>
              </div>

              {/* Toggle Buttons - Compact */}
              <div className="flex p-1 bg-slate-100 rounded-lg mb-4">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${
                    isLogin
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${
                    !isLogin
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Sign Up
                </button>
              </div>
            </div>

            {/* Form - Compact */}
            <div className="pl-5 pr-5 pb-5 pt-0">
              <AnimatePresence mode="wait">
                <motion.form
                  key={isLogin ? "login" : "signup"}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSubmit}
                  className="space-y-3"
                >
                  {/* Name field - Signup only */}
                  {!isLogin && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        Full Name
                      </label>
                      <div className="relative group">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="John Doe"
                          className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                          required={!isLogin}
                        />
                      </div>
                    </div>
                  )}

                  {/* Email field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Email Address
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Password field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Password
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-9 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-slate-400 hover:text-slate-600 transition-colors" />
                        ) : (
                          <Eye className="w-4 h-4 text-slate-400 hover:text-slate-600 transition-colors" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password - Signup only */}
                  {!isLogin && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        Confirm Password
                      </label>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-9 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                          required={!isLogin}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4 text-slate-400 hover:text-slate-600 transition-colors" />
                          ) : (
                            <Eye className="w-4 h-4 text-slate-400 hover:text-slate-600 transition-colors" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Remember me & Forgot password - Login only */}
                  {isLogin && (
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20 focus:ring-offset-0"
                        />
                        <span className="text-xs text-slate-600">
                          Remember me
                        </span>
                      </label>
                      <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                        Forgot password?
                      </button>
                    </div>
                  )}

                  {/* Password requirements - Signup only */}
                  {!isLogin && (
                    <div className="space-y-1 text-xs">
                      <p className="text-slate-500">Password requirements:</p>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle
                          className={`w-3 h-3 ${
                            formData.password.length >= 8
                              ? "text-emerald-500"
                              : "text-slate-300"
                          }`}
                        />
                        <span
                          className={
                            formData.password.length >= 8
                              ? "text-emerald-600"
                              : "text-slate-500"
                          }
                        >
                          At least 8 characters
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Error message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-1.5 p-2 bg-red-50 text-red-600 rounded-lg text-xs border border-red-100"
                      >
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Success message */}
                  <AnimatePresence>
                    {success && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-1.5 p-2 bg-emerald-50 text-emerald-600 rounded-lg text-xs border border-emerald-100"
                      >
                        <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>
                          {isLogin
                            ? "Login successful! Redirecting..."
                            : "Account created successfully! Redirecting..."}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit button */}
                  <motion.button
                    type="submit"
                    disabled={loading || success}
                    whileHover={{ scale: loading || success ? 1 : 1.01 }}
                    whileTap={{ scale: loading || success ? 1 : 0.98 }}
                    className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 relative overflow-hidden ${
                      loading || success
                        ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg"
                    }`}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : success ? (
                      <span className="flex items-center justify-center gap-1.5">
                        <CheckCircle className="w-4 h-4" />
                        {isLogin ? "Redirecting..." : "Welcome aboard!"}
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1.5">
                        {isLogin ? "Sign In" : "Create Account"}
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </motion.button>
                </motion.form>
              </AnimatePresence>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white text-slate-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="flex justify-center scale-90">
                <GoogleLogin
                  onSuccess={async (res) => {
                    const result = await googleLogin(res.credential);
                    if (result?.ok) {
                      setSuccess(true);
                      setTimeout(() => {
                        navigate(ROUTE_PATHS.USER_DASHBOARD);
                      }, 1500);
                    } else {
                      setError(result?.message || "Google authentication failed");
                    }
                  }}
                  onError={() =>
                    setError(
                      isLogin ? "Google login failed" : "Google signup failed",
                    )
                  }
                  shape="round"
                  theme="outline"
                  text={isLogin ? "signin_with" : "signup_with"}
                  width="260"
                />
              </div>

              {/* Terms and Privacy */}
              <p className={`text-[11px] text-slate-500 text-center ${isLogin ? "mt-4" : "mt-3"}`}>
                By continuing, you agree to our{" "}
                <button className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
                  Terms
                </button>{" "}
                and{" "}
                <button className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
                  Privacy
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginSignup;