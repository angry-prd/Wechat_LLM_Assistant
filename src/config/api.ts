const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const API_ENDPOINTS = {
  articles: `${API_BASE_URL}/articles`,
  generate: `${API_BASE_URL}/articles/generate`,
  publish: `${API_BASE_URL}/articles/publish`,
}; 