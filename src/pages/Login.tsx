import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Building2, LogIn, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Check if already logged in → redirect
  useEffect(() => {
    supabase?.auth.getSession().then(({ data }) => {
      if (data.session) navigate('/');
    });
  }, [navigate]);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password || !supabase) return;
    
    setLoading(true);
    setError(false);
    
    const { error: sbError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });
    
    if (sbError) {
      console.error('Login error:', sbError);
      setError(true);
      setLoading(false);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 selection:bg-brand-yellow/30 selection:text-brand-yellow">
      <div className="w-full max-w-[420px] bg-zinc-900 border border-zinc-800 rounded-[32px] p-10 shadow-2xl relative overflow-hidden group">
        {/* Ambient glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-yellow/5 blur-[100px] rounded-full group-hover:bg-brand-yellow/10 transition-colors duration-700" />
        
        <div className="flex flex-col items-center text-center space-y-4 mb-10">
          <div className="w-12 h-12 bg-brand-yellow rounded-2xl flex items-center justify-center shadow-lg shadow-brand-yellow/20">
            <Building2 className="text-zinc-950 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-[0.2em] text-white uppercase italic">DAVSPLACE</h1>
            <p className="text-xs text-zinc-500 font-bold tracking-widest uppercase italic mt-1">Digital Framework</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block ml-1">
              Email Address
            </label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white placeholder:text-zinc-700 focus:outline-none focus:border-brand-yellow/50 focus:ring-1 focus:ring-brand-yellow/20 transition-all duration-300"
              placeholder="owner@davsplace.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block ml-1">
              Password
            </label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white placeholder:text-zinc-700 focus:outline-none focus:border-brand-yellow/50 focus:ring-1 focus:ring-brand-yellow/20 transition-all duration-300"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-brand-yellow text-zinc-950 font-black rounded-2xl py-5 uppercase italic tracking-wider hover:bg-yellow-400 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:active:scale-100 shadow-lg shadow-brand-yellow/10"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Authenticate</span>
              </>
            )}
          </button>

          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm text-center italic font-medium"
            >
              Invalid credentials. Contact your administrator.
            </motion.p>
          )}
        </form>

        <div className="mt-10 pt-8 border-t border-zinc-800/50 text-center">
          <p className="text-[10px] text-zinc-600 font-bold tracking-[0.2em] uppercase">
            Access restricted to Davsplace Studio team
          </p>
        </div>
      </div>
    </div>
  );
}
