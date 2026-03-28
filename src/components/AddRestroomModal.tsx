import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Check, Info } from 'lucide-react';

interface AddRestroomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  userLocation: [number, number] | null;
}

export default function AddRestroomModal({ isOpen, onClose, onSubmit, userLocation }: AddRestroomModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'public',
    is_accessible: false,
    has_baby_changing: false,
    is_gender_neutral: false,
    is_free: true,
    access_type: 'open',
    access_code: ''
  });

  if (!isOpen) return null;

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
            <h2 className="text-xl font-black text-gray-900">Add New Facility</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form 
            className="p-6 space-y-6 max-h-[70vh] overflow-y-auto"
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit({ ...formData, latitude: userLocation?.[0], longitude: userLocation?.[1] });
            }}
          >
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Facility Name</label>
              <input 
                required
                type="text" 
                placeholder="e.g. Central Park North Restroom"
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-primary outline-none transition-colors font-bold"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <TypeOption 
                active={formData.type === 'public'} 
                onClick={() => setFormData({...formData, type: 'public'})}
                label="Public/Park"
              />
              <TypeOption 
                active={formData.type === 'commercial'} 
                onClick={() => setFormData({...formData, type: 'commercial'})}
                label="Cafe/Mall"
              />
              <TypeOption 
                active={formData.type === 'paid'} 
                onClick={() => setFormData({...formData, type: 'paid'})}
                label="Paid/Station"
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Features</label>
              <div className="grid grid-cols-2 gap-3">
                <Checkbox 
                  label="Accessible" 
                  checked={formData.is_accessible} 
                  onChange={v => setFormData({...formData, is_accessible: v})} 
                />
                <Checkbox 
                  label="Baby Changing" 
                  checked={formData.has_baby_changing} 
                  onChange={v => setFormData({...formData, has_baby_changing: v})} 
                />
                <Checkbox 
                  label="Gender Neutral" 
                  checked={formData.is_gender_neutral} 
                  onChange={v => setFormData({...formData, is_gender_neutral: v})} 
                />
                <Checkbox 
                  label="Free to Use" 
                  checked={formData.is_free} 
                  onChange={v => setFormData({...formData, is_free: v})} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Access Requirements</label>
              <select 
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-primary outline-none transition-colors font-bold appearance-none"
                value={formData.access_type}
                onChange={e => setFormData({...formData, access_type: e.target.value})}
              >
                <option value="open">Open to Public</option>
                <option value="customer">Customers Only</option>
                <option value="key">Key/Code Required</option>
              </select>
            </div>

            {formData.access_type === 'key' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Door Code (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. 1234#"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-primary outline-none transition-colors font-bold"
                  value={formData.access_code}
                  onChange={e => setFormData({...formData, access_code: e.target.value})}
                />
              </div>
            )}

            <div className="p-4 bg-blue-50 rounded-2xl flex gap-3 border border-blue-100">
              <MapPin className="w-5 h-5 text-blue-500 shrink-0" />
              <p className="text-xs text-blue-700 font-medium">
                The facility will be pinned to your current location. Please ensure you are standing near the entrance.
              </p>
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Submit Facility
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function TypeOption({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`py-2 rounded-xl border-2 font-bold text-sm transition-all ${active ? 'bg-primary border-primary text-white shadow-md' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'}`}
    >
      {label}
    </button>
  );
}

function Checkbox({ label, checked, onChange }: { label: string, checked: boolean, onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${checked ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-100 text-gray-400'}`}
    >
      <span className="text-xs font-bold">{label}</span>
      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${checked ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-200'}`}>
        {checked && <Check className="w-3 h-3 stroke-[4]" />}
      </div>
    </button>
  );
}
