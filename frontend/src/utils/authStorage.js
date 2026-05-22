const AUTH_TOKEN_KEY = 'authToken';

export const getStoredToken = () => localStorage.getItem(AUTH_TOKEN_KEY);

export const setStoredToken = (token) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

export const removeStoredToken = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
};
