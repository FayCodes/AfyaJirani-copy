import { useEffect, useState } from 'react';

export function usePrediction({ disease, daysFromNow, range, predict_range }: { disease: string, daysFromNow?: number, range?: number, predict_range?: number }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!disease || (!daysFromNow && !range && !predict_range)) return;
    setLoading(true);
    setError(null);
    setData(null);
    const params = new URLSearchParams();
    params.append('disease', disease);
    if (daysFromNow !== undefined) params.append('days_from_now', String(daysFromNow));
    if (predict_range !== undefined) {
      params.append('predict_range', String(predict_range));
    } else if (range !== undefined) {
      params.append('predict_range', String(range));
    }
    fetch(`${process.env.REACT_APP_API_URL}/predict?${params.toString()}`)
      .then(res => {
        if (!res.ok) throw new Error('Prediction API error');
        return res.json();
      })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [disease, daysFromNow, range, predict_range]);

  return { loading, error, data };
} 