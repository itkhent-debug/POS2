export function apiFetch(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: { ...options.headers, "ngrok-skip-browser-warning": "true" },
  });
}
