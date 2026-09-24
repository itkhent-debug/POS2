// Base URL for all n8n webhooks. Override with VITE_N8N_BASE_URL (e.g. in .env) when the n8n host changes.
export const N8N_WEBHOOK_BASE = (
  import.meta.env.VITE_N8N_BASE_URL || "https://n8n.n8nserverhome.dpdns.org"
).replace(/\/+$/, "") + "/webhook";

export function apiFetch(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: { ...options.headers, "ngrok-skip-browser-warning": "true" },
  });
}
