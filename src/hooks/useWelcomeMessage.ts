// src/hooks/useWelcomeMessage.ts
import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';

export function useWelcomeMessage() {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api.get('/')
      .then((res) => {
        setMessage(res.data.message);
      })
      .catch((err) => {
  const msg = err.response?.data?.detail || err.message || 'Failed to fetch message';
  setError(msg);
})
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { message, loading, error };
}
