'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Play, Sparkles, Target, Users, Briefcase, Zap, Heart, Trophy, Star, Rocket, Globe, Award, Crown } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  icon?: React.ReactNode;
  action?: () => void;
}

interface GuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: '👑 Welcome to FreelanceHub Elite!',
    description: 'Step into the future of freelancing! You\'re about to experience the world\'s most advanced freelance marketplace with cutting-edge AI matching, premium security, and unparalleled user experience.',
    target: 'body',
    position: 'bottom',
    icon: <Crown className="w-6 h-6 text-yellow-500 animate-pulse" />
  },
  {
    id: 'hero-search',
    title: '🚀 AI-Powered Smart Search',
    description: 'Our revolutionary AI engine understands your needs in natural language! Just type what you\'re looking for - "I need a modern logo for my tech startup" - and watch the magic happen. Advanced filters and real-time suggestions included!',
    target: '[data-tour="hero-search"]',
    position: 'bottom',
    icon: <Rocket className="w-6 h-6 text-blue-500 animate-bounce" />
  },
  {
    id: 'categories',
    title: '🌟 Premium Categories Hub',
    description: 'Explore our expertly curated categories featuring verified professionals. Each category includes skill assessments, portfolio showcases, and quality guarantees. From Fortune 500 companies to innovative startups - they all trust our talent.',
    target: '[data-tour="categories"]',
    position: 'top',
    icon: <Award className="w-6 h-6 text-green-500 animate-spin" />
  },
  {
    id: 'featured-gigs',
    title: '⭐ Elite Showcase',
    description: 'Meet our Hall of Fame freelancers! These are award-winning professionals with proven track records, premium certifications, and 5-star ratings. Every project comes with our satisfaction guarantee and premium support.',
    target: '[data-tour="featured-gigs"]',
    position: 'top',
    icon: <Trophy className="w-6 h-6 text-purple-500 animate-pulse" />
  },
  {
    id: 'auth-buttons',
    title: '🌍 Join the Global Elite',
    description: 'Ready to join 10M+ successful users worldwide? Whether you\'re hiring world-class talent or showcasing your premium skills, FreelanceHub Elite provides enterprise-grade security, instant payments, and 24/7 premium support!',
    target: '[data-tour="auth-buttons"]',
    position: 'bottom',
    icon: <Globe className="w-6 h-6 text-red-500 animate-spin" />
  }
];

export default function GuidedTour({ isOpen, onClose, onComplete }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isHomePage, setIsHomePage] = useState(false);
  const spotlightRef = useRef<HTMLDivElement>(null);
  
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

    const updatePosition = () => {
      const step = tourSteps[currentStep];
      const target = document.querySelector(step.target) as HTMLElement;
      
      if (target) {
        const rect = target.getBoundingClientRect();
        setTargetPosition({
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height
        });
        
        // Smooth scroll to target
        target.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        });
      } else {
        // If target doesn't exist, use a default position (center of screen)
        setTargetPosition({
          x: window.innerWidth / 2 - 100,
          y: window.innerHeight / 2 - 100,
          width: 200,
          height: 200
        });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [isOpen, currentStep]);

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = () => {
    onClose();
  };

  if (!isOpen) return null;

  const currentStepData = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={skipTour}
      />

      {/* Spotlight */}
      <motion.div
        ref={spotlightRef}
        className="absolute pointer-events-none"
        style={{
          left: targetPosition.x - 20,
          top: targetPosition.y - 20,
          width: targetPosition.width + 40,
          height: targetPosition.height + 40,
        }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Spotlight border */}
        <div className="absolute inset-0 rounded-lg border-2 border-white/50 shadow-2xl" />
        
        {/* Spotlight glow */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-xl" />
        
        {/* Animated border */}
        <motion.div
          className="absolute inset-0 rounded-lg border-2 border-transparent"
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
      </motion.div>

      {/* Tour Tooltip */}
      <motion.div
        className="absolute pointer-events-auto"
        style={{
          left: targetPosition.x + targetPosition.width / 2,
          top: currentStepData.position === 'top' 
            ? targetPosition.y - 20 
            : targetPosition.y + targetPosition.height + 20,
          transform: 'translateX(-50%)',
        }}
        initial={{ opacity: 0, y: 20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.8 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Tooltip Container */}
        <div className="relative max-w-md">
          {/* Arrow */}
          <div
            className={`absolute w-4 h-4 bg-white transform rotate-45 shadow-lg ${
              currentStepData.position === 'top' ? 'top-2' : 'bottom-2'
            } left-1/2 -translate-x-1/2`}
          />

          {/* Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                {currentStepData.icon}
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{currentStepData.title}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex space-x-1">
                      {tourSteps.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            index === currentStep 
                              ? 'bg-blue-500 scale-125' 
                              : index < currentStep 
                                ? 'bg-green-500' 
                                : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {currentStep + 1} of {tourSteps.length}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={skipTour}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Description */}
            <p className="text-gray-700 leading-relaxed mb-6">
              {currentStepData.description}
            </p>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={skipTour}
                className="text-gray-500 hover:text-gray-700 font-medium transition-colors"
              >
                Skip Tour
              </button>
              
              <div className="flex items-center space-x-3">
                {!isFirstStep && (
                  <button
                    onClick={prevStep}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>
                )}
                
                <button
                  onClick={nextStep}
                  className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <span>{isLastStep ? 'Complete' : 'Next'}</span>
                  {isLastStep ? (
                    <Sparkles className="w-4 h-4" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Keyboard Navigation */}
      <TourKeyboardNavigation 
        isOpen={isOpen} 
        onNext={nextStep} 
        onPrev={prevStep}
        onSkip={skipTour}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
      />
    </div>
  );
}

// Keyboard navigation hook
function TourKeyboardNavigation({ 
  isOpen, 
  onNext, 
  onPrev, 
  onSkip, 
  isFirstStep, 
  isLastStep 
}: {
  isOpen: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowRight':
        case ' ':
          event.preventDefault();
          onNext();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          if (!isFirstStep) onPrev();
          break;
        case 'Escape':
          event.preventDefault();
          onSkip();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, onNext, onPrev, onSkip, isFirstStep, isLastStep]);

  return null;
} 