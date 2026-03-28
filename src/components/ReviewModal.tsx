import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, ShieldCheck } from 'lucide-react';
import { Restroom } from '../types';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  restroom: Restroom | null;
}

export default function ReviewModal({ isOpen, onClose, onSubmit, restroom }: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [cleanliness, setCleanliness] = useState(5);
  const [safety, setSafety] = useState(5);
  const [ease, setEase] = useState(5);
  const [comment, setComment] = useState('');

  if (!isOpen || !restroom) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <div>
              <h2 className="text-xl font-black text-gray-900">Rate & Review</h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{restroom.name}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form 
            className="p-6 space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit({ rating, cleanliness, safety, ease_of_access: ease, comment });
            }}
          >
            <div className="space-y-4">
              <RatingRow label="Overall Rating" value={rating} onChange={setRating} />
              <RatingRow label="Cleanliness" value={cleanliness} onChange={setCleanliness} />
              <RatingRow label="Safety" value={safety} onChange={setSafety} />
              <RatingRow label="Ease of Access" value={ease} onChange={setEase} />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Your Experience</label>
              <textarea 
                placeholder="Tell others about the condition, wait times, or access tips..."
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-primary outline-none transition-colors font-medium h-32 resize-none"
                value={comment}
                onChange={e => setComment(e.target.value)}
              />
            </div>

            <div className="p-4 bg-yellow-50 rounded-2xl flex gap-3 border border-yellow-100">
              <ShieldCheck className="w-5 h-5 text-yellow-600 shrink-0" />
              <p className="text-xs text-yellow-700 font-medium">
                Your review helps maintain the "Verified Clean" status for this facility. Thank you for contributing!
              </p>
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Post Review
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function RatingRow({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) {
  return (
    <div className="flex justify-between items-center">
      <span className="font-bold text-gray-700">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 transition-transform active:scale-90"
          >
            <Star 
              className={`w-6 h-6 ${star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} 
            />
          </button>
        ))}
      </div>
    </div>
  );
}
