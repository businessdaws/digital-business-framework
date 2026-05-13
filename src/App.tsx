import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ModulePage from './pages/ModulePage';
import ExecutionFinance from './pages/ExecutionFinance';
import Investors from './pages/Investors';
import Login from './pages/Login';
import IdeationPage from './pages/IdeationPage';
import { supabase, isSupabaseConnected } from './lib/supabase';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(undefined);

  useEffect(() => {
    if (!isSupabaseConnected || !supabase) {
      // Offline mode — allow access without auth
      setSession(null);
      return;
    }
    
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_, sess) => setSession(sess)
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // Still checking
  if (session === undefined) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 bg-brand-yellow rounded-xl animate-pulse" />
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] italic">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Not logged in AND Supabase is connected → go to login
  if (!session && isSupabaseConnected) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="/execution" element={<ExecutionFinance />} />
          <Route path="/investors" element={<Investors />} />
          <Route path="/ideation" element={<IdeationPage />} />
          <Route path="/:id" element={<ModulePage />} />
        </Route>
      </Routes>
    </Router>
  );
}

