import { useState, useEffect, useCallback } from 'react';
import { api, getWebSocketUrl } from '@/lib/api';

export function usePoll(pollId) {
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socketStatus, setSocketStatus] = useState('connecting');

  const fetchPoll = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get(`/polls/${pollId}`);
      setPoll(data.data);
      setError(null);
    } catch (err) {
      setError(err.detail || 'Failed to fetch poll');
      if (err.status === 404) {
        setError('Poll not found');
      }
    } finally {
      setLoading(false);
    }
  }, [pollId]);

  useEffect(() => {
    if (!pollId) return;

    fetchPoll();

    const wsUrl = getWebSocketUrl(pollId);
    let socket;
    let reconnectTimeout;

    const connect = () => {
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        setSocketStatus('connected');
        console.log('WebSocket connected');
      };

      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'poll_update') {
          setPoll(message.data);
        }
      };

      socket.onclose = () => {
        setSocketStatus('disconnected');
        console.log('WebSocket disconnected, retrying...');
        reconnectTimeout = setTimeout(connect, 3000);
      };

      socket.onerror = (err) => {
        console.error('WebSocket error:', err);
        socket.close();
      };
    };

    connect();

    return () => {
      if (socket) socket.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [pollId, fetchPoll]);

  const castVote = async (optionId) => {
    try {
      const data = await api.post(`/polls/${pollId}/votes`, { option_id: optionId });
      setPoll(data.data);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.detail || 'Failed to cast vote', status: err.status };
    }
  };

  return { poll, loading, error, socketStatus, castVote, refresh: fetchPoll };
}
