'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GuidedTour from '@/components/ui/GuidedTour';
import WelcomeModal from '@/components/ui/WelcomeModal';
import { useToast } from '@/components/ui/use-toast';
import confetti from 'canvas-confetti';

interface TourContextType {
  isWelcomeOpen: boolean;
  isTourOpen: boolean;
  startTour: () => void;
  closeTour: () => void;
  closeWelcome: () => void;
  hasSeenWelcome: boolean;
  celebrateTourCompletion: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const useTour = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};

interface TourProviderProps {
  children: React.ReactNode;
}

export default function TourProvider({ children }: TourProviderProps) {
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user has seen the welcome modal before
    const hasSeenWelcomeBefore = localStorage.getItem('freelancehub-welcome-seen');
    
    // Only show welcome modal on the home page (/) or if no specific page
    const isHomePage = window.location.pathname === '/' || window.location.pathname === '';
    
    if (!hasSeenWelcomeBefore && isHomePage) {
      // Show welcome modal after a short delay for better UX
      const timer = setTimeout(() => {
        setIsWelcomeOpen(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      setHasSeenWelcome(true);
    }
  }, []);

  const startTour = () => {
    setIsTourOpen(true);
    setIsWelcomeOpen(false);
  };

  const closeTour = () => {
    setIsTourOpen(false);
  };

  const closeWelcome = () => {
    setIsWelcomeOpen(false);
    setHasSeenWelcome(true);
    localStorage.setItem('freelancehub-welcome-seen', 'true');
  };

  const celebrateTourCompletion = () => {
    // Epic celebration with confetti
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: NodeJS.Timeout = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Multi-colored confetti from different positions
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#fbbf24', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b']
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#ef4444', '#f97316', '#84cc16', '#06b6d4', '#8b5cf6']
      });
    }, 250);

    // Premium toast notification
    toast({
      title: "🎉 Welcome to FreelanceHub Elite!",
      description: "You're now ready to experience the world's most advanced freelance marketplace. Let's build something amazing together!",
      duration: 5000,
    });

    // Mark tour as completed
    localStorage.setItem('freelancehub-tour-completed', 'true');
  };

  const contextValue: TourContextType = {
    isWelcomeOpen,
    isTourOpen,
    startTour,
    closeTour,
    closeWelcome,
    hasSeenWelcome,
    celebrateTourCompletion,
  };

  return (
    <TourContext.Provider value={contextValue}>
      {children}
      
      {/* Premium Welcome Modal */}
      <AnimatePresence>
        {isWelcomeOpen && (
          <WelcomeModal
            isOpen={isWelcomeOpen}
            onClose={closeWelcome}
            onStartTour={startTour}
          />
        )}
      </AnimatePresence>

      {/* World-Class Guided Tour */}
      <AnimatePresence>
        {isTourOpen && (
          <GuidedTour
            isOpen={isTourOpen}
            onClose={closeTour}
            onComplete={() => {
              closeTour();
              celebrateTourCompletion();
            }}
          />
        )}
      </AnimatePresence>
    </TourContext.Provider>
  );
} 