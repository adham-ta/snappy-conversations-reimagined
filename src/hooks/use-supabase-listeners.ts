
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useRealtimeSubscription(tableName: string, event: 'INSERT' | 'UPDATE' | 'DELETE' | '*' = '*', filter?: string, callback?: (payload: any) => void) {
  useEffect(() => {
    // Create subscription without trying to use the non-existent RPC
    const channel = supabase
      .channel(`${tableName}_changes`)
      .on('postgres_changes', 
        { 
          event: event, 
          schema: 'public', 
          table: tableName,
          filter: filter
        }, 
        (payload) => {
          if (callback) {
            callback(payload);
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableName, event, filter, callback]);
}
