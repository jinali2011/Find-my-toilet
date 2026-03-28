import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, Navigation, Star, ShieldCheck, Accessibility, Baby, Users, CircleDollarSign, Key, Clock, MessageSquare, AlertTriangle, ArrowLeft, Footprints } from 'lucide-react';
import { Restroom } from '../types';
import { calculateDistance, estimateWalkingTime } from '../utils';

interface RestroomDetailsProps {
  restroom: Restroom | null;
  userLocation: [number, number] | null;
  onClose: () => void;
  onReport: (restroom: Restroom) => void;
  onReview: (restroom: Restroom) => void;
}

export default function RestroomDetails({ restroom, userLocation, onClose, onReport, onReview }: RestroomDetailsProps) {
  if (!restroom) return null;

  const getWalkingTime = () => {
    if (!userLocation) return null;
    const distance = calculateDistance(userLocation[0], userLocation[1], restroom.latitude, restroom.longitude);
    return estimateWalkingTime(distance);
  };

  const walkingTime = getWalkingTime();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed bottom-0 left-0 right-0 md:left-1/2 md:-translate-x-1/2 md:max-w-2xl md:mb-6 md:rounded-3xl z-[2000] bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 px-6 py-4 flex items-center justify-between border-b border-gray-100">
          <button 
            onClick={onClose}
            className="flex items-center gap-2 text-gray-500 font-bold hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Map</span>
          </button>
          <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
          <div className="w-20" /> {/* Spacer */}
        </div>
        
        <div className="px-6 pb-10 pt-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-black text-gray-900">{restroom.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-md">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-yellow-700">{restroom.rating.toFixed(1)}</span>
                </div>
                <span className="text-gray-400 text-sm">{restroom.review_count} reviews</span>
                {walkingTime !== null && (
                  <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md text-sm font-bold">
                    <Footprints className="w-4 h-4" />
                    {walkingTime} min walk
                  </div>
                )}
                {restroom.is_verified === 1 && (
                  <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-md text-sm font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    Verified Clean
                  </div>
                )}
              </div>
            </div>
            <button 
              onClick={() => {
                const url = `https://www.google.com/maps/dir/?api=1&destination=${restroom.latitude},${restroom.longitude}`;
                window.open(url, '_blank');
              }}
              className="bg-primary text-white p-4 rounded-2xl shadow-lg shadow-emerald-200 hover:scale-105 active:scale-95 transition-transform"
            >
              <Navigation className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <FeatureCard icon={<Accessibility className="w-5 h-5" />} label="Accessible" active={restroom.is_accessible === 1} />
            <FeatureCard icon={<Baby className="w-5 h-5" />} label="Baby Changing" active={restroom.has_baby_changing === 1} />
            <FeatureCard icon={<Users className="w-5 h-5" />} label="Gender Neutral" active={restroom.is_gender_neutral === 1} />
            <FeatureCard icon={<CircleDollarSign className="w-5 h-5" />} label="Free to Use" active={restroom.is_free === 1} />
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="bg-white p-2 rounded-xl shadow-sm">
                <Key className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Access Requirements</p>
                <p className="font-bold text-gray-800 capitalize">
                  {restroom.access_type} {restroom.access_code ? `(Code: ${restroom.access_code})` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="bg-white p-2 rounded-xl shadow-sm">
                <Clock className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Availability</p>
                <p className="font-bold text-gray-800">Open Now • 24/7</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button 
              onClick={() => onReview(restroom)}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-white border-2 border-gray-100 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              Write Review
            </button>
            <button 
              onClick={() => onReport(restroom)}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-white border-2 border-gray-100 rounded-2xl font-bold text-red-500 hover:bg-red-50 transition-colors"
            >
              <AlertTriangle className="w-5 h-5" />
              Report Issue
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function FeatureCard({ icon, label, active }: { icon: React.ReactNode, label: string, active: boolean }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-2xl border ${active ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-gray-50 border-gray-100 text-gray-400 grayscale'}`}>
      {icon}
      <span className="text-sm font-bold">{label}</span>
    </div>
  );
}
