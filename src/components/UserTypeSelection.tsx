import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, UserRound, Baby, ArrowRight } from 'lucide-react';
import Logo from './Logo';

export type UserType = 'male' | 'female' | 'infant';

interface UserTypeSelectionProps {
  onSelect: (type: UserType) => void;
}

export default function UserTypeSelection({ onSelect }: UserTypeSelectionProps) {
  const [selected, setSelected] = useState<UserType | null>(null);

  const options = [
    { id: 'male' as UserType, label: 'Male', icon: <User className="w-6 h-6" /> },
    { id: 'female' as UserType, label: 'Female', icon: <UserRound className="w-6 h-6" /> },
    { id: 'infant' as UserType, label: 'Infant', icon: <Baby className="w-6 h-6" /> },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md space-y-4 sm:space-y-8"
      >
        <div className="flex flex-col items-center text-center space-y-2 sm:space-y-4">
          <Logo className="w-8 h-8 sm:w-12 h-12" />
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-xl sm:text-3xl font-black text-gray-900 tracking-tight">Who are you?</h1>
            <p className="text-xs sm:text-base text-gray-500 font-medium">Help us find the best facility for your needs.</p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-8 rounded-3xl sm:rounded-[2.5rem] shadow-xl border border-gray-100 space-y-3 sm:space-y-4">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelected(option.id)}
              className={`w-full flex items-center justify-between p-3 sm:p-5 rounded-xl sm:rounded-2xl border-2 transition-all ${
                selected === option.id 
                  ? 'border-primary bg-emerald-50 text-primary shadow-md' 
                  : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${selected === option.id ? 'bg-primary text-white' : 'bg-white text-gray-400'}`}>
                  {React.cloneElement(option.icon as React.ReactElement, { className: 'w-5 h-5 sm:w-6 h-6' })}
                </div>
                <span className="text-base sm:text-lg font-bold">{option.label}</span>
              </div>
              <div className={`w-5 h-5 sm:w-6 h-6 rounded-full border-2 flex items-center justify-center ${selected === option.id ? 'border-primary bg-primary' : 'border-gray-200'}`}>
                {selected === option.id && <div className="w-1.5 h-1.5 sm:w-2 h-2 bg-white rounded-full" />}
              </div>
            </button>
          ))}

          <button
            disabled={!selected}
            onClick={() => selected && onSelect(selected)}
            className={`w-full mt-2 sm:mt-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-2 transition-all ${
              selected 
                ? 'bg-primary text-white shadow-md hover:scale-[1.02] active:scale-[0.98]' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4 sm:w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
