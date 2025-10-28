'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Gift, Sparkles } from 'lucide-react';

interface FeedbackTriggerProps {
  onClick: () => void;
  variant?: 'inline' | 'floating' | 'banner';
  projectCompleteness?: number;
}

export function FeedbackTrigger({ 
  onClick, 
  variant = 'inline',
  projectCompleteness = 100 
}: FeedbackTriggerProps) {
  
  // Inline variant - for use in the preview page
  if (variant === 'inline') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-6 shadow-sm"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <Gift className="w-6 h-6 text-amber-600" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">
              Exclusief Beta Tester Aanbod 🎉
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Je bent één van onze eerste 25 testers! Help ons Brikx te verbeteren 
              met 2 minuten feedback en ontvang direct het complete Premium PvE 
              (waarde €149) helemaal gratis.
            </p>
            
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={onClick}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Geef Feedback & Claim Premium
              </button>
              
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Nog 12 plekken beschikbaar</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Floating variant - for bottom-right corner
  if (variant === 'floating') {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          delay: 2, 
          type: "spring",
          stiffness: 260,
          damping: 20 
        }}
        className="fixed bottom-6 right-6 z-40"
      >
        <motion.button
          onClick={onClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2"
        >
          <Gift className="w-5 h-5" />
          <span className="font-medium">Claim Gratis Premium</span>
        </motion.button>
        
        {/* Pulse animation for attention */}
        <motion.div
          className="absolute inset-0 rounded-full bg-cyan-400 -z-10"
          animate={{
            scale: [1, 1.2, 1.2, 1],
            opacity: [0.5, 0.2, 0.2, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 1
          }}
        />
      </motion.div>
    );
  }

  // Banner variant - for top of page
  if (variant === 'banner') {
    return (
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-gradient-to-r from-amber-400 to-orange-400 text-white"
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Gift className="w-5 h-5" />
              <p className="font-medium">
                🎉 Beta Tester Special: Geef feedback, krijg Premium gratis! (€149 waarde)
              </p>
            </div>
            
            <button
              onClick={onClick}
              className="px-4 py-1.5 bg-white text-amber-600 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Claim Nu
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
}

// Optional: Progress-based trigger
export function SmartFeedbackTrigger({ 
  projectCompleteness,
  onTrigger 
}: {
  projectCompleteness: number;
  onTrigger: () => void;
}) {
  // Only show if project is >80% complete
  if (projectCompleteness < 80) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 3 }}
      className="fixed right-4 top-1/2 -translate-y-1/2 z-40"
    >
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-xs">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg">
            <Sparkles className="w-5 h-5 text-cyan-600" />
          </div>
          
          <div>
            <p className="font-medium text-gray-900 text-sm mb-1">
              Je PvE is {projectCompleteness}% compleet!
            </p>
            <p className="text-xs text-gray-600 mb-3">
              Deel je ervaring en ontvang Premium gratis.
            </p>
            
            <button
              onClick={onTrigger}
              className="text-xs font-medium text-cyan-600 hover:text-cyan-700"
            >
              2 min feedback geven →
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}