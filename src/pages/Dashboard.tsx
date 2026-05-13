import { motion } from 'motion/react';
import { 
  Lightbulb, 
  Map, 
  MessageSquare, 
  Rocket, 
  ShieldAlert, 
  TrendingUp,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { FRAMEWORK_MODULES } from '../types';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import ProgressBar from '../components/ProgressBar';
import ActivityLogFeed from '../components/ActivityLogFeed';
import { useModuleProgress } from '../hooks/useModuleProgress';
import { useActivityLog } from '../hooks/useActivityLog';

import { isSupabaseConnected } from '../lib/supabase';

const iconMap: Record<string, any> = {
  Lightbulb,
  Map,
  MessageSquare,
  TrendingUp,
  Rocket,
  ShieldAlert,
};

export default function Dashboard() {
  const { modules: dbProgress, globalProgress, isLoading: modulesLoading, error: modulesError } = useModuleProgress();
  const { logs, isLoading: logsLoading, error: logsError } = useActivityLog();

  const isLoading = modulesLoading || logsLoading;
  const error = (modulesError || logsError) && (modulesError !== 'Supabase not configured' && logsError !== 'Supabase not configured') ? (modulesError || logsError) : null;

  if (!isSupabaseConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <div className="w-full max-w-2xl bg-zinc-900 border border-brand-yellow/30 rounded-3xl p-10 space-y-8 glass-card glow-yellow">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold italic tracking-tight text-brand-yellow uppercase">Database Not Connected</h2>
            <p className="text-zinc-400 text-lg italic">
              Add your Supabase credentials to connect live data to this dashboard.
            </p>
          </div>

          <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 font-mono text-sm space-y-2 text-zinc-300">
            <p className="text-brand-blue">VITE_SUPABASE_URL=https://orpndwurqunbydtqoblu.supabase.co</p>
            <p className="text-brand-yellow">VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ycG5kd3VycXVuYnlkdHFvYmx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NDIzNDksImV4cCI6MjA5NDIxODM0OX0.BdUUjqvuozOaiPGvB1paNH3Anm-ETCVy9jMxD7ioF6I</p>
          </div>

          <div className="pt-4">
            <p className="text-zinc-500 italic text-sm">
              Add these to <span className="text-white font-bold">AI Studio Settings → Secrets</span>, then rebuild.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold uppercase italic tracking-tight">System Connection Failure</h2>
          <p className="text-zinc-500 max-w-sm mx-auto italic">
            Unable to establish a secure link with Supabase Framework. Please verify your API keys and try again.
          </p>
          <p className="text-red-500/60 text-xs font-mono mt-4">Error: {error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-zinc-900 text-white px-8 py-3 rounded-2xl font-bold uppercase italic tracking-tight border border-zinc-800 hover:border-zinc-700 transition-all"
        >
          Attempt Re-Reconnection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* High-Contrast Global Progress Bar at Top */}
      <div className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl py-4 -mt-4 mb-8">
        <ProgressBar 
          progress={globalProgress} 
          label="Business Readiness Index" 
        />
      </div>

      {/* Hero Welcome */}
      <section className="relative">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-blue/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative z-10 flex items-end justify-between">
          <div>
            <h1 className="text-5xl font-bold tracking-tight mb-2 uppercase italic leading-none">
              Strategic <span className="text-brand-blue">Control</span> Center
            </h1>
            <p className="text-zinc-500 max-w-lg text-lg italic">
              Transform Your Business Growth Vision. High-fidelity business engineering.
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-8 py-2 px-6 rounded-2xl glass-card glow-blue">
            <div>
              <p className="text-[10px] text-zinc-500 font-bold tracking-[0.1em] uppercase">Market Pulse</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-brand-blue">8.4x</span>
                <span className="text-[10px] text-green-500 font-mono">+12%</span>
              </div>
            </div>
            <div className="w-[100px] h-[40px] flex items-end gap-1">
              {[40, 20, 60, 30, 80, 50, 90].map((h, i) => (
                <motion.div 
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  className="w-full bg-brand-blue/20 rounded-t-sm"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Grid of Modules - Refined Glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FRAMEWORK_MODULES.map((module, index) => {
          const Icon = iconMap[module.icon];
          const isGrowth = module.id === 'growth' || module.id === 'execution';
          const dbMod = dbProgress.find(p => p.module_id === module.id);
          
          const percent = dbMod 
            ? Math.round((dbMod.completed / dbMod.total) * 100) 
            : 0;

          return (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link to={module.path} className="group block focus:outline-none h-full">
                <div className="p-8 rounded-[32px] glass-card glass-hover relative overflow-hidden group-hover:glow-blue transition-all duration-500 h-full flex flex-col">
                  {isLoading && (
                    <div className="absolute inset-0 bg-zinc-950/20 backdrop-blur-[2px] flex items-center justify-center z-20">
                      <Loader2 className="w-6 h-6 animate-spin text-brand-blue/30" />
                    </div>
                  )}
                  
                  <div className="flex items-start justify-between mb-8">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500",
                      percent > 0 
                        ? (isGrowth ? "bg-brand-yellow/10 text-brand-yellow" : "bg-brand-blue/10 text-brand-blue shadow-lg shadow-brand-blue/5") 
                        : "bg-zinc-800/50 text-zinc-600"
                    )}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-[0.2em] bg-zinc-950 px-3 py-1 rounded-full border border-zinc-800">
                      M-0{index + 1}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold mb-3 tracking-tight group-hover:text-white transition-colors uppercase">
                    {module.title}
                  </h3>
                  <p className="text-zinc-500 text-sm mb-10 leading-relaxed font-light italic flex-1">
                    {module.description}
                  </p>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase">Completion</p>
                        <p className="text-lg font-bold tabular-nums">{percent}%</p>
                      </div>
                      <div className="w-24 h-6 flex items-end gap-0.5 opacity-40">
                         {Array.from({length: 10}).map((_, i) => (
                           <div key={i} className={cn(
                             "w-full h-full bg-zinc-800 rounded-t-[1px]",
                             i < (percent/10) && "bg-brand-blue/30"
                           )} />
                         ))}
                      </div>
                    </div>
                    <div className="h-1 w-full bg-zinc-950 rounded-full overflow-hidden ring-1 ring-zinc-800/30">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 1.2, delay: 0.3 }}
                        className={cn(
                          "h-full transition-all duration-1000",
                          isGrowth ? "bg-brand-yellow shadow-[0_0_8px_rgba(250,204,21,0.5)]" : "bg-brand-blue shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                        )}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Corporate Strategy Summary & Activity Log */}
      <section className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-10 rounded-[40px] glass-card glow-yellow relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8">
            <TrendingUp className="w-24 h-24 text-brand-yellow/5" />
          </div>
          
          <h2 className="text-2xl font-bold mb-8 uppercase italic flex items-center gap-3">
            <span className="w-1.5 h-6 bg-brand-yellow rounded-full" />
            Executive Directive
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] text-zinc-500 font-bold tracking-[0.2em] uppercase">Strategic Priority</p>
                <p className="text-lg font-medium text-white italic">Accelerate "Blueprint" phase to finalize supply chain SOPs for investor due diligence.</p>
              </div>
              <div className="pt-6 border-t border-zinc-800 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase">Health Index</p>
                  <p className="text-2xl font-bold text-green-500">OPTIMAL</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase">Risks</p>
                  <p className="text-2xl font-bold text-zinc-400">LOW</p>
                </div>
              </div>
            </div>
            
            <div className="bg-zinc-950/50 p-6 rounded-3xl border border-zinc-800/50 flex flex-col justify-between">
              <h4 className="text-xs font-bold text-brand-blue tracking-widest uppercase mb-4">Financial projection v1.0</h4>
              <div className="flex items-end h-24 gap-2 mb-4">
                {[30, 45, 25, 60, 85, 40, 70, 95].map((val, i) => (
                  <motion.div 
                    key={i}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: 0.5 + (i * 0.05) }}
                    className="flex-1 bg-brand-blue/30 border-t-2 border-brand-blue rounded-t-sm"
                    style={{ height: `${val}%` }}
                  />
                ))}
              </div>
              <p className="text-xs text-zinc-500 italic">Projected 34% growth in ARR post-validation phase.</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="p-8 rounded-[32px] glass-card h-full bg-zinc-900/50 border border-zinc-800/50 relative overflow-hidden min-h-[300px]">
             {isLoading && (
               <div className="absolute inset-0 bg-zinc-950/20 backdrop-blur-[2px] flex items-center justify-center z-20">
                 <Loader2 className="w-6 h-6 animate-spin text-brand-blue/30" />
               </div>
             )}
             <ActivityLogFeed logs={logs} />
           </div>
        </div>
      </section>
    </div>
  );
}
