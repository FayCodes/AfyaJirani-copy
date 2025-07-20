import { useEffect, useState } from 'react';

export function useRisk({ location, days = 14 }: { location?: string, days?: number }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setData(null);
    const params = new URLSearchParams();
    if (location) params.append('location', location);
    if (days !== undefined) params.append('days', String(days));
    fetch(`http://localhost:8000/risk?${params.toString()}`)
      .then(res => {
        if (!res.ok) throw new Error('Risk API error');
        return res.json();
      })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [location, days]);

  return { loading, error, data };
} 