import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Bell, User } from 'lucide-react';

export default function Layout() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-10">
        <header className="flex items-center justify-between mb-12 relative z-50">
          <div>
            <h2 className="text-xs font-bold tracking-[0.3em] text-zinc-500 uppercase mb-1">Davsplace Ecosystem</h2>
            <p className="text-xl font-bold tracking-tight italic">Framework Administrator</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input 
                type="text" 
                placeholder="Search resources..."
                className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-blue/50 transition-all w-64 backdrop-blur-md"
              />
            </div>
            <div className="flex items-center gap-3 pr-6 border-r border-zinc-800/50">
              <button className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800/50 text-zinc-500 hover:text-brand-blue hover:bg-brand-blue/5 transition-all">
                <Bell className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-800/50 pl-2 pr-4 py-2 rounded-2xl backdrop-blur-md">
              <div className="w-8 h-8 rounded-xl bg-brand-blue flex items-center justify-center shadow-lg shadow-brand-blue/20">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold italic tracking-tight">Studio Editor</span>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
