import { motion } from 'motion/react';
import { History, CheckCircle2 } from 'lucide-react';
import { ActivityLog } from '../types';

interface ActivityLogFeedProps {
  logs: ActivityLog[];
}

export default function ActivityLogFeed({ logs }: ActivityLogFeedProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold text-zinc-500 tracking-[0.2em] uppercase mb-6 flex items-center gap-2">
        <History className="w-4 h-4" /> System Activity Log
      </h3>
      
      <div className="space-y-3">
        {logs.length > 0 ? logs.map((log, idx) => (
          <motion.div 
            key={log.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex items-start gap-4 p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800/50 group hover:border-brand-blue/30 transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center shrink-0 border border-zinc-800">
              <CheckCircle2 className="w-4 h-4 text-brand-blue" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-zinc-200">
                <span className="text-white">{log.action}</span> in {log.entity}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">{log.user_email}</span>
                <span className="text-[10px] text-zinc-600">•</span>
                <span className="text-[10px] text-zinc-600">{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          </motion.div>
        )) : (
          <p className="text-sm text-zinc-600 italic py-4">No recent activity detected in framework...</p>
        )}
      </div>
    </div>
  );
}
