import { useEffect, useState } from 'react';

export function usePersonalizedTips({ location }: { location?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setData(null);
    const params = new URLSearchParams();
    if (location) params.append('location', location);
    fetch(`http://localhost:8000/personalized-tips?${params.toString()}`)
      .then(res => {
        if (!res.ok) throw new Error('Personalized Tips API error');
        return res.json();
      })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [location]);

  return { loading, error, data };
} 