import React from 'react';
import { Users } from 'lucide-react';

export default function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="relative bg-primary p-2 rounded-xl shadow-sm">
          <Users className={`${className} text-white`} />
        </div>
      </div>
      <div className="flex flex-col -space-y-1">
        <span className="text-xl font-black tracking-tighter text-gray-900 uppercase">Find My</span>
        <span className="text-xl font-black tracking-tighter text-primary uppercase">Toilet</span>
      </div>
    </div>
  );
}
