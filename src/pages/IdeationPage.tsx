import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Sparkles, 
  Loader2, 
  Save, 
  CheckCircle2, 
  ChevronRight,
  TrendingUp,
  Target,
  Users,
  Zap,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { generateStrategicAnalysis } from '../services/geminiService';
import { cn } from '../lib/utils';

const BUSINESS_ID = '00000000-0000-0000-0000-000000000001';

type Section = 'problem' | 'vpc' | 'market';

export default function IdeationPage() {
  const [activeTab, setActiveTab] = useState<Section>('problem');
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [aiAnalysis, setAiAnalysis] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  
  const [formData, setFormData] = useState({
    // Problem-Solution Fit
    problem: '',
    customer: '',
    alternatives: '',
    solution: '',
    advantage: '',
    
    // VPC
    jobs: '',
    pains: '',
    gains: '',
    products: '',
    painRelievers: '',
    gainCreators: '',
    
    // Market Sizing
    industry: '',
    tam: '',
    sam: '',
    som: '',
    assumption: ''
  });

  // Load saved data
  useEffect(() => {
    if (!supabase) return;
    
    async function loadData() {
      const { data, error } = await supabase!
        .from('module_data')
        .select('section_key, data')
        .eq('business_id', BUSINESS_ID)
        .eq('module_key', 'ideation');
        
      if (data) {
        const consolidatedData: any = {};
        data.forEach(row => {
          Object.assign(consolidatedData, row.data);
        });
        setFormData(prev => ({ ...prev, ...consolidatedData }));
      }
    }
    
    loadData();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaveStatus('idle');
  };

  const handleSave = async (section: Section) => {
    if (!supabase) return;
    setSaveStatus('saving');
    
    try {
      // Determine which data belongs to which section for cleaner updates
      let sectionData = {};
      if (section === 'problem') {
        sectionData = { 
          problem: formData.problem, 
          customer: formData.customer, 
          alternatives: formData.alternatives, 
          solution: formData.solution, 
          advantage: formData.advantage 
        };
      } else if (section === 'vpc') {
        sectionData = {
          jobs: formData.jobs,
          pains: formData.pains,
          gains: formData.gains,
          products: formData.products,
          painRelievers: formData.painRelievers,
          gainCreators: formData.gainCreators
        };
      } else if (section === 'market') {
        sectionData = {
          industry: formData.industry,
          tam: formData.tam,
          sam: formData.sam,
          som: formData.som,
          assumption: formData.assumption
        };
      }

      await supabase!
        .from('module_data')
        .upsert({
          business_id: BUSINESS_ID,
          module_key: 'ideation',
          section_key: section,
          data: sectionData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'business_id,module_key,section_key'
        });

      // Update progress
      // Simple logic: section is "done" if it has meaningful content
      const sections = ['problem', 'vpc', 'market'];
      // In a real app we'd check all data, for this demo we'll just increment
      
      await supabase!
        .from('module_progress')
        .update({ 
          completed_tasks: 1, // Simplified for demo
          updated_at: new Date().toISOString()
        })
        .eq('business_id', BUSINESS_ID)
        .eq('module_key', 'ideation');

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Save error:', error);
      setSaveStatus('idle');
    }
  };

  const handleGenerateAI = async (type: Section) => {
    setLoading(prev => ({ ...prev, [type]: true }));
    let prompt = '';

    if (type === 'problem') {
      prompt = `You are a business strategy expert analyzing a startup's Problem-Solution Fit for Davsplace Studio.
Based on this input:
- Problem: ${formData.problem}
- Target Customer: ${formData.customer}  
- Current Alternatives: ${formData.alternatives}
- Proposed Solution: ${formData.solution}
- Unique Advantage: ${formData.advantage}

Provide a structured analysis with:
1. PROBLEM VALIDATION (Is this a real, urgent problem?)
2. SOLUTION FIT SCORE (1-10 with reasoning)
3. KEY RISKS (Top 3 risks to address)
4. RECOMMENDED NEXT STEPS (3 specific actions)

Be direct, data-driven, and investor-grade in your language. Keep total response under 300 words.`;
    } else if (type === 'vpc') {
      prompt = `You are an expert in Value Proposition Design analyzing for Davsplace Studio.
Customer Profile:
- Jobs: ${formData.jobs}
- Pains: ${formData.pains}
- Gains: ${formData.gains}

Value Map:
- Products/Services: ${formData.products}
- Pain Relievers: ${formData.painRelievers}
- Gain Creators: ${formData.gainCreators}

Analyze this Value Proposition Canvas and provide:
1. FIT SCORE (How well does the value map address the customer profile? Score 1-10)
2. STRONGEST ELEMENTS (What's working well)
3. GAPS TO ADDRESS (What's missing or weak)
4. POSITIONING STATEMENT (One powerful sentence that captures the value prop for investors)

Investor-grade language. Under 250 words.`;
    } else if (type === 'market') {
      const tam = parseFloat(formData.tam) || 0;
      const sam = parseFloat(formData.sam) || 0;
      const som = parseFloat(formData.som) || 0;
      const somSamRatio = sam > 0 ? ((som / sam) * 100).toFixed(1) : '0';
      const somTamRatio = tam > 0 ? ((som / tam) * 100).toFixed(1) : '0';

      prompt = `You are a market sizing expert reviewing a startup's market analysis for Davsplace Studio — a Digital Creative Agency in Indonesia.
Market Data:
- Industry: ${formData.industry}
- TAM: $${formData.tam}
- SAM: $${formData.sam}  
- SOM: $${formData.som}
- Key Assumption: ${formData.assumption}

Ratios:
- SOM/SAM: ${somSamRatio}%
- SOM/TAM: ${somTamRatio}%

Provide:
1. SIZING VALIDITY (Are these numbers realistic?)
2. BENCHMARK COMPARISON (How does this compare to similar companies at this stage?)
3. INVESTOR RED FLAGS (What will VCs question?)
4. REVISED RECOMMENDATION (Suggested SOM range if current numbers seem off)

Be specific with numbers. Under 250 words.`;
    }

    const result = await generateStrategicAnalysis(prompt);
    setAiAnalysis(prev => ({ ...prev, [type]: result }));
    setLoading(prev => ({ ...prev, [type]: false }));
  };

  const formatCurrency = (val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) return '$0';
    if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
    return `$${num}`;
  };

  const tam = parseFloat(formData.tam) || 0;
  const sam = parseFloat(formData.sam) || 0;
  const som = parseFloat(formData.som) || 0;
  const somSamRatio = sam > 0 ? (som / sam) * 100 : 0;
  const somTamRatio = tam > 0 ? (som / tam) * 100 : 0;

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-2 text-zinc-500 hover:text-brand-yellow transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest italic">Dashboard</span>
          </Link>
          <div>
            <h1 className="text-5xl font-black italic tracking-tighter text-white uppercase">
              Ideation <span className="text-brand-yellow">& Validation</span>
            </h1>
            <p className="text-zinc-500 text-lg italic mt-2">
              Problem-Solution Fit · VPC · Market Sizing
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6 p-4 rounded-3xl glass-card bg-zinc-900/50 border-zinc-800/50">
          <div className="text-right">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Module Progress</p>
            <p className="text-2xl font-black italic text-white">33%</p>
          </div>
          <div className="flex gap-1.5">
            {[true, false, false].map((done, i) => (
              <div key={i} className={cn("w-2 h-8 rounded-full", done ? "bg-brand-yellow" : "bg-zinc-800")} />
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-zinc-900 rounded-[24px] border border-zinc-800 w-fit">
        {[
          { id: 'problem', label: 'Problem-Solution Fit', icon: Target },
          { id: 'vpc', label: 'Value Proposition Canvas', icon: Zap },
          { id: 'market', label: 'Market Sizing', icon: TrendingUp }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Section)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase italic tracking-wider transition-all duration-300",
              activeTab === tab.id 
                ? "bg-brand-yellow text-zinc-950 shadow-lg shadow-brand-yellow/20" 
                : "text-zinc-500 hover:text-white hover:bg-zinc-800"
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="grid grid-cols-1 xl:grid-cols-2 gap-10"
        >
          {/* Main Input Form */}
          <div className="space-y-8 p-10 rounded-[40px] glass-card bg-zinc-900/30 border-zinc-800/30 relative">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold uppercase italic text-white flex items-center gap-3">
                <span className="w-1.5 h-6 bg-brand-yellow rounded-full" />
                {activeTab === 'problem' && "Problem Analysis"}
                {activeTab === 'vpc' && "Strategic Mapping"}
                {activeTab === 'market' && "Market Validation"}
              </h2>
              <button 
                onClick={() => handleSave(activeTab)}
                disabled={saveStatus === 'saving'}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                  saveStatus === 'saved' ? "bg-green-500/10 text-green-500" : "bg-zinc-800 text-zinc-500 hover:text-white"
                )}
              >
                {saveStatus === 'saving' ? <Loader2 className="w-3 h-3 animate-spin" /> : saveStatus === 'saved' ? <CheckCircle2 className="w-3 h-3" /> : <Save className="w-3 h-3" />}
                {saveStatus === 'saving' ? "Saving..." : saveStatus === 'saved' ? "Saved" : "Save Progress"}
              </button>
            </div>

            {activeTab === 'problem' && (
              <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">Problem Statement</label>
                   <textarea 
                    value={formData.problem}
                    onChange={(e) => handleInputChange('problem', e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-3xl p-6 text-zinc-300 focus:outline-none focus:border-brand-yellow/50 min-h-[160px] resize-none"
                    placeholder="What critical problem does your target market face? Be specific and quantified."
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">Target Customer</label>
                   <input 
                    value={formData.customer}
                    onChange={(e) => handleInputChange('customer', e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-zinc-300 focus:outline-none focus:border-brand-yellow/50"
                    placeholder="Demographics, psychographics, behavior patterns"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">Current Alternatives</label>
                   <textarea 
                    value={formData.alternatives}
                    onChange={(e) => handleInputChange('alternatives', e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-zinc-300 focus:outline-none focus:border-brand-yellow/50 min-h-[100px] resize-none"
                    placeholder="How are customers solving this problem today? What are the gaps?"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">Proposed Solution</label>
                   <textarea 
                    value={formData.solution}
                    onChange={(e) => handleInputChange('solution', e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-zinc-300 focus:outline-none focus:border-brand-yellow/50 min-h-[140px] resize-none"
                    placeholder="Your solution and why it's 10x better than alternatives"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">Unique Advantage</label>
                   <input 
                    value={formData.advantage}
                    onChange={(e) => handleInputChange('advantage', e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-zinc-300 focus:outline-none focus:border-brand-yellow/50"
                    placeholder="What makes this defensible?"
                   />
                </div>
              </div>
            )}

            {activeTab === 'vpc' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-brand-yellow uppercase tracking-widest flex items-center gap-2">
                    <Users className="w-4 h-4" /> Customer Profile
                  </h3>
                  <div className="space-y-2">
                    <label className="text-[10px] text-zinc-600 font-bold uppercase">Customer Jobs</label>
                    <textarea 
                      value={formData.jobs}
                      onChange={(e) => handleInputChange('jobs', e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-sm text-zinc-300 focus:outline-none focus:border-brand-yellow/50 min-h-[100px] resize-none"
                      placeholder="What tasks/goals is your customer trying to accomplish?"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-zinc-600 font-bold uppercase">Customer Pains</label>
                    <textarea 
                      value={formData.pains}
                      onChange={(e) => handleInputChange('pains', e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-sm text-zinc-300 focus:outline-none focus:border-brand-yellow/50 min-h-[100px] resize-none"
                      placeholder="Frustrations, risks, obstacles they face"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-zinc-600 font-bold uppercase">Customer Gains</label>
                    <textarea 
                      value={formData.gains}
                      onChange={(e) => handleInputChange('gains', e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-sm text-zinc-300 focus:outline-none focus:border-brand-yellow/50 min-h-[100px] resize-none"
                      placeholder="Desired outcomes and benefits they want"
                    />
                  </div>
                </div>
                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-brand-blue uppercase tracking-widest flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Value Map
                  </h3>
                  <div className="space-y-2">
                    <label className="text-[10px] text-zinc-600 font-bold uppercase">Products & Services</label>
                    <textarea 
                      value={formData.products}
                      onChange={(e) => handleInputChange('products', e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-sm text-zinc-300 focus:outline-none focus:border-zinc-500 min-h-[100px] resize-none"
                      placeholder="List your core offerings"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-zinc-600 font-bold uppercase">Pain Relievers</label>
                    <textarea 
                      value={formData.painRelievers}
                      onChange={(e) => handleInputChange('painRelievers', e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-sm text-zinc-300 focus:outline-none focus:border-zinc-500 min-h-[100px] resize-none"
                      placeholder="How do you eliminate/reduce pains?"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-zinc-600 font-bold uppercase">Gain Creators</label>
                    <textarea 
                      value={formData.gainCreators}
                      onChange={(e) => handleInputChange('gainCreators', e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-sm text-zinc-300 focus:outline-none focus:border-zinc-500 min-h-[100px] resize-none"
                      placeholder="How do you create customer gains?"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'market' && (
              <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">Industry/Market</label>
                   <input 
                    value={formData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-zinc-300 focus:outline-none focus:border-brand-yellow/50"
                    placeholder="e.g. Digital Creative Services, Southeast Asia"
                   />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.1em]">TAM (USD)</label>
                    <input 
                      type="number"
                      value={formData.tam}
                      onChange={(e) => handleInputChange('tam', e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-brand-yellow/50"
                      placeholder="100000000"
                    />
                    <p className="text-[9px] text-zinc-600 italic">Total potential market if you captured 100%</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.1em]">SAM (USD)</label>
                    <input 
                      type="number"
                      value={formData.sam}
                      onChange={(e) => handleInputChange('sam', e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-brand-yellow/50"
                      placeholder="10000000"
                    />
                    <p className="text-[9px] text-zinc-600 italic">The portion of TAM you can target</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.1em]">SOM (USD)</label>
                    <input 
                      type="number"
                      value={formData.som}
                      onChange={(e) => handleInputChange('som', e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-brand-yellow/50"
                      placeholder="500000"
                    />
                    <p className="text-[9px] text-zinc-600 italic">What you can realistically capture in 3 years</p>
                  </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">Key Assumption</label>
                   <textarea 
                    value={formData.assumption}
                    onChange={(e) => handleInputChange('assumption', e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-zinc-300 focus:outline-none focus:border-brand-yellow/50 min-h-[80px] resize-none"
                    placeholder="What's your main assumption behind these numbers?"
                   />
                </div>

                {/* Live Calculator Summary */}
                <div className="mt-8 p-8 rounded-3xl bg-zinc-950 border border-zinc-800 grid grid-cols-2 lg:grid-cols-4 gap-8">
                  <div>
                    <p className="text-[9px] text-zinc-600 font-bold uppercase mb-1">TOTAL TAM</p>
                    <p className="text-xl font-black text-white italic">{formatCurrency(formData.tam)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-zinc-600 font-bold uppercase mb-1">REACHABLE SAM</p>
                    <p className="text-xl font-black text-white italic">{formatCurrency(formData.sam)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-zinc-600 font-bold uppercase mb-1">SOM CAPTURE</p>
                    <p className="text-xl font-black text-brand-yellow italic">{formatCurrency(formData.som)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-zinc-600 font-bold uppercase mb-1">SOM/TAM RATIO</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xl font-black text-white italic">{somTamRatio.toFixed(2)}%</p>
                      {somTamRatio > 5 ? (
                        <div className="flex items-center gap-1 text-[8px] text-orange-500 uppercase bg-orange-500/10 px-2 py-0.5 rounded-full">
                          <AlertCircle className="w-2 h-2" /> Ambitious
                        </div>
                      ) : somTamRatio > 0 && somTamRatio < 1 ? (
                        <div className="flex items-center gap-1 text-[8px] text-green-500 uppercase bg-green-500/10 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-2 h-2" /> Conservative
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => handleGenerateAI(activeTab)}
              disabled={loading[activeTab]}
              className="w-full bg-brand-yellow text-zinc-950 font-black rounded-3xl py-6 flex items-center justify-center gap-3 uppercase italic tracking-wider hover:bg-yellow-400 active:scale-[0.98] transition-all disabled:opacity-50 mt-4 shadow-xl shadow-brand-yellow/10"
            >
              {loading[activeTab] ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
              {activeTab === 'problem' && "Generate Problem Analysis"}
              {activeTab === 'vpc' && "Generate VPC Analysis"}
              {activeTab === 'market' && "Validate Market Sizing"}
            </button>
          </div>

          {/* AI Output Sidebar */}
          <div className="space-y-6">
            <div className="p-8 rounded-[40px] glass-card bg-zinc-950/50 border-brand-yellow/20 relative min-h-[400px] flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-black text-brand-yellow uppercase tracking-[0.2em] flex items-center gap-2 italic">
                  <Sparkles className="w-4 h-4" /> 
                  AI Strategic Analysis
                </h3>
                {aiAnalysis[activeTab] && (
                  <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest italic">Generated just now</span>
                )}
              </div>

              <div className="flex-1">
                {loading[activeTab] ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-4 text-center opacity-40">
                    <div className="w-12 h-12 rounded-full border-2 border-brand-yellow/20 border-t-brand-yellow animate-spin" />
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest italic">Computing Strategy...</p>
                  </div>
                ) : aiAnalysis[activeTab] ? (
                  <div className="space-y-6 text-zinc-300 leading-relaxed text-sm whitespace-pre-wrap font-medium font-inter overflow-y-auto max-h-[600px] pr-4 scrollbar-thin scrollbar-thumb-zinc-800">
                    {aiAnalysis[activeTab]}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center space-y-6 text-center">
                    <div className="w-16 h-16 rounded-3xl bg-zinc-900 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-zinc-800" />
                    </div>
                    <div>
                      <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest italic mb-2">Awaiting Directive</p>
                      <p className="text-[10px] text-zinc-600 max-w-[240px] mx-auto italic">Complete the form and click generate to receive a high-fidelity business engineering analysis.</p>
                    </div>
                  </div>
                )}
              </div>

              {aiAnalysis[activeTab] && (
                <div className="mt-8 pt-8 border-t border-zinc-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest italic">Investor Grade Ready</span>
                  </div>
                  <button className="text-[9px] text-brand-yellow font-bold uppercase tracking-widest hover:underline italic">Export Analysis</button>
                </div>
              )}
            </div>

            {/* Quick Tips */}
            <div className="p-8 rounded-[40px] glass-card bg-zinc-900/20 border-zinc-800/50">
              <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <ChevronRight className="w-3 h-3 text-brand-yellow" />
                Strategic Protocol
              </h4>
              <ul className="space-y-3">
                {[
                  "Focus on data-driven assertions rather than vision statements.",
                  "Quantify problem magnitude whenever possible.",
                  "Be ultra-specific with target demographics."
                ].map((tip, i) => (
                  <li key={i} className="text-[11px] text-zinc-500 italic flex gap-3">
                    <span className="text-brand-yellow font-bold">0{i+1}</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
