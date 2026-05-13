import { motion } from 'motion/react';
import { 
  Users, 
  Search, 
  Plus, 
  ExternalLink, 
  Mail, 
  MapPin, 
  Briefcase,
  ChevronRight,
  Filter,
  DollarSign
} from 'lucide-react';
import { cn } from '../lib/utils';

const investors = [
  {
    name: "Aether Ventures",
    lead: "Sarah Chen",
    type: "VC / Series A",
    focus: "SaaS & AI",
    status: "Due Diligence",
    location: "Singapore",
    ticket: "$2M - $5M",
    score: 92
  },
  {
    name: "Nebula Capital",
    lead: "Marcus Thorne",
    type: "Private Equity",
    focus: "Digital Infrastructure",
    status: "Initial Pitch",
    location: "London",
    ticket: "$10M+",
    score: 85
  },
  {
    name: "Growth Catalyst Fund",
    lead: "Elena Rodriguez",
    type: "Angel Syndicate",
    focus: "High-Growth Startups",
    status: "Closed / Partner",
    location: "Miami",
    ticket: "$500K - $1M",
    score: 98
  },
  {
    name: "Zenith Holdings",
    lead: "David Park",
    type: "Strategic Corporate",
    focus: "Fintech",
    status: "Pipeline",
    location: "Seoul",
    ticket: "Strategic",
    score: 74
  }
];

export default function Investors() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight uppercase italic mb-2">Investor <span className="text-brand-blue">Target List</span></h1>
          <p className="text-zinc-500 text-lg italic max-w-2xl">Manage high-level capital relations and fundraising intelligence.</p>
        </div>
        <button className="bg-brand-blue text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-brand-blue/90 transition-all shadow-lg shadow-brand-blue/20 uppercase italic tracking-tight">
          <Plus className="w-4 h-4" /> Add Investor Profile
        </button>
      </section>

      {/* Stats Cluster */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Pipeline', value: '$45.2M', icon: DollarSign },
          { label: 'Active Leads', value: '12', icon: Users },
          { label: 'Conversion Rate', value: '18.4%', icon: Briefcase },
          { label: 'Average Score', value: '84/100', icon: MapPin },
        ].map((stat, i) => (
          <div key={i} className="p-6 rounded-[24px] glass-card">
            <p className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase mb-2">{stat.label}</p>
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold tracking-tight">{stat.value}</h3>
              <stat.icon className="w-4 h-4 text-brand-blue/50" />
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input 
            type="text" 
            placeholder="Search investors, sectors, or leaders..."
            className="w-full bg-zinc-900/50 border border-zinc-800/50 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-brand-blue/50 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <button className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold uppercase tracking-tight flex items-center gap-2 shrink-0">
            <Filter className="w-3 h-3" /> Filter: All Status
          </button>
          {['VC', 'Angel', 'Strategic', 'PE'].map(type => (
            <button key={type} className="px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-500 text-xs font-bold uppercase tracking-tight hover:text-white hover:border-zinc-700 transition-all shrink-0">
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Investor List Table-Style Grid */}
      <div className="space-y-4">
        {investors.map((investor, idx) => (
          <motion.div
            key={investor.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group p-6 rounded-[32px] glass-card glass-hover flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-brand-blue/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-zinc-950 flex items-center justify-center font-bold text-2xl text-brand-blue border border-zinc-800 group-hover:border-brand-blue/30 transition-all">
                {investor.name[0]}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-xl font-bold tracking-tight">{investor.name}</h3>
                  <span className={cn(
                    "text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest",
                    investor.status === 'Closed / Partner' ? "bg-green-500/10 text-green-500" : "bg-brand-blue/10 text-brand-blue"
                  )}>
                    {investor.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-zinc-500 italic">
                  <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {investor.lead}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {investor.location}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:flex items-center gap-8 w-full md:w-auto">
              <div>
                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Focus Area</p>
                <p className="text-sm font-medium">{investor.focus}</p>
              </div>
              <div className="text-right md:text-left">
                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Avg Ticket</p>
                <p className="text-sm font-bold text-zinc-300">{investor.ticket}</p>
              </div>
              <div className="hidden md:block">
                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Match Score</p>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1 bg-zinc-800 rounded-full overflow-hidden shrink-0">
                    <div 
                      className="h-full bg-brand-yellow" 
                      style={{ width: `${investor.score}%` }} 
                    />
                  </div>
                  <span className="text-xs font-bold">{investor.score}%</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all">
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-brand-blue hover:bg-brand-blue/5 transition-all">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Strategic Insight Footer */}
      <div className="p-10 rounded-[40px] bg-brand-yellow/5 border border-brand-yellow/20 relative overflow-hidden">
        <h3 className="text-xl font-bold uppercase italic text-brand-yellow mb-2 tracking-tight">Fundraising Intelligence</h3>
        <p className="text-zinc-400 text-sm italic max-w-3xl leading-relaxed">
          AI Analysis suggests focusing on <span className="text-white font-bold">Growth Catalyst Fund</span>. Their recent exit in the digital infrastructure space matches our Series A trajectory perfectly. Engagement score is prime at 98%.
        </p>
      </div>
    </div>
  );
}
