'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Sparkles, Zap, Crown, MessageCircle, BookOpen, Video, Phone } from 'lucide-react';
import { useTour } from '@/components/providers/TourProvider';

const helpOptions = [
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: "Take the Tour",
    description: "Interactive guided tour",
    action: "tour",
    color: "from-yellow-500 to-orange-500"
  },
  {
    icon: <MessageCircle className="w-5 h-5" />,
    title: "Live Chat",
    description: "Chat with our experts",
    action: "chat",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: <BookOpen className="w-5 h-5" />,
    title: "Help Center",
    description: "Browse our knowledge base",
    action: "help",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: <Video className="w-5 h-5" />,
    title: "Video Tutorials",
    description: "Watch step-by-step guides",
    action: "videos",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: <Phone className="w-5 h-5" />,
    title: "Contact Support",
    description: "Get premium support",
    action: "contact",
    color: "from-red-500 to-rose-500"
  }
];

export default function FloatingHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isHomePage, setIsHomePage] = useState(false);
  const { startTour } = useTour();
  
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

  const handleOptionClick = (action: string) => {
    switch (action) {
      case 'tour':
        startTour();
        break;
      case 'chat':
        // Implement live chat
        console.log('Opening live chat...');
        break;
      case 'help':
        // Open help center
        window.open('/help', '_blank');
        break;
      case 'videos':
        // Open video tutorials
        window.open('/tutorials', '_blank');
        break;
      case 'contact':
        // Open contact form
        window.open('/contact', '_blank');
        break;
    }
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Help Options Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 25,
              staggerChildren: 0.1
            }}
            className="absolute bottom-20 right-0 w-80"
          >
            {/* Glass morphism container */}
            <div 
              className="backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-4 overflow-hidden"
              style={{
                background: `
                  linear-gradient(135deg, 
                    rgba(255, 255, 255, 0.15) 0%, 
                    rgba(255, 255, 255, 0.05) 100%
                  )
                `,
                boxShadow: `
                  0 20px 40px rgba(0, 0, 0, 0.1),
                  0 10px 20px rgba(0, 0, 0, 0.05),
                  inset 0 1px 0 rgba(255, 255, 255, 0.3)
                `
              }}
            >
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  <h3 className="text-lg font-bold text-white">Premium Support</h3>
                </div>
                <p className="text-sm text-white/70">How can we help you today?</p>
              </motion.div>

              {/* Help Options */}
              <div className="space-y-2">
                {helpOptions.map((option, index) => (
                  <motion.button
                    key={option.action}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleOptionClick(option.action)}
                    whileHover={{ 
                      scale: 1.02, 
                      x: 4,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full p-3 rounded-xl text-left transition-all duration-200 group relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${option.color.split(' ')[1]}, ${option.color.split(' ')[3]})`
                    }}
                  >
                    {/* Hover glow effect */}
                    <motion.div
                      className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100"
                      transition={{ duration: 0.2 }}
                    />
                    
                    <div className="relative flex items-center space-x-3">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ 
                          repeat: Infinity, 
                          duration: 2,
                          ease: "easeInOut"
                        }}
                        className="text-white"
                      >
                        {option.icon}
                      </motion.div>
                      <div>
                        <h4 className="font-semibold text-white text-sm">{option.title}</h4>
                        <p className="text-white/80 text-xs">{option.description}</p>
                      </div>
                    </div>

                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 opacity-0 group-hover:opacity-100"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 2, 
                        ease: "linear",
                        repeatDelay: 1
                      }}
                    />
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Help Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ 
          scale: 1.1,
          boxShadow: "0 20px 40px rgba(59, 130, 246, 0.4)"
        }}
        whileTap={{ scale: 0.95 }}
        className="relative w-16 h-16 rounded-full shadow-2xl overflow-hidden group"
        style={{
          background: 'linear-gradient(135deg, #fbbf24, #3b82f6, #8b5cf6)',
          backgroundSize: '200% 200%',
          animation: 'gradient-shift 3s ease infinite'
        }}
      >
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-blue-500/20 to-purple-600/20 blur-xl"
          animate={{ 
            scale: isHovered ? 1.5 : 1,
            opacity: isHovered ? 0.8 : 0.4
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Button content */}
        <div className="relative flex items-center justify-center h-full">
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-6 h-0.5 bg-white rounded-full transform rotate-45 absolute" />
                <div className="w-6 h-0.5 bg-white rounded-full transform -rotate-45 absolute" />
              </motion.div>
            ) : (
              <motion.div
                key="help"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-white"
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: isHovered ? 1.2 : 1
                  }}
                  transition={{ 
                    rotate: { repeat: Infinity, duration: 2 },
                    scale: { duration: 0.3 }
                  }}
                >
                  <HelpCircle className="w-8 h-8" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pulse rings */}
        {!isOpen && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-white/30"
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.3, 0, 0.3]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 2,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-white/20"
              animate={{ 
                scale: [1, 2, 1],
                opacity: [0.2, 0, 0.2]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 2,
                ease: "easeInOut",
                delay: 0.5
              }}
            />
          </>
        )}

        {/* Floating sparkles */}
        {isHovered && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-yellow-300 rounded-full"
                style={{
                  left: `${20 + i * 10}%`,
                  top: `${20 + (i % 3) * 20}%`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                  x: [0, Math.random() * 20 - 10],
                  y: [0, Math.random() * 20 - 10]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5 + Math.random(),
                  delay: i * 0.1
                }}
              />
            ))}
          </>
        )}
      </motion.button>
    </div>
  );
} 