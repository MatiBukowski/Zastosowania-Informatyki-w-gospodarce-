import { useState, useEffect } from 'react';

import { resolveTableByToken } from '../api/TablesAPI';
import { ITable } from '@/context/interfaces';

export function useResolveTablesByToken(token: string) {
  const [table, setTable] = useState<ITable | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    resolveTableByToken(token)
      .then(data => {
        setTable(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('useResolveTablesByToken - error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [token]);

  return { table, loading, error };
}