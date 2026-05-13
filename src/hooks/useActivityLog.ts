import { useState, useEffect } from 'react';
import { supabase, isSupabaseConnected } from '../lib/supabase';
import { ActivityLog } from '../types';

export function useActivityLog() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (!isSupabaseConnected || !supabase) {
      setIsLoading(false);
      setIsOffline(true);
      return;
    }

    let isMounted = true;

    async function fetchLogs() {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('TIMEOUT')), 5000)
      );

      try {
        setIsLoading(true);
        const { data, error: sbError } = await Promise.race([
          supabase!
            .from('activity_log')
            .select('*')
            .eq('business_id', '00000000-0000-0000-0000-000000000001')
            .order('created_at', { ascending: false })
            .limit(10),
          timeoutPromise
        ]) as any;

        if (!isMounted) return;

        if (sbError) throw sbError;
        setLogs(data || []);
        setIsOffline(false);
      } catch (err: any) {
        if (!isMounted) return;
        console.error('Activity Log Fetch Error:', err);
        setError(err.message === 'TIMEOUT' ? 'Connection timed out' : err.message);
        setIsOffline(true);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchLogs();
    return () => { isMounted = false; };
  }, []);

  return { logs, isLoading, error, isOffline };
}
