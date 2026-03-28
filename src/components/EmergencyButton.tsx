import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, Zap } from 'lucide-react';

interface EmergencyButtonProps {
  onClick: () => void;
  onUpgrade: () => void;
  active: boolean;
  isPremium: boolean;
}

export default function EmergencyButton({ onClick, onUpgrade, active, isPremium }: EmergencyButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (!isPremium && !active) {
      onUpgrade();
    } else {
      onClick();
    }
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[3000]">
      <AnimatePresence>
        {isHovered && !active && (
          <motion.div
            initial={{ opacity: 0, y: 10, x: '-50%' }}
            animate={{ opacity: 1, y: -10, x: '-50%' }}
            exit={{ opacity: 0, y: 10, x: '-50%' }}
            className="absolute bottom-full left-1/2 mb-2 px-4 py-2 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl whitespace-nowrap shadow-xl border border-white/10"
          >
            {isPremium ? "Premium active" : "Go Ad-Free with premium experience and priority routing"}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={handleClick}
        className={`
          relative flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-2xl transition-all duration-300
          ${active 
            ? 'bg-white text-primary border-2 border-primary' 
            : 'bg-primary text-white border-2 border-white'}
        `}
      >
        <motion.div
          animate={active ? { scale: [1, 1.2, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          {isPremium ? <AlertCircle className="w-5 h-5 sm:w-6 h-6" /> : <Zap className="w-5 h-5 sm:w-6 h-6 fill-white" />}
        </motion.div>
        <div className="flex flex-col items-start leading-none">
          <span className="text-xs sm:text-sm font-black uppercase tracking-tighter">
            {active ? 'Finding...' : 'Ad Free Version'}
          </span>
          {!active && (
            <span className="text-[6px] sm:text-[7px] font-black uppercase tracking-widest opacity-80">
              {isPremium ? 'Premium Active' : 'Paid'}
            </span>
          )}
        </div>
        
        {!active && (
          <motion.div
            className="absolute -inset-2 bg-primary rounded-full -z-10 opacity-20"
            animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        )}
      </motion.button>
    </div>
  );
}
