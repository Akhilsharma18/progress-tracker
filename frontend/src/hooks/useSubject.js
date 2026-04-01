import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

export function useSubject(id) {
  const [subject, setSubject] = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubject = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [subjectRes, progressRes] = await Promise.all([
        api.get(`/api/subjects/${id}`),
        api.get(`/api/progress/${id}`),
      ]);
      setSubject(subjectRes.data);
      setProgress(progressRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load subject');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSubject();
  }, [fetchSubject]);

  return { subject, progress, loading, error, refetch: fetchSubject, setSubject, setProgress };
}
