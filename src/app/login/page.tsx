"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiUserPlus } from "react-icons/fi";
import { useAuth } from "../AuthContext";

// Floating animation variants
const floatingContainer = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.1
    }
  }
};

const floatingItem = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      damping: 12,
      stiffness: 100
    }
  }
};

const backgroundShapes = [
  { id: 1, top: '10%', left: '10%', size: '200px', color: 'from-blue-500/20 to-indigo-500/20' },
  { id: 2, top: '70%', left: '80%', size: '300px', color: 'from-purple-500/20 to-pink-500/20' },
  { id: 3, top: '40%', left: '50%', size: '150px', color: 'from-emerald-500/20 to-cyan-500/20' },
];

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const { login, isLoading, isAuthenticated, user } = useAuth();
  const [loginSuccess, setLoginSuccess] = useState(false);

  const searchParams = useSearchParams();
  
  useEffect(() => {
    setIsMounted(true);
    
    // Check for error in URL params
    const error = searchParams.get('error');
    if (error === 'AuthError') {
      setServerError('Authentication error. Please try logging in again.');
    }
    
    // If user is already authenticated, redirect them
    if (isAuthenticated && user) {
      router.push('/dashboard');
    }
    
    return () => setIsMounted(false);
  }, [searchParams, isAuthenticated, user, router]);

  const onSubmit = async (data: any) => {
    setServerError("");
    setLoginSuccess(false);
    
    try {
      // Call the login function from AuthContext with email and password
      await login(data.email, data.password);
      
      // Set login success state for animation
      setLoginSuccess(true);
      
      // Clear any error parameters from URL
      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      window.history.replaceState({}, '', url.toString());
      
      // Reset login success state after 3 seconds in case redirect fails
      setTimeout(() => {
        setLoginSuccess(false);
      }, 3000);
      
      // The redirection logic is handled in the AuthContext
    } catch (error) {
      console.error('Login error:', error);
      setServerError("An error occurred during login. Please try again.");
      setLoginSuccess(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden relative">
      {/* Animated background shapes */}
      {backgroundShapes.map((shape) => (
        <motion.div
          key={shape.id}
          className={`absolute rounded-full bg-gradient-to-br ${shape.color} blur-3xl`}
          style={{
            width: shape.size,
            height: shape.size,
            top: shape.top,
            left: shape.left,
          }}
          animate={{
            y: [0, 15, 0],
            x: [0, 10, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 8 + Math.random() * 10,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
        />
      ))}

      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="bg-gray-900/70 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-800/50"
            variants={floatingContainer}
            initial="hidden"
            animate="visible"
          >
            <div className="p-8">
              <motion.div 
                className="text-center mb-8"
                variants={floatingItem}
              >
                <motion.h1 
                  className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent mb-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Welcome Back
                </motion.h1>
                <p className="text-gray-400">Sign in to your account to continue</p>
              </motion.div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <motion.div variants={floatingItem}>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      type="email"
                      placeholder="Email address"
                      autoComplete="username"
                      className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
                      {...register("email", { 
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address"
                        }
                      })}
                    />
                  </div>
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p 
                        className="mt-1 text-sm text-red-400"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        {errors.email.message as string}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div variants={floatingItem}>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      autoComplete="current-password"
                      className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
                      {...register("password", { 
                        required: "Password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters"
                        }
                      })}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <FiEyeOff className="h-5 w-5" />
                      ) : (
                        <FiEye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <AnimatePresence>
                    {errors.password && (
                      <motion.p 
                        className="mt-1 text-sm text-red-400"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        {errors.password.message as string}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                <div className="flex items-center justify-between">
                  <motion.div 
                    className="flex items-center"
                    variants={floatingItem}
                  >
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-700 rounded bg-gray-800/50"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
                      Remember me
                    </label>
                  </motion.div>
                  <motion.div variants={floatingItem}>
                    <a href="#" className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
                      Forgot password?
                    </a>
                  </motion.div>
                </div>

                <motion.div variants={floatingItem}>
                  <AnimatePresence>
                    {serverError && (
                      <motion.div 
                        className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        {serverError}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <button
                    type="submit"
                    disabled={isLoading || loginSuccess}
                    className={`w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${
                      loginSuccess 
                        ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:ring-blue-500'
                    } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {loginSuccess ? 'Success! Redirecting...' : 'Signing in...'}
                      </>
                    ) : loginSuccess ? (
                      <>
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Success! Redirecting...
                      </>
                    ) : (
                      <>
                        Sign in <FiArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </motion.div>
              </form>

              <motion.div 
                className="mt-6 text-center text-sm text-gray-400"
                variants={floatingItem}
              >
                <p>
                  Don't have an account?{' '}
                  <a 
                    href="/register" 
                    className="font-medium text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center"
                  >
                    Sign up <FiUserPlus className="ml-1 h-4 w-4" />
                  </a>
                </p>
              </motion.div>
            </div>

            <div className="px-6 py-4 bg-gray-800/50 text-center">
              <p className="text-xs text-gray-500">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}