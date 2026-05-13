import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieChartIcon, 
  Target, 
  Users, 
  Sparkles,
  ChevronLeft,
  ArrowUpRight,
  BrainCircuit,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { cn } from '../lib/utils';
import { getManagerialInsights } from '../services/geminiService';

const pnlData = [
  { month: 'Jan', profit: 4000, loss: 2400 },
  { month: 'Feb', profit: 3000, loss: 1398 },
  { month: 'Mar', profit: 2000, loss: 9800 },
  { month: 'Apr', profit: 2780, loss: 3908 },
  { month: 'May', profit: 1890, loss: 4800 },
  { month: 'Jun', profit: 2390, loss: 3800 },
  { month: 'Jul', profit: 3490, loss: 4300 },
  { month: 'Aug', profit: 4000, loss: 2400 },
  { month: 'Sep', profit: 3000, loss: 1398 },
  { month: 'Oct', profit: 5000, loss: 3800 },
  { month: 'Nov', profit: 6780, loss: 3908 },
  { month: 'Dec', profit: 8890, loss: 4800 },
];

const assetData = [
  { name: 'Cash', value: 400 },
  { name: 'Crypto', value: 300 },
  { name: 'Stocks', value: 300 },
];

const COLORS = ['#FACC15', '#3B82F6', '#10B981'];

export default function ExecutionFinance() {
  const [showAI, setShowAI] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    if (!insights) {
      setLoading(true);
      const text = await getManagerialInsights({ pnlData, assetData });
      setInsights(text);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <section>
        <h1 className="text-4xl font-bold tracking-tight uppercase italic mb-2">Execution & <span className="text-brand-blue">Finance</span></h1>
        <p className="text-zinc-500 text-lg italic max-w-2xl">High-precision fiscal monitoring and performance engineering module.</p>
      </section>

      {/* KPI SCORECARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'CAC (Acquisition)', value: '$124.50', trend: '+2.4%', icon: Users, color: 'brand-blue' },
          { label: 'LTV (Lifetime Value)', value: '$1,840', trend: '+15.2%', icon: Target, color: 'brand-yellow' },
          { label: 'ROI (Investment)', value: '4.8x', trend: '+0.4x', icon: TrendingUp, color: 'brand-blue' },
        ].map((kpi, i) => (
          <div key={i} className="p-8 rounded-[32px] glass-card relative overflow-hidden group">
            <div className={cn("absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity", `text-${kpi.color}`)}>
              <kpi.icon className="w-24 h-24" />
            </div>
            <p className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase mb-2">{kpi.label}</p>
            <div className="flex items-baseline gap-3">
              <h3 className="text-3xl font-bold tracking-tighter tabular-nums">{kpi.value}</h3>
              <span className="text-green-500 text-xs font-mono">{kpi.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* PROFIT VS LOSS AREA CHART */}
        <div className="lg:col-span-2 p-8 rounded-[40px] glass-card space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold uppercase italic flex items-center gap-3">
              <div className="w-1.5 h-6 bg-brand-blue rounded-full" />
              Profit vs Loss Suite
            </h2>
            <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-500 tracking-widest uppercase">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-brand-blue" /> Profit</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-brand-yellow" /> Loss</div>
            </div>
          </div>
          
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pnlData}>
                <defs>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FACC15" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FACC15" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#52525b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="#52525b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#3B82F6" 
                  fillOpacity={1} 
                  fill="url(#colorProfit)" 
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="loss" 
                  stroke="#FACC15" 
                  fillOpacity={1} 
                  fill="url(#colorLoss)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ASSET ALLOCATION PIE CHART */}
        <div className="p-8 rounded-[40px] glass-card flex flex-col">
          <h2 className="text-xl font-bold uppercase italic flex items-center gap-3 mb-8">
            <div className="w-1.5 h-6 bg-brand-yellow rounded-full" />
            Asset Allocation
          </h2>
          
          <div className="flex-1 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assetData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {assetData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            {assetData.map((asset, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-sm font-medium text-zinc-400">{asset.name}</span>
                </div>
                <span className="text-sm font-bold tabular-nums">{(asset.value / 10).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI MANAGERIAL INSIGHTS */}
      <section className="p-10 rounded-[40px] bg-zinc-900 border border-zinc-800 glow-blue relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8">
          <BrainCircuit className="w-32 h-32 text-brand-blue/5" />
        </div>

        <div className="flex items-center justify-between mb-8 relative z-10">
          <div>
            <h2 className="text-2xl font-bold uppercase italic tracking-tight flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-brand-blue" />
              Managerial Intelligence
            </h2>
            <p className="text-zinc-500 text-sm mt-1 italic">Real-time performance synthesis powered by Davsplace AI.</p>
          </div>
          
          <button 
            onClick={() => {
              setShowAI(!showAI);
              if (!showAI) fetchInsights();
            }}
            className={cn(
              "px-6 py-3 rounded-2xl font-bold uppercase italic tracking-tight transition-all flex items-center gap-2",
              showAI ? "bg-zinc-800 text-brand-blue border border-brand-blue/20" : "bg-brand-blue text-white"
            )}
          >
            {showAI ? 'Hide Analysis' : 'Activate Insight'}
            {!showAI && <ArrowUpRight className="w-4 h-4" />}
          </button>
        </div>

        <AnimatePresence>
          {showAI && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden relative z-10"
            >
              <div className="pt-8 border-t border-zinc-800">
                {loading ? (
                  <div className="flex items-center gap-3 text-zinc-500 font-medium italic">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Synthesizing financial datasets...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     {insights?.split('\n').filter(l => l.trim()).map((insight, idx) => (
                       <div key={idx} className="p-6 rounded-2xl bg-zinc-950/50 border border-zinc-800/50">
                         <p className="text-zinc-300 text-sm italic leading-relaxed">
                           {insight.replace('• ', '').replace('- ', '')}
                         </p>
                       </div>
                     ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
