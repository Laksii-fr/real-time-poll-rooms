export interface Option {
  id: string;
  text: string;
  vote_count: number;
}

export interface Poll {
  id: string;
  question: string;
  options: Option[];
}

export interface CreatePollRequest {
  question: string;
  options: string[];
}

export interface GeneratedPoll {
  question: string;
  options: string[];
}

export interface ApiResponse<T> {
  status: string;
  message?: string;
  data: T;
}

export interface VoteRequest {
  option_id: string;
}
