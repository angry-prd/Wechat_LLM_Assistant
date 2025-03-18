const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

export const API_ENDPOINTS = {
  articles: `${API_BASE_URL}/articles`,
  userConfig: `${API_BASE_URL}/user-config`,
  generate: `${API_BASE_URL}/generate`,
  publish: `${API_BASE_URL}/publish`,
  chatModels: `${API_BASE_URL}/chat-models`,
};