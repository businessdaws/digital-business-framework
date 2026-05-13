import { useParams, Link } from 'react-router-dom';
import { FRAMEWORK_MODULES } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Save, Send, Link as LinkIcon, Sparkles, Loader2, BrainCircuit } from 'lucide-react';
import { useState } from 'react';
import { getModuleStrategySummary } from '../services/geminiService';

export default function ModulePage() {
  const { id } = useParams();
  const module = FRAMEWORK_MODULES.find(m => m.id === id);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!module) return <div>Module not found</div>;

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleRunAI = async () => {
    setLoading(true);
    const summary = await getModuleStrategySummary(module.title, formData);
    setAiSummary(summary);
    setLoading(false);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Strategy Control
      </Link>

      <section className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight uppercase italic">{module.title}</h1>
        <p className="text-zinc-400 italic text-lg">{module.description}</p>
      </section>

      <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-8">
        <div className="flex items-center justify-between p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-yellow-500 tracking-widest uppercase">Live Framework Entry Mode</span>
          </div>
          <button className="text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1 rounded-full flex items-center gap-2 transition-colors">
            <LinkIcon className="w-3 h-3" /> Sync Google Sheets
          </button>
        </div>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Primary Objective</label>
              <input 
                type="text" 
                placeholder="What are we solving?"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500/50 transition-colors"
                onChange={(e) => handleInputChange('objective', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Target Market Segment</label>
              <input 
                type="text" 
                placeholder="Who is this for?"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500/50 transition-colors"
                onChange={(e) => handleInputChange('market', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Core Value Prop (VPC Mapping)</label>
            <textarea 
              rows={4}
              placeholder="Describe the unique value being created..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500/50 transition-colors resize-none"
              onChange={(e) => handleInputChange('vpc', e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button className="bg-brand-yellow text-zinc-950 px-6 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-brand-yellow/90 transition-all shadow-lg shadow-brand-yellow/10 uppercase italic tracking-tight">
              <Save className="w-4 h-4" /> Save Strategy Draft
            </button>
            <button className="bg-zinc-800 text-white px-6 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-zinc-700 transition-all uppercase italic tracking-tight border border-zinc-700">
              <Send className="w-4 h-4" /> Finalize Module
            </button>
          </div>
        </form>
      </div>

      {/* AI Agent Section */}
      <section className="p-8 rounded-[32px] glass-card border-brand-blue/20 glow-blue overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8">
          <BrainCircuit className="w-24 h-24 text-brand-blue/5" />
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold uppercase italic flex items-center gap-2 text-brand-blue">
                <Sparkles className="w-5 h-5" />
                Strategic AI Analyst
              </h3>
              <p className="text-zinc-500 text-sm mt-1 italic">Generate a high-fidelity summary of this module's impact on your growth vision.</p>
            </div>
            
            <button 
              onClick={handleRunAI}
              disabled={loading}
              className="bg-brand-yellow text-zinc-950 px-6 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-brand-yellow/90 transition-all shadow-lg shadow-brand-yellow/10 uppercase italic tracking-tight disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? 'Analyzing Framework...' : 'Run Strategy Analysis'}
            </button>
          </div>

          <AnimatePresence>
            {aiSummary && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-brand-blue/5 border border-brand-blue/20"
              >
                <div className="text-[10px] text-brand-blue font-bold tracking-widest uppercase mb-3">Executive Summary Output</div>
                <p className="text-zinc-300 italic leading-relaxed text-lg">
                  {aiSummary}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <div className="p-8 rounded-3xl border border-dashed border-zinc-800 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500">
          <LinkIcon className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold">Next Stage: Automated Analysis</h4>
          <p className="text-zinc-500 text-sm max-w-sm">Complete this form to unlock the AI-powered business analyst agent for this module.</p>
        </div>
      </div>
    </div>
  );
}
