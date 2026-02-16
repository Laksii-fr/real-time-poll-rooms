const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

export const api = {
  async get(endpoint) {
    const response = await fetch(`${API_URL}${endpoint}`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Network error' }));
      throw { status: response.status, ...error };
    }
    return response.json();
  },

  async post(endpoint, data) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Network error' }));
      throw { status: response.status, ...error };
    }
    return response.json();
  },
};

export const getWebSocketUrl = (pollId) => {
  const wsBase = API_URL.replace('http', 'ws');
  return `${wsBase}/ws/polls/${pollId}`;
};
