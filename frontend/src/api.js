import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

export function setToken(token) {
  api.defaults.headers.common.Authorization = token
    ? `Bearer ${token}`
    : undefined;
}

export function saveAuth(user, token) {
  if (token) {
    localStorage.setItem('token', token);
    setToken(token);
  }

  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
}

export function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  setToken();
}

export function getAuth() {
  const token = localStorage.getItem('token');
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch (error) {
    user = null;
  }

  if (token) {
    setToken(token);
  }

  return { token, user };
}

export default api;
