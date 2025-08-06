'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Rocket, 
  Users, 
  Star, 
  ArrowRight, 
  Play,
  Zap,
  Heart,
  Trophy,
  Globe,
  Crown
} from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour: () => void;
}

const features = [
  {
    icon: <Users className="w-7 h-7" />,
    title: "10M+ Elite Users",
    description: "World-class talent network",
    color: "from-blue-500 to-cyan-500",
    stats: "99.8% Success Rate"
  },
  {
    icon: <Star className="w-7 h-7" />,
    title: "4.97★ Premium Rating",
    description: "Unmatched excellence",
    color: "from-yellow-500 to-orange-500",
    stats: "$2B+ Projects Completed"
  },
  {
    icon: <Zap className="w-7 h-7" />,
    title: "AI-Powered Matching",
    description: "Instant perfect matches",
    color: "from-purple-500 to-pink-500",
    stats: "< 30 sec Match Time"
  },
  {
    icon: <Globe className="w-7 h-7" />,
    title: "195+ Countries",
    description: "Global elite network",
    color: "from-green-500 to-emerald-500",
    stats: "24/7 Premium Support"
  }
];

const floatingElements = [
  { icon: '👑', delay: 0, x: 15, y: 25, scale: 1.2 },
  { icon: '💎', delay: 0.3, x: 85, y: 15, scale: 1.0 },
  { icon: '🚀', delay: 0.6, x: 25, y: 75, scale: 1.1 },
  { icon: '⚡', delay: 0.9, x: 75, y: 85, scale: 0.9 },
  { icon: '🌟', delay: 1.2, x: 90, y: 45, scale: 1.3 },
  { icon: '🔮', delay: 1.5, x: 10, y: 60, scale: 1.0 },
  { icon: '🎯', delay: 1.8, x: 60, y: 20, scale: 1.1 },
  { icon: '💫', delay: 2.1, x: 40, y: 90, scale: 0.8 },
];

export default function WelcomeModal({ isOpen, onClose, onStartTour }: WelcomeModalProps) {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isHomePage, setIsHomePage] = useState(false);
  
  // Check if we're on the home page after component mounts
  useEffect(() => {
    const pathname = window.location.pathname;
    setIsHomePage(pathname === '/' || pathname === '');
  }, []);
  
  // Don't render anything until we've determined the page
  if (typeof window === 'undefined') {
    return null;
  }
  
  if (!isHomePage) {
    return null;
  }

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-lg"
          onClick={onClose}
        />

        {/* Premium Floating Background Elements */}
        {floatingElements.map((element, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0, rotate: -360, filter: 'blur(10px)' }}
            animate={{ 
              opacity: [0.2, 0.4, 0.2], 
              scale: [element.scale * 0.8, element.scale, element.scale * 0.8],
              rotate: [0, 360],
              filter: 'blur(0px)',
              x: [element.x - 5, element.x + 5, element.x],
              y: [element.y - 5, element.y + 5, element.y]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              delay: element.delay,
              ease: "easeInOut"
            }}
            className="absolute text-2xl pointer-events-none"
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
            }}
          >
            {element.icon}
          </motion.div>
        ))}

        {/* Main Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Premium Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50" />
          
          {/* Animated Border */}
          <motion.div
            className="absolute inset-0 rounded-3xl"
            style={{
              background: 'linear-gradient(45deg, #fbbf24, #3b82f6, #8b5cf6, #ef4444, #10b981)',
              backgroundSize: '400% 400%',
            }}
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
          
          <div className="relative p-8 md:p-12">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-6 shadow-xl"
              >
                <Crown className="w-10 h-10 text-white" />
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-blue-900 bg-clip-text text-transparent mb-4"
              >
                Welcome to FreelanceHub Elite
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-gray-600 max-w-2xl mx-auto"
              >
                Experience the future of freelancing with AI-powered matching, premium security, and unparalleled user experience.
              </motion.p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className={`relative p-6 rounded-2xl bg-gradient-to-r ${feature.color} text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 2, delay: index * 0.5 }}
                        className="text-white"
                      >
                        {feature.icon}
                      </motion.div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                      <p className="text-white/90 mb-2">{feature.description}</p>
                      <div className="text-sm font-semibold text-white/80">{feature.stats}</div>
                    </div>
                  </div>
                  
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 opacity-0 hover:opacity-100"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 2, 
                      ease: "linear",
                      repeatDelay: 1
                    }}
                  />
                </motion.div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                onClick={onStartTour}
                className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
              >
                <Play className="w-5 h-5" />
                <span>Start Interactive Tour</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                onClick={onClose}
                className="px-8 py-4 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Skip for now
              </motion.button>
            </div>

            {/* Premium Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, type: "spring", stiffness: 200 }}
              className="absolute top-4 right-4 flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              <span>PREMIUM</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
} 