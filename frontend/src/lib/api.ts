const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface GeneratePollResponse {
  question: string;
  options: string[];
}

export async function generatePoll(prompt: string): Promise<{ data: GeneratePollResponse }> {
  const response = await fetch(`${API_URL}/api/v1/polls/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    const error = new Error(errorData.detail || errorData.message || 'Failed to generate poll');
    throw error;
  }
  const json = await response.json();
  return { data: json.data };
}

export async function createPoll(data: { question: string; options: string[] }) {
  const response = await fetch(`${API_URL}/api/v1/polls`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    const error = new Error(errorData.message || 'Failed to create poll') as any;
    error.details = errorData.detail;
    throw error;
  }
  return response.json();
}

export async function getPoll(pollId: string) {
  const response = await fetch(`${API_URL}/api/v1/polls/${pollId}`, {
    credentials: 'include',
  });
  if (!response.ok) {
    if (response.status === 404) throw new Error('Poll not found');
    throw new Error('Failed to fetch poll');
  }
  return response.json();
}

export async function castVote(pollId: string, optionId: string) {
  const response = await fetch(`${API_URL}/api/v1/polls/${pollId}/votes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ option_id: optionId }),
    credentials: 'include',
  });
  
  if (!response.ok) {
    const error = await response.json();
    if (response.status === 400) throw new Error('You have already voted.');
    throw new Error(error.detail || 'Failed to cast vote');
  }
  return response.json();
}

export function getWebSocketResponse(pollId: string) {
  const wsUrl = API_URL.replace(/^http/, 'ws');
  return new WebSocket(`${wsUrl}/api/v1/ws/polls/${pollId}`);
}
