import { useState, useEffect, useRef } from 'react';
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
  AlertCircle,
  ExternalLink,
  Plus,
  Trash2,
  Trophy,
  PieChart,
  Globe,
  Coins,
  Library
} from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { supabase } from '../lib/supabase';
import { generateStrategicAnalysis } from '../services/geminiService';
import { cn } from '../lib/utils';
import { useLang } from '../contexts/LangContext';
import { t } from '../lib/i18n';

const BUSINESS_ID = '00000000-0000-0000-0000-000000000001';

type TabType = 'psf' | 'vpc' | 'market' | 'references';

interface Reference {
  title: string;
  source: string;
  relevance: string;
  url: string;
}

interface Competitor {
  name: string;
  weakness: string;
  opportunity: string;
}

const CATEGORIES = [
  { id: 'ecommerce', label: '🛍️ E-Commerce & Retail' },
  { id: 'saas', label: '💡 SaaS & Teknologi' },
  { id: 'creative', label: '🎨 Kreatif & Desain' },
  { id: 'mobile', label: '📱 Mobile & Aplikasi' },
  { id: 'health', label: '🏥 Kesehatan & Wellness' },
  { id: 'education', label: '🎓 Edukasi & Pelatihan' },
  { id: 'fnb', label: '🍕 F&B & Kuliner' },
  { id: 'property', label: '🏗️ Properti & Konstruksi' },
  { id: 'fintech', label: '💰 Keuangan & Fintech' },
  { id: 'sustainability', label: '🌿 Sustainability & Green' },
  { id: 'consulting', label: '🎯 Konsultan & Jasa' },
  { id: 'manufacturing', label: '🔧 Manufaktur & Produksi' }
];

export default function IdeationPage() {
  const [activeTab, setActiveTab] = useState<TabType>('psf');
  const [businessTopic, setBusinessTopic] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [targetMarket, setTargetMarket] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [aiAnalysis, setAiAnalysis] = useState<Record<string, string>>({});
  const [showToast, setShowToast] = useState(false);
  const { lang } = useLang();

  const [formData, setFormData] = useState({
    // PSF
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
    // Market
    industry: '',
    tam: '',
    sam: '',
    som: '',
    assumption: ''
  });

  const [references, setReferences] = useState<Reference[]>([]);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [swot, setSwot] = useState({ s: '', w: '', o: '', t: '' });

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadedRef = useRef(false);

  // Load Data
  useEffect(() => {
    if (!supabase) return;
    async function loadData() {
      const { data, error } = await supabase!
        .from('module_data')
        .select('section_key, data')
        .eq('business_id', BUSINESS_ID)
        .eq('module_key', 'ideation');

      if (data) {
        const loadedData: any = {};
        data.forEach(row => {
          if (row.section_key === 'foundation') {
            setBusinessTopic(row.data.businessTopic || '');
            setSelectedCategory(row.data.selectedCategory || '');
            setTargetMarket(row.data.targetMarket || '');
          } else if (row.section_key === 'references_data') {
            setReferences(row.data.references || []);
            setCompetitors(row.data.competitors || []);
            setSwot(row.data.swot || { s: '', w: '', o: '', t: '' });
          } else {
            Object.assign(loadedData, row.data);
          }
        });
        setFormData(prev => ({ ...prev, ...loadedData }));
      }
      isLoadedRef.current = true;
    }
    loadData();
  }, []);

  // Save Function
  const saveAll = async () => {
    if (!supabase || !isLoadedRef.current) return;
    setIsSaving(true);
    try {
      const psfData = { 
        problem: formData.problem, 
        customer: formData.customer, 
        alternatives: formData.alternatives, 
        solution: formData.solution, 
        advantage: formData.advantage 
      };
      const vpcData = {
        jobs: formData.jobs,
        pains: formData.pains,
        gains: formData.gains,
        products: formData.products,
        painRelievers: formData.painRelievers,
        gainCreators: formData.gainCreators
      };
      const marketData = {
        industry: formData.industry,
        tam: formData.tam,
        sam: formData.sam,
        som: formData.som,
        assumption: formData.assumption
      };
      const foundationData = { businessTopic, selectedCategory, targetMarket };
      const referencesData = { references, competitors, swot };

      const sections = [
        { key: 'foundation', data: foundationData },
        { key: 'psf', data: psfData },
        { key: 'vpc', data: vpcData },
        { key: 'market', data: marketData },
        { key: 'references_data', data: referencesData }
      ];

      for (const section of sections) {
        await supabase!
          .from('module_data')
          .upsert({
            business_id: BUSINESS_ID,
            module_key: 'ideation',
            section_key: section.key,
            data: section.data,
            updated_at: new Date().toISOString()
          }, { onConflict: 'business_id,module_key,section_key' });
      }

      // Progress Check
      const checkComplete = (fields: string[]) => fields.filter(f => (formData as any)[f]?.length > 20).length >= 3;
      const psfComplete = checkComplete(['problem', 'customer', 'alternatives', 'solution', 'advantage']);
      const vpcComplete = checkComplete(['jobs', 'pains', 'gains', 'products', 'painRelievers', 'gainCreators']);
      const marketComplete = checkComplete(['industry', 'tam', 'sam', 'som']);
      const refComplete = references.length >= 2 || competitors.length >= 2;

      const completedCount = [psfComplete, vpcComplete, marketComplete, refComplete].filter(Boolean).length;
      
      await supabase!
        .from('module_progress')
        .upsert({
          business_id: BUSINESS_ID,
          module_key: 'ideation',
          completed_tasks: completedCount,
          total_tasks: 4,
          updated_at: new Date().toISOString()
        }, { onConflict: 'business_id,module_key' });

      setLastSaved(new Date());
      if (completedCount === 4) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#EAB308', '#FFFFFF', '#000000']
        });
      }
    } catch (e) {
      console.error('Save failed', e);
    } finally {
      setIsSaving(false);
    }
  };

  // Auto Save
  useEffect(() => {
    if (!isLoadedRef.current) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(saveAll, 30000);
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [formData, businessTopic, selectedCategory, targetMarket, references, competitors, swot]);

  const handleInitialize = async () => {
    if (!businessTopic) return;
    setIsInitializing(true);
    try {
      const seedPrompt = `
Kami adalah konsultan bisnis strategi senior yang membantu menganalisis ide bisnis untuk Davsplace Studio.
Topik Bisnis: ${businessTopic}
Kategori: ${selectedCategory}
Target Pasar: ${targetMarket}

Berikan analisis awal dalam format JSON ONLY, tidak ada teks lain selain JSON:
{
  "psf": {
    "problem": "Masalah spesifik...",
    "customer": "Customer persona...",
    "alternatives": "Kompetisi saat ini...",
    "solution": "Unique solution...",
    "advantage": "Defensibility..."
  },
  "vpc": {
    "jobs": "Tasks to be done...",
    "pains": "Obstacles...",
    "gains": "Benefits...",
    "products": "Features...",
    "painRelievers": "Solusinya...",
    "gainCreators": "Pencipta nilai..."
  },
  "market": {
    "industry": "Specific sector...",
    "tam": "1000000000",
    "sam": "100000000",
    "som": "1000000",
    "assumption": "Key assumption..."
  },
  "references": [
    { "title": "...", "source": "...", "relevance": "...", "url": "..." }
  ],
  "competitors": [
    { "name": "...", "weakness": "...", "opportunity": "..." }
  ]
}
Gunakan angka untuk TAM/SAM/SOM. Referensi dan kompetitor minimal 3 yang NYATA. Bahasa Indonesia.`;

      const response = await generateStrategicAnalysis(seedPrompt);
      const jsonResponse = JSON.parse(response.replace(/```json|```/g, '').trim());

      setFormData(prev => ({
        ...prev,
        ...jsonResponse.psf,
        ...jsonResponse.vpc,
        ...jsonResponse.market
      }));
      setReferences(jsonResponse.references);
      setCompetitors(jsonResponse.competitors);
      setActiveTab('psf');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
      saveAll();
    } catch (e) {
      console.error('Initialization failed', e);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleGenerateSectionAI = async (tab: TabType) => {
    setLoading(prev => ({ ...prev, [tab]: true }));
    try {
      let sectionContext = '';
      if (tab === 'psf') sectionContext = JSON.stringify(formData);
      if (tab === 'vpc') sectionContext = JSON.stringify(formData);
      if (tab === 'market') sectionContext = JSON.stringify(formData);

      const prompt = `
Analis strategis untuk: ${businessTopic} (${selectedCategory})
Target: ${targetMarket}
Data Seksi ${tab}: ${sectionContext}

Berikan analisis mendalam (text response) tentang seksi ini.`;
      
      const res = await generateStrategicAnalysis(prompt);
      setAiAnalysis(prev => ({ ...prev, [tab]: res }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(prev => ({ ...prev, [tab]: false }));
    }
  };

  const calculateProgress = () => {
    const check = (fields: string[]) => fields.filter(f => (formData as any)[f]?.length > 20).length >= 3;
    const psf = check(['problem', 'customer', 'alternatives', 'solution', 'advantage']);
    const vpc = check(['jobs', 'pains', 'gains', 'products', 'painRelievers', 'gainCreators']);
    const market = check(['industry', 'tam', 'sam', 'som']);
    const ref = references.length >= 2 || competitors.length >= 2;
    return {
      psf, vpc, market, ref,
      count: [psf, vpc, market, ref].filter(Boolean).length
    };
  };

  const progress = calculateProgress();

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto px-4">
      {/* Header & Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <Link to="/" className="flex items-center gap-2 text-zinc-500 hover:text-brand-yellow transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest italic">Dashboard</span>
          </Link>
          <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase">
            Ideation <span className="text-brand-yellow">& Validation</span>
          </h1>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-right">
             <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{progress.count} / 4 {t(lang, 'completion_status')}</p>
             <div className="flex items-center gap-4 mt-1">
                {isSaving ? (
                  <span className="text-[10px] text-zinc-500 flex items-center gap-1.5 font-bold italic">
                    <Loader2 className="w-3 h-3 animate-spin" /> {t(lang, 'save_saving')}
                  </span>
                ) : lastSaved ? (
                  <span className="text-[10px] text-green-500 flex items-center gap-1.5 font-bold italic">
                    <CheckCircle2 className="w-3 h-3" /> {t(lang, 'status_saved')} {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                ) : (
                  <span className="text-[10px] text-zinc-700 font-bold italic">{t(lang, 'status_not_saved')}</span>
                )}
                <button 
                  onClick={saveAll}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase"
                >
                  {t(lang, 'btn_save')}
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* SUCCESS TOAST */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 bg-zinc-900 border border-yellow-500/50 rounded-2xl shadow-2xl shadow-yellow-500/20 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
               <CheckCircle2 className="w-5 h-5 text-zinc-950" />
            </div>
            <p className="text-sm font-bold text-white whitespace-nowrap">
               {t(lang, 'toast_ai_success')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION 0 — IDEA FOUNDATION */}
      <div className="bg-zinc-900 border border-yellow-500/30 rounded-[40px] p-8 md:p-12 shadow-[0_0_60px_rgba(234,179,8,0.05)] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 blur-[100px] -mr-32 -mt-32" />
        
        <div className="relative z-10 space-y-10">
          <div className="space-y-4">
            <label className="text-[10px] font-bold text-yellow-500 uppercase tracking-[0.2em] mb-4 block">
              {t(lang, 'label_main_topic')}
            </label>
            <input 
              value={businessTopic}
              onChange={(e) => setBusinessTopic(e.target.value)}
              placeholder={t(lang, 'placeholder_main_topic')}
              className="w-full bg-zinc-950/50 border border-zinc-800 rounded-[28px] px-8 py-6 text-2xl md:text-3xl font-black text-white placeholder:text-zinc-800 focus:outline-none focus:border-yellow-500/50 focus:bg-zinc-950 transition-all italic tracking-tight"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
             <div className="space-y-6">
                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] block">
                  {t(lang, 'label_industry_category')}
                </label>
                <div className="flex flex-wrap gap-2.5">
                   {CATEGORIES.map(cat => (
                     <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.label)}
                        className={cn(
                          "px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap",
                          selectedCategory === cat.label 
                            ? "bg-yellow-500 text-zinc-950 shadow-lg shadow-yellow-500/20 scale-105" 
                            : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300"
                        )}
                     >
                       {cat.label}
                     </button>
                   ))}
                </div>
             </div>

             <div className="space-y-6">
                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] block">
                  {t(lang, 'label_target_market')}
                </label>
                <input 
                  value={targetMarket}
                  onChange={(e) => setTargetMarket(e.target.value)}
                  placeholder={t(lang, 'placeholder_target_market')}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-yellow-500/30 font-medium"
                />
                
                <button 
                  onClick={handleInitialize}
                  disabled={isInitializing || !businessTopic}
                  className="w-full bg-yellow-500 text-zinc-950 font-black rounded-2xl py-5 text-base uppercase italic tracking-wider hover:bg-yellow-400 active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-yellow-500/10 flex items-center justify-center gap-3"
                >
                  {isInitializing ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> {t(lang, 'status_ai_analyzing')}</>
                  ) : (
                    <><Sparkles className="w-5 h-5" /> {t(lang, 'btn_start_analysis')}</>
                  )}
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* SECTION TABS */}
      <div className="flex flex-wrap gap-3 p-2 bg-zinc-900/50 backdrop-blur-xl rounded-[32px] border border-zinc-800/50 w-full lg:w-fit">
        {[
          { id: 'psf', label: t(lang, 'tab_psf'), icon: Target, complete: progress.psf },
          { id: 'vpc', label: t(lang, 'tab_vpc'), icon: Zap, complete: progress.vpc },
          { id: 'market', label: t(lang, 'tab_market'), icon: TrendingUp, complete: progress.market },
          { id: 'references', label: t(lang, 'tab_references'), icon: Library, complete: progress.ref }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={cn(
              "flex items-center gap-3 px-6 py-4 rounded-2xl text-[11px] font-black uppercase italic tracking-widest transition-all",
              activeTab === tab.id 
                ? "bg-yellow-500 text-zinc-950 shadow-xl shadow-yellow-500/20" 
                : "text-zinc-500 hover:text-white hover:bg-zinc-800/80"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            <div className={cn(
              "w-2 h-2 rounded-full border border-zinc-700 ml-1",
              tab.complete ? "bg-yellow-500 border-none shadow-[0_0_8px_rgba(234,179,8,0.5)]" : ""
            )} />
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="grid grid-cols-1 xl:grid-cols-2 gap-10"
        >
          {/* TAB 1: PSF */}
          {activeTab === 'psf' && (
            <div className="space-y-8 p-10 rounded-[40px] bg-zinc-900/40 border border-zinc-800/60 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1.5 h-6 bg-yellow-500 rounded-full" />
                  <h2 className="text-xl font-black uppercase italic text-white">{t(lang, 'label_problem_analysis')}</h2>
                </div>
                
                <div className="space-y-8">
                  {[
                    { id: 'problem', label: 'label_problem_statement', placeholder: 'placeholder_problem_statement', multiline: true },
                    { id: 'customer', label: 'label_target_customer', placeholder: 'placeholder_target_customer' },
                    { id: 'alternatives', label: 'label_current_alternatives', placeholder: 'placeholder_current_alternatives', multiline: true },
                    { id: 'solution', label: 'label_proposed_solution', placeholder: 'placeholder_proposed_solution', multiline: true },
                    { id: 'advantage', label: 'label_unique_advantage', placeholder: 'placeholder_unique_advantage' }
                  ].map(field => (
                    <div key={field.id} className="space-y-3">
                      <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] ml-2 block">
                        {t(lang, field.label as any)}
                      </label>
                      {field.multiline ? (
                        <textarea 
                          value={(formData as any)[field.id]}
                          onChange={(e) => setFormData(prev => ({ ...prev, [field.id]: e.target.value }))}
                          placeholder={t(lang, field.placeholder as any)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-3xl p-6 text-zinc-300 focus:outline-none focus:border-yellow-500/30 min-h-[140px] resize-none text-sm leading-relaxed"
                        />
                      ) : (
                        <input 
                          value={(formData as any)[field.id]}
                          onChange={(e) => setFormData(prev => ({ ...prev, [field.id]: e.target.value }))}
                          placeholder={t(lang, field.placeholder as any)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-zinc-300 focus:outline-none focus:border-yellow-500/30 text-sm"
                        />
                      )}
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => handleGenerateSectionAI('psf')}
                  disabled={loading.psf}
                  className="w-full py-5 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center gap-3 text-yellow-500 font-bold uppercase text-xs hover:bg-zinc-900 transition-all mt-6"
                >
                  {loading.psf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {t(lang, 'gen_problem')}
                </button>
            </div>
          )}

          {/* TAB 2: VPC */}
          {activeTab === 'vpc' && (
            <div className="space-y-8 p-10 rounded-[40px] bg-zinc-900/40 border border-zinc-800/60 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1.5 h-6 bg-brand-blue rounded-full" />
                  <h2 className="text-xl font-black uppercase italic text-white">{t(lang, 'label_strategic_mapping')}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-8">
                     <h3 className="text-sm font-black text-yellow-500 uppercase tracking-widest flex items-center gap-2 italic">
                       <Users className="w-4 h-4" /> {t(lang, 'label_customer_profile')}
                     </h3>
                     {[
                       { id: 'jobs', label: 'label_customer_jobs', placeholder: 'placeholder_customer_jobs' },
                       { id: 'pains', label: 'label_customer_pains', placeholder: 'placeholder_customer_pains' },
                       { id: 'gains', label: 'label_customer_gains', placeholder: 'placeholder_customer_gains' }
                     ].map(field => (
                       <div key={field.id} className="space-y-2">
                         <label className="text-[10px] text-zinc-600 font-bold uppercase ml-2">{t(lang, field.label as any)}</label>
                         <textarea 
                           value={(formData as any)[field.id]}
                           onChange={(e) => setFormData(prev => ({ ...prev, [field.id]: e.target.value }))}
                           placeholder={t(lang, field.placeholder as any)}
                           className="w-full bg-zinc-950 border border-zinc-800 rounded-3xl p-5 text-sm text-zinc-300 focus:outline-none focus:border-yellow-500/20 min-h-[100px] resize-none"
                         />
                       </div>
                     ))}
                   </div>

                   <div className="space-y-8">
                     <h3 className="text-sm font-black text-brand-blue uppercase tracking-widest flex items-center gap-2 italic">
                       <Zap className="w-4 h-4" /> {t(lang, 'label_value_map')}
                     </h3>
                     {[
                       { id: 'products', label: 'label_products_services', placeholder: 'placeholder_products_services' },
                       { id: 'painRelievers', label: 'label_pain_relievers', placeholder: 'placeholder_pain_relievers' },
                       { id: 'gainCreators', label: 'label_gain_creators', placeholder: 'placeholder_gain_creators' }
                     ].map(field => (
                       <div key={field.id} className="space-y-2">
                         <label className="text-[10px] text-zinc-600 font-bold uppercase ml-2">{t(lang, field.label as any)}</label>
                         <textarea 
                           value={(formData as any)[field.id]}
                           onChange={(e) => setFormData(prev => ({ ...prev, [field.id]: e.target.value }))}
                           placeholder={t(lang, field.placeholder as any)}
                           className="w-full bg-zinc-950 border border-zinc-800 rounded-3xl p-5 text-sm text-zinc-300 focus:outline-none focus:border-brand-blue/20 min-h-[100px] resize-none"
                         />
                       </div>
                     ))}
                   </div>
                </div>

                <button 
                  onClick={() => handleGenerateSectionAI('vpc')}
                  disabled={loading.vpc}
                  className="w-full py-5 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center gap-3 text-yellow-500 font-bold uppercase text-xs hover:bg-zinc-900 transition-all mt-6"
                >
                  {loading.vpc ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {t(lang, 'gen_vpc')}
                </button>
            </div>
          )}

          {/* TAB 3: Market */}
          {activeTab === 'market' && (
            <div className="space-y-8 p-10 rounded-[40px] bg-zinc-900/40 border border-zinc-800/60 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1.5 h-6 bg-green-500 rounded-full" />
                  <h2 className="text-xl font-black uppercase italic text-white">{t(lang, 'label_market_validation')}</h2>
                </div>

                <div className="space-y-8">
                  <div className="space-y-3">
                     <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] ml-2 block">{t(lang, 'label_industry_market')}</label>
                     <input 
                      value={formData.industry}
                      onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                      placeholder={t(lang, 'placeholder_industry_market')}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-zinc-300 focus:outline-none focus:border-green-500/30"
                     />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     {[
                       { id: 'tam', label: 'label_market_tam', desc: 'desc_tam', icon: Globe },
                       { id: 'sam', label: 'label_market_sam', desc: 'desc_sam', icon: Target },
                       { id: 'som', label: 'label_market_som', desc: 'desc_som', icon: PieChart }
                     ].map(field => (
                       <div key={field.id} className="space-y-2">
                         <div className="flex items-center gap-2 mb-1">
                           <field.icon className="w-3 h-3 text-green-500" />
                           <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{t(lang, field.label as any)}</label>
                         </div>
                         <input 
                           type="number"
                           value={(formData as any)[field.id]}
                           onChange={(e) => setFormData(prev => ({ ...prev, [field.id]: e.target.value }))}
                           className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-green-500/30"
                           placeholder="0"
                         />
                         <p className="text-[9px] text-zinc-700 italic px-1">{t(lang, field.desc as any)}</p>
                       </div>
                     ))}
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] ml-2 block">{t(lang, 'label_key_assumption')}</label>
                    <textarea 
                      value={formData.assumption}
                      onChange={(e) => setFormData(prev => ({ ...prev, assumption: e.target.value }))}
                      placeholder={t(lang, 'placeholder_key_assumption')}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-3xl p-6 text-zinc-300 focus:outline-none focus:border-green-500/30 min-h-[100px] resize-none"
                    />
                  </div>

                  {/* Calculator Summary */}
                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mt-4">
                     {[
                       { label: 'total_tam', val: formData.tam, color: 'text-white' },
                       { label: 'reachable_sam', val: formData.sam, color: 'text-white' },
                       { label: 'som_capture', val: formData.som, color: 'text-yellow-500' }
                     ].map(stat => (
                       <div key={stat.label} className="p-5 rounded-2xl bg-zinc-950/50 border border-zinc-800">
                          <p className="text-[9px] text-zinc-600 font-black uppercase mb-1">{t(lang, stat.label as any)}</p>
                          <p className={cn("text-lg font-black italic", stat.color)}>
                            ${Number(stat.val || 0).toLocaleString()}
                          </p>
                       </div>
                     ))}
                     <div className="p-5 rounded-2xl bg-zinc-950/50 border border-zinc-800">
                        <p className="text-[9px] text-zinc-600 font-black uppercase mb-1">{t(lang, 'som_tam_ratio')}</p>
                        <p className="text-lg font-black italic text-green-500">
                          {formData.tam ? ((Number(formData.som)/Number(formData.tam))*100).toFixed(2) : 0}%
                        </p>
                     </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleGenerateSectionAI('market')}
                  disabled={loading.market}
                  className="w-full py-5 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center gap-3 text-yellow-500 font-bold uppercase text-xs hover:bg-zinc-900 transition-all mt-6"
                >
                  {loading.market ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {t(lang, 'gen_market')}
                </button>
            </div>
          )}

          {/* TAB 4: References & Competitors */}
          {activeTab === 'references' && (
            <div className="space-y-12 p-10 rounded-[40px] bg-zinc-900/40 border border-zinc-800/60 backdrop-blur-sm">
                
                {/* References List */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.3em] italic">{t(lang, 'label_references')}</h2>
                    <button 
                      onClick={() => setReferences([...references, { title: '', source: '', relevance: '', url: '' }])}
                      className="text-[10px] font-bold text-zinc-500 hover:text-white flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3 h-3" /> {t(lang, 'btn_add_reference')}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {references.map((ref, idx) => (
                      <div key={idx} className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl relative group/ref">
                        <button 
                          onClick={() => setReferences(references.filter((_, i) => i !== idx))}
                          className="absolute top-4 right-4 text-zinc-800 hover:text-red-500 opacity-0 group-hover/ref:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="space-y-4">
                          <input 
                            value={ref.title}
                            onChange={(e) => {
                              const newRefs = [...references];
                              newRefs[idx].title = e.target.value;
                              setReferences(newRefs);
                            }}
                            placeholder="Judul Riset/Artikel"
                            className="bg-transparent text-white font-bold text-lg w-full focus:outline-none placeholder:text-zinc-800 mb-1"
                          />
                          <div className="grid grid-cols-2 gap-4">
                             <input 
                              value={ref.source}
                              onChange={(e) => {
                                const newRefs = [...references];
                                newRefs[idx].source = e.target.value;
                                setReferences(newRefs);
                              }}
                              placeholder="Sumber (mis. Statista)"
                              className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-yellow-500 font-bold focus:outline-none placeholder:text-zinc-700"
                            />
                            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2">
                               <ExternalLink className="w-3 h-3 text-zinc-600" />
                               <input 
                                value={ref.url}
                                onChange={(e) => {
                                  const newRefs = [...references];
                                  newRefs[idx].url = e.target.value;
                                  setReferences(newRefs);
                                }}
                                placeholder="https://..."
                                className="bg-transparent text-[10px] text-zinc-400 w-full focus:outline-none"
                              />
                            </div>
                          </div>
                          <textarea 
                            value={ref.relevance}
                            onChange={(e) => {
                              const newRefs = [...references];
                              newRefs[idx].relevance = e.target.value;
                              setReferences(newRefs);
                            }}
                            placeholder="Relevansi terhadap strategi Anda..."
                            className="bg-transparent text-sm text-zinc-500 italic w-full focus:outline-none resize-none min-h-[60px]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Competitors List */}
                <div className="space-y-6">
                   <div className="flex items-center justify-between">
                    <h2 className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] italic">{t(lang, 'label_competitors')}</h2>
                    <button 
                      onClick={() => setCompetitors([...competitors, { name: '', weakness: '', opportunity: '' }])}
                      className="text-[10px] font-bold text-zinc-500 hover:text-white flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3 h-3" /> {t(lang, 'btn_add_competitor')}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {competitors.map((comp, idx) => (
                      <div key={idx} className="bg-zinc-950 border border-zinc-800 p-8 rounded-3xl relative group/comp">
                         <button 
                          onClick={() => setCompetitors(competitors.filter((_, i) => i !== idx))}
                          className="absolute top-6 right-6 text-zinc-800 hover:text-red-500 opacity-0 group-hover/comp:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="space-y-6">
                           <input 
                             value={comp.name}
                             onChange={(e) => {
                               const newComp = [...competitors];
                               newComp[idx].name = e.target.value;
                               setCompetitors(newComp);
                             }}
                             placeholder="Nama Kompetitor"
                             className="bg-transparent text-2xl font-black text-white w-full focus:outline-none italic tracking-tighter"
                           />
                           
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2 p-4 rounded-2xl bg-red-500/5 border border-red-500/10">
                                 <p className="text-[9px] font-black text-red-400 uppercase tracking-widest">{t(lang, 'label_weakness')}</p>
                                 <textarea 
                                   value={comp.weakness}
                                   onChange={(e) => {
                                     const newComp = [...competitors];
                                     newComp[idx].weakness = e.target.value;
                                     setCompetitors(newComp);
                                   }}
                                   placeholder="Apa titik lemah mereka?"
                                   className="bg-transparent text-sm text-zinc-400 w-full focus:outline-none resize-none min-h-[60px]"
                                 />
                              </div>
                              <div className="space-y-2 p-4 rounded-2xl bg-green-500/5 border border-green-500/10">
                                 <p className="text-[9px] font-black text-green-400 uppercase tracking-widest">{t(lang, 'label_opportunity')}</p>
                                 <textarea 
                                   value={comp.opportunity}
                                   onChange={(e) => {
                                     const newComp = [...competitors];
                                     newComp[idx].opportunity = e.target.value;
                                     setCompetitors(newComp);
                                   }}
                                   placeholder="Peluang yang bisa Anda ambil?"
                                   className="bg-transparent text-sm text-zinc-400 w-full focus:outline-none resize-none min-h-[60px]"
                                 />
                              </div>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SWOT GRID */}
                <div className="space-y-6 pt-6 border-t border-zinc-800">
                   <h2 className="text-[10px] font-black text-white uppercase tracking-[0.3em] italic">{t(lang, 'label_swot')}</h2>
                   
                   <div className="grid grid-cols-2 gap-4">
                      {[
                        { id: 's', label: 'label_swot_s', color: 'border-green-500/20 bg-green-500/5 text-green-400' },
                        { id: 'w', label: 'label_swot_w', color: 'border-red-500/20 bg-red-500/5 text-red-400' },
                        { id: 'o', label: 'label_swot_o', color: 'border-blue-500/20 bg-blue-500/5 text-blue-400' },
                        { id: 't', label: 'label_swot_t', color: 'border-orange-500/20 bg-orange-500/5 text-orange-400' }
                      ].map(quad => (
                        <div key={quad.id} className={cn("p-6 rounded-3xl border space-y-4", quad.color)}>
                           <p className="text-[10px] font-black uppercase tracking-widest">{t(lang, quad.label as any)}</p>
                           <textarea 
                             value={(swot as any)[quad.id]}
                             onChange={(e) => setSwot(prev => ({ ...prev, [quad.id]: e.target.value }))}
                             className="bg-transparent w-full text-sm text-white/80 focus:outline-none min-h-[100px] resize-none"
                             placeholder="..."
                           />
                        </div>
                      ))}
                   </div>
                   
                   <button 
                     onClick={() => handleGenerateSectionAI('references')}
                     disabled={loading.references}
                     className="w-full py-4 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center gap-3 text-zinc-400 font-bold uppercase text-[10px] hover:text-white transition-all shadow-xl"
                   >
                     {loading.references ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                     {t(lang, 'btn_gen_swot')}
                   </button>
                </div>
            </div>
          )}

          {/* AI OUTPUT SIDEBAR */}
          <div className="space-y-6">
            <div className="p-10 rounded-[40px] bg-zinc-950 border border-yellow-500/10 relative min-h-[500px] flex flex-col shadow-2xl">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-2xl bg-yellow-500/10 flex items-center justify-center">
                     <Sparkles className="w-5 h-5 text-yellow-500" />
                   </div>
                   <div>
                     <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] italic leading-tight">
                       {t(lang, 'ai_strat_analysis')}
                     </h3>
                     <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-0.5 italic">
                       {aiAnalysis[activeTab] ? t(lang, 'gen_now') : t(lang, 'await_directive')}
                     </p>
                   </div>
                </div>
              </div>

              <div className="flex-1">
                {loading[activeTab] ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-4 text-center opacity-40">
                    <div className="w-12 h-12 rounded-full border-2 border-yellow-500/20 border-t-yellow-500 animate-spin" />
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest italic">{t(lang, 'loading_ai')}</p>
                  </div>
                ) : aiAnalysis[activeTab] ? (
                  <div className="space-y-6 text-zinc-400 leading-relaxed text-sm whitespace-pre-wrap font-medium font-inter overflow-y-auto max-h-[700px] pr-4 scrollbar-thin scrollbar-thumb-zinc-800">
                    {aiAnalysis[activeTab]}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center space-y-8 text-center px-6">
                    <div className="relative">
                       <div className="absolute inset-0 bg-yellow-500/20 blur-3xl opacity-20 animate-pulse" />
                       <div className="w-20 h-20 rounded-[32px] bg-zinc-900 flex items-center justify-center relative border border-zinc-800">
                         <Sparkles className="w-10 h-10 text-zinc-800" />
                       </div>
                    </div>
                    <div>
                      <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest italic mb-3">{t(lang, 'await_directive')}</p>
                      <p className="text-[11px] text-zinc-700 max-w-[280px] mx-auto italic leading-relaxed">
                        {t(lang, 'await_desc')}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {aiAnalysis[activeTab] && (
                <div className="mt-10 pt-10 border-t border-zinc-900 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.4)]" />
                    <span className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.15em] italic">{t(lang, 'investor_ready')}</span>
                  </div>
                  <button className="px-5 py-2 rounded-xl bg-zinc-900 text-[10px] text-zinc-400 hover:text-white font-bold uppercase tracking-widest italic transition-all">
                    {t(lang, 'export_analysis')}
                  </button>
                </div>
              )}
            </div>

            {/* Strategic Protocol Tips */}
            <div className="p-10 rounded-[40px] bg-zinc-900/40 border border-zinc-800/50">
              <h4 className="text-[11px] font-black text-white uppercase tracking-[0.25em] mb-6 flex items-center gap-3">
                <ChevronRight className="w-4 h-4 text-yellow-500" />
                {t(lang, 'strat_protocol')}
              </h4>
              <ul className="space-y-4">
                {[
                  t(lang, 'tip_1'),
                  t(lang, 'tip_2'),
                  t(lang, 'tip_3')
                ].map((tip, i) => (
                  <li key={i} className="group cursor-default">
                    <div className="flex gap-4">
                      <span className="text-yellow-500 font-black italic text-xs mt-0.5 group-hover:scale-110 transition-transform">0{i+1}</span>
                      <p className="text-xs text-zinc-500 leading-relaxed group-hover:text-zinc-300 transition-colors italic">{tip}</p>
                    </div>
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
