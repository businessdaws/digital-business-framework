import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface ProgressBarProps {
  progress: number;
  label?: string;
  className?: string;
  variant?: 'yellow' | 'blue';
}

export default function ProgressBar({ progress, label, className, variant = 'yellow' }: ProgressBarProps) {
  const colorClass = variant === 'yellow' 
    ? "bg-brand-yellow shadow-[0_0_15px_rgba(250,204,21,0.3)]" 
    : "bg-brand-blue shadow-[0_0_15px_rgba(59,130,246,0.3)]";

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase italic">{label}</span>
          <span className="text-sm font-bold text-white tabular-nums">{Math.round(progress)}% Verified</span>
        </div>
      )}
      <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden ring-1 ring-zinc-800/50">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={cn("h-full transition-all duration-500", colorClass)}
        />
      </div>
    </div>
  );
}
