import React from 'react';
import { Filter, Accessibility, Baby, Users, CircleDollarSign, Check, Navigation } from 'lucide-react';
import { FilterState } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'motion/react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FiltersProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  count: number;
}

export default function Filters({ filters, setFilters, count }: FiltersProps) {
  const toggleFilter = (key: keyof FilterState) => {
    if (key === 'type') return;
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleType = (type: string) => {
    setFilters(prev => ({
      ...prev,
      type: prev.type.includes(type) 
        ? prev.type.filter(t => t !== type)
        : [...prev.type, type]
    }));
  };

  const clearFilters = () => {
    setFilters({
      accessible: false,
      family: false,
      genderNeutral: false,
      free: false,
      publicOnly: false,
      type: ['public', 'commercial', 'paid']
    });
  };

  const hasActiveFilters = filters.accessible || filters.family || filters.genderNeutral || filters.free || filters.publicOnly || filters.type.length < 3;

  return (
    <div className="absolute top-20 sm:top-24 left-4 z-[1000] flex flex-col gap-2 sm:gap-3 max-w-[calc(100vw-2rem)]">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-2 sm:p-3 flex flex-wrap gap-1.5 sm:gap-2 items-center border border-white/20">
        <div className="flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2 py-1 text-gray-500 border-r border-gray-200 mr-1">
          <Filter className="w-3 h-3 sm:w-4 h-4" />
          <div className="flex flex-col">
            <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest">Filters</span>
            <span className="text-[7px] sm:text-[9px] font-bold text-primary">{count} Available</span>
          </div>
        </div>
        
        <FilterButton 
          active={filters.accessible} 
          onClick={() => toggleFilter('accessible')}
          icon={<Accessibility className="w-3 h-3 sm:w-4 h-4" />}
          label="ADA"
        />
        <FilterButton 
          active={filters.family} 
          onClick={() => toggleFilter('family')}
          icon={<Baby className="w-3 h-3 sm:w-4 h-4" />}
          label="Family"
        />
        <FilterButton 
          active={filters.genderNeutral} 
          onClick={() => toggleFilter('genderNeutral')}
          icon={<Users className="w-3 h-3 sm:w-4 h-4" />}
          label="Neutral"
        />
        <FilterButton 
          active={filters.free} 
          onClick={() => toggleFilter('free')}
          icon={<CircleDollarSign className="w-3 h-3 sm:w-4 h-4" />}
          label="Free"
        />
        <FilterButton 
          active={filters.publicOnly} 
          onClick={() => toggleFilter('publicOnly')}
          icon={<Navigation className="w-3 h-3 sm:w-4 h-4" />}
          label="Open"
        />

        {hasActiveFilters && (
          <button 
            onClick={clearFilters}
            className="ml-auto text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors px-1 sm:px-2"
          >
            Clear
          </button>
        )}
      </div>

      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-2 sm:p-2.5 flex flex-wrap gap-1.5 sm:gap-2 items-center border border-white/20 self-start">
        <TypeButton 
          active={filters.type.includes('public')} 
          onClick={() => toggleType('public')}
          label="Public"
          color="bg-teal-600"
          activeColor="ring-teal-200"
        />
        <TypeButton 
          active={filters.type.includes('commercial')} 
          onClick={() => toggleType('commercial')}
          label="Cafe/Mall"
          color="bg-emerald-600"
          activeColor="ring-emerald-200"
        />
        <TypeButton 
          active={filters.type.includes('paid')} 
          onClick={() => toggleType('paid')}
          label="Paid"
          color="bg-zinc-800"
          activeColor="ring-zinc-200"
        />
      </div>
    </div>
  );
}

function FilterButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 relative overflow-hidden",
        active 
          ? "bg-primary text-white shadow-lg shadow-emerald-200 scale-105 ring-2 ring-emerald-100" 
          : "bg-gray-50 text-gray-500 hover:bg-gray-100"
      )}
    >
      {icon}
      <span>{label}</span>
      {active && (
        <motion.div
          layoutId="active-dot"
          className="w-1 h-1 bg-white rounded-full ml-0.5"
        />
      )}
    </button>
  );
}

function TypeButton({ active, onClick, label, color, activeColor }: { active: boolean, onClick: () => void, label: string, color: string, activeColor: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 border-2 flex items-center gap-2",
        active 
          ? `${color} text-white border-transparent shadow-lg scale-105 ring-4 ${activeColor}` 
          : `bg-white text-gray-400 border-gray-100 hover:border-gray-200 hover:text-gray-600`
      )}
    >
      <AnimatePresence mode="wait">
        {active && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            <Check className="w-3 h-3 stroke-[4]" />
          </motion.div>
        )}
      </AnimatePresence>
      <span>{label}</span>
    </button>
  );
}
