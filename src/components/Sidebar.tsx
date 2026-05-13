import { motion } from 'motion/react';
import { 
  BarChart3, 
  Lightbulb, 
  Map, 
  MessageSquare, 
  Rocket, 
  ShieldAlert, 
  TrendingUp,
  LayoutDashboard,
  Settings,
  HelpCircle,
  ChevronRight,
  Users
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useModuleProgress } from '../hooks/useModuleProgress';
import ProgressBar from './ProgressBar';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Investors', path: '/investors', icon: Users },
  { name: 'Ideation', path: '/ideation', icon: Lightbulb },
  { name: 'Blueprint', path: '/blueprint', icon: Map },
  { name: 'Communication', path: '/communication', icon: MessageSquare },
  { name: 'Execution', path: '/execution', icon: TrendingUp },
  { name: 'Growth', path: '/growth', icon: Rocket },
  { name: 'Risk', path: '/risk', icon: ShieldAlert },
];

export default function Sidebar() {
  const { globalProgress } = useModuleProgress();

  return (
    <aside className="w-64 h-screen bg-zinc-950 border-r border-zinc-800 flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center">
            <BarChart3 className="text-zinc-950 w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white leading-tight">DAVSPLACE</h1>
            <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Digital Framework</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden",
                isActive 
                  ? "text-brand-blue bg-brand-blue/10" 
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900"
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn("w-4 h-4", isActive ? "text-brand-blue" : "group-hover:text-brand-blue")} />
                  <span className="tracking-tight">{item.name}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="sidebar-active"
                      className="absolute left-0 w-1 h-5 bg-brand-blue rounded-full"
                    />
                  )}
                  <ChevronRight className={cn(
                    "ml-auto w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity",
                    isActive && "opacity-100"
                  )} />
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-zinc-800/50 space-y-4">
        <div className="space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-zinc-500 hover:text-brand-blue text-sm font-medium transition-colors">
            <Settings className="w-4 h-4" />
            <span className="tracking-tight">Settings</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-zinc-500 hover:text-brand-blue text-sm font-medium transition-colors">
            <HelpCircle className="w-4 h-4" />
            <span className="tracking-tight">Expert Support</span>
          </button>
        </div>
        
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 glow-blue">
          <p className="text-[10px] text-brand-blue font-bold tracking-widest uppercase mb-2">SYSTEM INTEGRITY</p>
          <ProgressBar progress={globalProgress} variant="blue" />
        </div>
      </div>
    </aside>
  );
}
