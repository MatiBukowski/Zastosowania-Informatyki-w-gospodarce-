import { useState, useEffect } from 'react';

import { resolveTableByToken } from '@/services/api/TablesAPI';
import { ITable } from '@/services/interfaces/interfaces';

export function useResolveTableByToken(token: string) {
  const [table, setTable] = useState<ITable | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setTable(null);
      setLoading(false);
      setError(null);
      return;
    }

    setTable(null);
    setError(null);
    setLoading(true);
    resolveTableByToken(token)
      .then(data => {
        setTable(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('useResolveTableByToken - error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [token]);

  return { table, loading, error };
}