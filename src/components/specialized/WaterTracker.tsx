import React from 'react';
import { motion } from 'motion/react';
import { Droplets, GlassWater, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

interface WaterTrackerProps {
  currentValue: number;
  targetValue: number; // in Liters, e.g., 3
  onUpdate: (newValue: number) => void;
}

const WaterTracker: React.FC<WaterTrackerProps> = ({ currentValue, targetValue, onUpdate }) => {
  const bottleSize = 0.5; // 0.5L per bottle
  const totalBottles = Math.ceil(targetValue / bottleSize);
  const completedBottles = Math.floor(currentValue / bottleSize);
  const partialBottle = (currentValue % bottleSize) / bottleSize;

  const handleBottleClick = (index: number) => {
    const newValue = (index + 1) * bottleSize;
    onUpdate(newValue);
  };

  return (
    <div className="space-y-8 p-6 bg-blue-50/50 rounded-[32px] border border-blue-100">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-blue-900">Hydration Station</h3>
          <p className="text-sm text-blue-600 font-medium">{currentValue.toFixed(1)}L of {targetValue}L reached</p>
        </div>
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
          <Droplets size={24} />
        </div>
      </div>

      {/* Body Filling Animation */}
      <div className="relative flex justify-center py-8">
        <div className="relative w-32 h-48 bg-zinc-200 rounded-[40px] overflow-hidden border-4 border-zinc-300 shadow-inner">
          {/* Water Level */}
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: `${(currentValue / targetValue) * 100}%` }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="absolute bottom-0 left-0 right-0 bg-blue-500"
          >
            {/* Waves */}
            <motion.div 
              animate={{ x: [-100, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-4 left-0 w-[200%] h-8 bg-blue-400/50 blur-sm"
              style={{ borderRadius: '40% 40% 0 0' }}
            />
          </motion.div>
          
          {/* Body Outline Overlay (Simplified) */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
             <Droplets size={64} className="text-zinc-900" />
          </div>
        </div>
        
        {/* Progress Percentage */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <span className="text-2xl font-black text-white drop-shadow-md">
            {Math.round((currentValue / targetValue) * 100)}%
          </span>
        </div>
      </div>

      {/* Bottles Grid */}
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: totalBottles }).map((_, i) => {
          const isFull = i < completedBottles;
          const isPartial = i === completedBottles && partialBottle > 0;
          
          return (
            <motion.button
              key={i}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleBottleClick(i)}
              className={cn(
                "relative h-24 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 overflow-hidden",
                isFull ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-blue-100 text-blue-300"
              )}
            >
              <GlassWater size={24} className={cn(isFull ? "text-white" : "text-blue-200")} />
              <span className="text-[10px] font-bold uppercase tracking-wider">0.5L</span>
              
              {/* Partial Fill Overlay */}
              {isPartial && (
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-blue-600/30"
                  style={{ height: `${partialBottle * 100}%` }}
                />
              )}

              {/* Checkmark if full */}
              {isFull && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-1 bg-white rounded-full p-0.5"
                >
                  <Droplets size={8} className="text-blue-600" fill="currentColor" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="flex items-start gap-3 bg-blue-100/50 p-4 rounded-2xl">
        <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 leading-relaxed">
          Drinking 3L of water daily boosts energy, improves skin health, and keeps your body functioning at its peak.
        </p>
      </div>
    </div>
  );
};

export default WaterTracker;
