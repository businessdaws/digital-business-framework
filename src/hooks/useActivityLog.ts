import { useState, useEffect } from 'react';
import { supabase, isSupabaseConnected } from '../lib/supabase';
import { ActivityLog } from '../types';

export function useActivityLog() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConnected || !supabase) {
      setIsLoading(false);
      setError('Supabase not configured');
      return;
    }

    async function fetchLogs() {
      try {
        setIsLoading(true);
        const { data, error: sbError } = await supabase!
          .from('activity_log')
          .select('*')
          .eq('business_id', '00000000-0000-0000-0000-000000000001')
          .order('created_at', { ascending: false })
          .limit(10);

        if (sbError) throw sbError;
        setLogs(data || []);
      } catch (err: any) {
        console.error('Error fetching activity logs:', err);
        setError(err.message || 'Failed to connect');
      } finally {
        setIsLoading(false);
      }
    }

    fetchLogs();
  }, []);

  return { logs, isLoading, error };
}
