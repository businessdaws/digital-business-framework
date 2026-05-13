import { useState, useEffect } from 'react';
import { supabase, isSupabaseConnected } from '../lib/supabase';
import { ModuleProgress } from '../types';

const FALLBACK_MODULES: ModuleProgress[] = [
  { module_id: 'ideation', completed: 0, total: 4, business_id: 'fallback' },
  { module_id: 'blueprint', completed: 0, total: 5, business_id: 'fallback' },
  { module_id: 'comms', completed: 0, total: 5, business_id: 'fallback' },
  { module_id: 'execution', completed: 0, total: 4, business_id: 'fallback' },
  { module_id: 'sustainability', completed: 0, total: 3, business_id: 'fallback' },
  { module_id: 'risk', completed: 0, total: 3, business_id: 'fallback' },
];

export function useModuleProgress() {
  const [modules, setModules] = useState<ModuleProgress[]>(FALLBACK_MODULES);
  const [globalProgress, setGlobalProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Debug logs to help identify environment issues
    console.log('Supabase Connection Status:', {
      hasUrl: !!import.meta.env.VITE_SUPABASE_URL,
      isConnected: isSupabaseConnected
    });

    if (!isSupabaseConnected || !supabase) {
      setModules(FALLBACK_MODULES);
      setIsLoading(false);
      setIsOffline(true);
      return;
    }

    let isMounted = true;

    async function fetchProgress() {
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('TIMEOUT')), 5000)
      );

      try {
        setIsLoading(true);
        
        // Race the supabase call against the timeout
        const { data, error: sbError } = await Promise.race([
          supabase!
            .from('module_progress')
            .select('*')
            .eq('business_id', '00000000-0000-0000-0000-000000000001'),
          timeoutPromise
        ]) as any;

        if (!isMounted) return;

        if (sbError) throw sbError;

        if (data && data.length > 0) {
          setModules(data);
          const totalCompleted = data.reduce((acc: number, curr: any) => acc + (curr.completed || 0), 0);
          const totalTasks = data.reduce((acc: number, curr: any) => acc + (curr.total || 0), 0);
          if (totalTasks > 0) {
            setGlobalProgress(Math.round((totalCompleted / totalTasks) * 100));
          }
          setIsOffline(false);
        } else {
          setModules(FALLBACK_MODULES);
          setIsOffline(false);
        }
      } catch (err: any) {
        if (!isMounted) return;
        console.error('Module Progress Fetch Error:', err);
        setError(err.message === 'TIMEOUT' ? 'Connection timed out' : err.message);
        setModules(FALLBACK_MODULES);
        setIsOffline(true);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchProgress();
    return () => { isMounted = false; };
  }, []);

  return { modules, globalProgress, isLoading, error, isOffline };
}
