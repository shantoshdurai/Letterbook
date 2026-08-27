import React, { useState, useEffect } from 'react';
import { Wifi, Battery } from 'lucide-react';

export const StatusBar: React.FC = () => {
  const [timeStr, setTimeStr] = useState('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      hours = hours % 12 || 12;
      setTimeStr(`${hours}:${minutes}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div 
      id="mobile-status-bar"
      className="flex items-center justify-between px-6 pt-3 pb-1 text-xs font-semibold text-[#8fa0b5] select-none z-50 bg-[#121820]"
    >
      <span>{timeStr}</span>
      <div className="flex items-center gap-2">
        <div className="flex gap-0.5 items-end h-3">
          <div className="w-0.5 h-1 bg-current rounded-full" />
          <div className="w-0.5 h-1.5 bg-current rounded-full" />
          <div className="w-0.5 h-2 bg-current rounded-full" />
          <div className="w-0.5 h-2.5 bg-current rounded-full" />
        </div>
        <Wifi className="w-3.5 h-3.5" />
        <Battery className="w-4 h-4" />
      </div>
    </div>
  );
};
