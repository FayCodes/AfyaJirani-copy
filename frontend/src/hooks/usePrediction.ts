import { useEffect, useState } from 'react';

export function usePrediction({ disease, daysFromNow, range }: { disease: string, daysFromNow?: number, range?: number }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!disease || (!daysFromNow && !range)) return;
    setLoading(true);
    setError(null);
    setData(null);
    const params = new URLSearchParams();
    params.append('disease', disease);
    if (daysFromNow !== undefined) params.append('days_from_now', String(daysFromNow));
    if (range !== undefined) params.append('range', String(range));
    fetch(`http://localhost:8000/predict?${params.toString()}`)
      .then(res => {
        if (!res.ok) throw new Error('Prediction API error');
        return res.json();
      })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [disease, daysFromNow, range]);

  return { loading, error, data };
} 