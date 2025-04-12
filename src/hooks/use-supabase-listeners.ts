
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useRealtimeSubscription(tableName: string, event: 'INSERT' | 'UPDATE' | 'DELETE' | '*' = '*', filter?: string, callback?: (payload: any) => void) {
  useEffect(() => {
    // Enable realtime for this table if it's not already enabled
    supabase
      .rpc('supabase_realtime.enable_messages_table_for_realtime')
      .then(({ error }) => {
        if (error) {
          console.error('Error enabling realtime:', error);
        }
      });

    // Create subscription
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
