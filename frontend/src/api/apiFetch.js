const API_BASE = import.meta.env.VITE_API_BASE_URL;
const OWNER_KEY_STORAGE = "mindlap_owner_key";

function captureOwnerKeyFromUrl() {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  const ownerKey = url.searchParams.get("owner_key");
  if (!ownerKey) return;

  localStorage.setItem(OWNER_KEY_STORAGE, ownerKey);
  url.searchParams.delete("owner_key");
  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}

function getOwnerKey() {
  if (typeof localStorage === "undefined") return "";
  return localStorage.getItem(OWNER_KEY_STORAGE) || "";
}

captureOwnerKeyFromUrl();

export async function apiFetch(path, options = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const headers = new Headers(options.headers || {});
  const ownerKey = getOwnerKey();

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (ownerKey && !headers.has("X-Mindlap-Owner-Key")) {
    headers.set("X-Mindlap-Owner-Key", ownerKey);
  }

  return fetch(url, { ...options, headers });
}
