import * as Sentry from '@sentry/react';

const DEFAULT_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS || 15000);

const parseJsonSafely = async (response) => {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};

export const buildUrl = (baseUrl, path = '', queryParams = {}) => {
  const url = new URL(`${baseUrl}${path}`);

  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
};

export const apiFetch = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const headers = {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
      signal: options.signal || controller.signal,
    });

    const data = await parseJsonSafely(response);
    return { response, data };
  } catch (error) {
    Sentry.captureException(error);
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
};
