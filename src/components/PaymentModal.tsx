import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CreditCard, ShieldCheck, Zap, CheckCircle2, Loader2 } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({ isOpen, onClose, onSuccess }: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'plan' | 'card' | 'success'>('plan');

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setStep('success');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            <div className="p-8">
              {step === 'plan' && (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-3xl mb-2">
                      <Zap className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Go Premium</h2>
                    <p className="text-gray-500 font-medium">Enjoy an ad-free experience and priority emergency routing.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-6 bg-primary/5 border-2 border-primary rounded-3xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest">
                        Best Value
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <h3 className="text-lg font-black text-gray-900">Lifetime Access</h3>
                          <p className="text-sm text-gray-500">One-time payment</p>
                        </div>
                        <div className="text-right">
                          <span className="text-3xl font-black text-primary">$9.99</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <FeatureItem text="Ad-free experience" />
                      <FeatureItem text="Priority emergency routing" />
                      <FeatureItem text="Unlimited restroom reports" />
                      <FeatureItem text="Exclusive premium badges" />
                    </div>
                  </div>

                  <button
                    onClick={() => setStep('card')}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-black text-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <span>Continue to Payment</span>
                  </button>
                </div>
              )}

              {step === 'card' && (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Payment Details</h2>
                    <p className="text-gray-500 font-medium">Secure checkout powered by Stripe</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Card Information</label>
                      <div className="relative">
                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="4242 4242 4242 4242"
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Expiry</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-900"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">CVC</label>
                        <input
                          type="text"
                          placeholder="123"
                          className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-900"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-400 font-medium justify-center">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Your payment information is encrypted and secure.</span>
                  </div>

                  <button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-black text-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <span>Pay $9.99</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {step === 'success' && (
                <div className="py-12 text-center space-y-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full"
                  >
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  </motion.div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Payment Successful!</h2>
                    <p className="text-gray-500 font-medium">Welcome to Toilet Finder Premium.</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-gray-600">
      <CheckCircle2 className="w-5 h-5 text-primary" />
      <span className="text-sm font-bold">{text}</span>
    </div>
  );
}
