import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertTriangle, Droplets, Trash2, Lock, Ban } from 'lucide-react';
import { Restroom } from '../types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  restroom: Restroom | null;
}

export default function ReportModal({ isOpen, onClose, onSubmit, restroom }: ReportModalProps) {
  const [issueType, setIssueType] = useState('');
  const [comment, setComment] = useState('');

  if (!isOpen || !restroom) return null;

  const issues = [
    { id: 'dirty', label: 'Dirty / No Supplies', icon: <Droplets className="w-5 h-5" /> },
    { id: 'broken', label: 'Broken / Out of Order', icon: <Trash2 className="w-5 h-5" /> },
    { id: 'access', label: 'Access Denied', icon: <Lock className="w-5 h-5" /> },
    { id: 'closed', label: 'Facility Closed', icon: <Ban className="w-5 h-5" /> },
  ];

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
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-red-50">
            <div>
              <h2 className="text-xl font-black text-red-600">Report Issue</h2>
              <p className="text-xs font-bold text-red-400 uppercase tracking-wider">{restroom.name}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form 
            className="p-6 space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit({ issue_type: issueType, comment });
            }}
          >
            <div className="grid grid-cols-2 gap-3">
              {issues.map(issue => (
                <button
                  key={issue.id}
                  type="button"
                  onClick={() => setIssueType(issue.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${issueType === issue.id ? 'bg-red-50 border-red-500 text-red-600 shadow-md' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'}`}
                >
                  {issue.icon}
                  <span className="text-xs font-bold text-center">{issue.label}</span>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Additional Details</label>
              <textarea 
                placeholder="Explain the issue..."
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-red-500 outline-none transition-colors font-medium h-24 resize-none"
                value={comment}
                onChange={e => setComment(e.target.value)}
              />
            </div>

            <div className="p-4 bg-red-50 rounded-2xl flex gap-3 border border-red-100">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <p className="text-xs text-red-700 font-medium">
                Reporting issues in real-time helps other users avoid bad facilities. Thank you for your help!
              </p>
            </div>

            <button 
              type="submit"
              disabled={!issueType}
              className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-red-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
            >
              Submit Report
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
