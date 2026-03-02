import React, { useEffect, useState } from 'react';
import { Bell, Droplets } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

interface WaterReminderProps {
  currentValue: number;
  targetValue: number;
  lastLogTime?: number;
}

const WaterReminder: React.FC<WaterReminderProps> = ({ currentValue, targetValue, lastLogTime }) => {
  const [showReminder, setShowReminder] = useState(false);

  useEffect(() => {
    if (currentValue >= targetValue) return;

    const checkReminder = () => {
      const now = Date.now();
      const twoHoursInMs = 2 * 60 * 60 * 1000;
      
      if (!lastLogTime || (now - lastLogTime > twoHoursInMs)) {
        setShowReminder(true);
      }
    };

    const interval = setInterval(checkReminder, 60000); // Check every minute
    checkReminder();

    return () => clearInterval(interval);
  }, [currentValue, targetValue, lastLogTime]);

  return (
    <AnimatePresence>
      {showReminder && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed top-24 left-6 right-6 z-[100] bg-blue-600 text-white p-4 rounded-2xl shadow-xl shadow-blue-200 flex items-center gap-4 border border-blue-400"
        >
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <Droplets size={20} />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold">Time to Hydrate!</h4>
            <p className="text-xs opacity-90">You haven't logged water in a while. Stay fresh!</p>
          </div>
          <button 
            onClick={() => setShowReminder(false)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Bell size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WaterReminder;
