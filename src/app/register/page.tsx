"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiUsers, FiBriefcase } from "react-icons/fi";
import { useAuth } from "../AuthContext";

// Animation variants
const containerVariants = {
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

const itemVariants = {
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

type FormData = {
  name: string;
  email: string;
  password: string;
  role: 'client' | 'freelancer' | '';
};

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm<FormData>();
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const password = watch('password', '');

  useEffect(() => {
    router.prefetch('/login');
  }, [router]);

  const onSubmit = async (data: FormData) => {
    setServerError("");
    setSuccess(false);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const err = await res.json();
        setServerError(err.message || "Registration failed. Please check your information and try again.");
        return;
      }
      
      const result = await res.json();
      if (res.ok && result.user) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      }
    } catch (e) {
      setServerError("Network error. Please check your connection and try again.");
    }
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, color: 'bg-gray-500', text: 'Very Weak' };
    
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (password.match(/[a-z]+/)) strength += 1;
    if (password.match(/[A-Z]+/)) strength += 1;
    if (password.match(/[0-9]+/)) strength += 1;
    
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
    const texts = ['Very Weak', 'Weak', 'Moderate', 'Strong', 'Very Strong'];
    
    return {
      strength: (strength / 5) * 100,
      color: colors[strength - 1] || 'bg-gray-500',
      text: texts[strength - 1] || 'Very Weak'
    };
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <motion.div 
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="bg-gray-900/70 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-800/50"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="p-8">
            <motion.div className="text-center mb-8" variants={itemVariants}>
              <motion.h1 
                className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent mb-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Create an Account
              </motion.h1>
              <p className="text-gray-400">Join our community of talented professionals</p>
            </motion.div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <motion.div className="flex flex-col space-y-2" variants={itemVariants}>
                <label className="text-gray-400">Name</label>
                <input 
                  type="text" 
                  placeholder="Name" 
                  className="p-2 rounded bg-gray-900 text-white border border-gray-700"
                  {...register("name", { required: "Name is required" })}
                />
                {errors.name && <span className="text-red-400 text-sm">{errors.name.message as string}</span>}
              </motion.div>

              <motion.div className="flex flex-col space-y-2" variants={itemVariants}>
                <label className="text-gray-400">Email</label>
                <input 
                  type="email" 
                  placeholder="Email" 
                  autoComplete="username" 
                  className="p-2 rounded bg-gray-900 text-white border border-gray-700"
                  {...register("email", { required: "Email is required" })}
                />
                {errors.email && <span className="text-red-400 text-sm">{errors.email.message as string}</span>}
              </motion.div>

              <motion.div className="flex flex-col space-y-2" variants={itemVariants}>
                <label className="text-gray-400">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Password" 
                    autoComplete="new-password" 
                    className="p-2 rounded bg-gray-900 text-white border border-gray-700 w-full"
                    {...register("password", { required: "Password is required", minLength: { value: 6, message: "Min 6 chars" } })}
                  />
                  <button 
                    type="button" 
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.password && <span className="text-red-400 text-sm">{errors.password.message as string}</span>}
                <div className="w-full bg-gray-900 h-2 rounded mt-2" style={{ background: `linear-gradient(to right, ${passwordStrength.color}, ${passwordStrength.color})`, backgroundSize: `${passwordStrength.strength}% 100%` }}></div>
                <p className="text-gray-400 text-sm">{passwordStrength.text}</p>
              </motion.div>

              <motion.div className="flex flex-col space-y-2" variants={itemVariants}>
                <label className="text-gray-400">Role</label>
                <select 
                  className="p-2 rounded bg-gray-900 text-white border border-gray-700"
                  {...register("role", { required: "Role is required" })}
                >
                  <option value="">Select role</option>
                  <option value="client">Client</option>
                  <option value="freelancer">Freelancer</option>
                </select>
                {errors.role && <span className="text-red-400 text-sm">{errors.role.message as string}</span>}
              </motion.div>

              <motion.button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded mt-2 disabled:opacity-50"
                disabled={isSubmitting}
                variants={itemVariants}
              >
                {isSubmitting ? "Registering..." : "Register"}
              </motion.button>
              {serverError && <div className="text-red-500 text-sm mt-2">{serverError}</div>}
              {success && <div className="text-green-500 text-sm mt-2">Registration successful! You can now log in.</div>}
            </form>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}