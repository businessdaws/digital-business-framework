import { useState, useEffect } from 'react';
import { supabase, isSupabaseConnected } from '../lib/supabase';
import { ModuleProgress } from '../types';

export function useModuleProgress() {
  const [modules, setModules] = useState<ModuleProgress[]>([]);
  const [globalProgress, setGlobalProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConnected || !supabase) {
      setGlobalProgress(0);
      setIsLoading(false);
      setError('Supabase not configured');
      return;
    }

    async function fetchProgress() {
      try {
        setIsLoading(true);
        const { data, error: sbError } = await supabase!
          .from('module_progress')
          .select('*')
          .eq('business_id', '00000000-0000-0000-0000-000000000001');

        if (sbError) throw sbError;

        if (data) {
          setModules(data);
          
          const totalCompleted = data.reduce((acc, curr) => acc + (curr.completed || 0), 0);
          const totalTasks = data.reduce((acc, curr) => acc + (curr.total || 0), 0);
          
          if (totalTasks > 0) {
            setGlobalProgress(Math.round((totalCompleted / totalTasks) * 100));
          } else {
            setGlobalProgress(0);
          }
        }
      } catch (err: any) {
        console.error('Error fetching module progress:', err);
        setError(err.message || 'Failed to connect to Supabase');
      } finally {
        setIsLoading(false);
      }
    }

    fetchProgress();
  }, []);

  return { modules, globalProgress, isLoading, error };
}
