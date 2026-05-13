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
import { useLang } from '../contexts/LangContext';
import { t } from '../lib/i18n';

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
  const { modules: dbProgress, globalProgress, isLoading: modulesLoading, error: modulesError, isOffline: modulesOffline } = useModuleProgress();
  const { logs, isLoading: logsLoading, error: logsError, isOffline: logsOffline } = useActivityLog();
  const { lang } = useLang();

  const isActuallyLoading = (modulesLoading || logsLoading) && !modulesOffline;
  const error = (modulesError || logsError) && (modulesError !== 'Supabase not configured' && logsError !== 'Supabase not configured') ? (modulesError || logsError) : null;
  const isOffline = modulesOffline || logsOffline;

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
          {/* ... */}
        </div>
      </div>
    );
  }

  if (error && !isOffline) {
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
      {isOffline && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-brand-yellow/10 border border-brand-yellow/20 px-6 py-3 rounded-2xl flex items-center justify-center gap-3 text-brand-yellow text-sm font-bold uppercase italic tracking-wider"
        >
          <div className="w-2 h-2 rounded-full bg-brand-yellow animate-pulse" />
          {t(lang, 'offline_banner')}
        </motion.div>
      )}

      {/* High-Contrast Global Progress Bar at Top */}
      <div className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl py-4 -mt-4 mb-8">
        <ProgressBar 
          progress={globalProgress} 
          label={t(lang, 'business_readiness')} 
        />
      </div>

      {/* Hero Welcome */}
      <section className="relative">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-blue/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative z-10 flex items-end justify-between">
          <div>
            <h1 className="text-5xl font-bold tracking-tight mb-2 uppercase italic leading-none">
              {t(lang, 'hero_title_1')} <span className="text-brand-blue">{t(lang, 'hero_title_2')}</span> {t(lang, 'hero_title_3')}
            </h1>
            <p className="text-zinc-500 max-w-lg text-lg italic">
              {t(lang, 'hero_subtitle')}
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-8 py-4 px-6 rounded-2xl glass-card glow-blue">
            <div>
              <p className="text-[10px] text-zinc-400 font-bold tracking-[0.1em] uppercase mb-1">{t(lang, 'global_progress')}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-brand-blue tabular-nums">{globalProgress}%</span>
              </div>
            </div>
            <div className="w-px h-10 bg-zinc-800" />
            <div>
              <p className="text-[10px] text-zinc-400 font-bold tracking-[0.1em] uppercase mb-1">{t(lang, 'modules_active')}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white tabular-nums">
                  {dbProgress.filter(p => p.completed_tasks > 0).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid of Modules - Refined Glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FRAMEWORK_MODULES.map((module, index) => {
          const Icon = iconMap[module.icon];
          const isGrowth = module.id === 'growth' || module.id === 'execution';
          const dbMod = dbProgress.find(p => p.module_key === module.id);
          
          const percent = dbMod 
            ? Math.round((dbMod.completed_tasks / dbMod.total_tasks) * 100) 
            : 0;

          const titleKey = `mod_${module.id === 'communication' ? 'comms' : (module.id === 'ideation' ? 'ideation' : (module.id === 'blueprint' ? 'blueprint' : (module.id === 'execution' ? 'execution' : (module.id === 'growth' ? 'growth' : 'risk'))))}_title` as any;
          const descKey = `mod_${module.id === 'communication' ? 'comms' : (module.id === 'ideation' ? 'ideation' : (module.id === 'blueprint' ? 'blueprint' : (module.id === 'execution' ? 'execution' : (module.id === 'growth' ? 'growth' : 'risk'))))}_desc` as any;

          return (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link to={module.path} className="group block focus:outline-none h-full">
                <div className="p-8 rounded-[32px] glass-card glass-hover relative overflow-hidden group-hover:glow-blue transition-all duration-500 h-full flex flex-col">
                  {/* ... */}
                  <h3 className="text-xl font-bold mb-3 tracking-tight group-hover:text-white transition-colors uppercase">
                    {t(lang, titleKey)}
                  </h3>
                  <p className="text-zinc-500 text-sm mb-10 leading-relaxed font-light italic flex-1">
                    {t(lang, descKey)}
                  </p>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase">{t(lang, 'completion')}</p>
                        <p className="text-lg font-bold tabular-nums">{percent}%</p>
                      </div>
                      {/* ... */}
                    </div>
                    {/* ... */}
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
      <section className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-10 rounded-[40px] glass-card glow-blue relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-8 uppercase italic flex items-center gap-3">
              <span className="w-1.5 h-6 bg-brand-blue rounded-full" />
              {t(lang, 'quick_actions')}
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {FRAMEWORK_MODULES.map((module) => (
                <Link 
                  key={module.id} 
                  to={module.path}
                  className="p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800 hover:border-brand-blue/50 hover:bg-brand-blue/5 transition-all text-sm font-medium uppercase italic tracking-tight"
                >
                  {t(lang, 'go_to')} {t(lang, `mod_${module.id === 'communication' ? 'comms' : (module.id === 'ideation' ? 'ideation' : (module.id === 'blueprint' ? 'blueprint' : (module.id === 'execution' ? 'execution' : (module.id === 'growth' ? 'growth' : 'risk'))))}_title` as any).split(' ')[0]}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="p-8 rounded-[32px] glass-card h-full bg-zinc-900/50 border border-zinc-800/50 relative overflow-hidden min-h-[300px]">
             {isActuallyLoading && (
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
