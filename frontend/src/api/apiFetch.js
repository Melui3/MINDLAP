const API_BASE = import.meta.env.VITE_API_BASE_URL;

function getAccess() {
  return localStorage.getItem("mindlap_access");
}
function getRefresh() {
  return localStorage.getItem("mindlap_refresh");
}
function setTokens({ access, refresh }) {
  if (access) localStorage.setItem("mindlap_access", access);
  if (refresh) localStorage.setItem("mindlap_refresh", refresh);
}
function clearTokens() {
  localStorage.removeItem("mindlap_access");
  localStorage.removeItem("mindlap_refresh");
}

async function refreshAccessToken() {
  const refresh = getRefresh();
  if (!refresh) return null;

  const res = await fetch(`${API_BASE}/auth/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  if (data?.access) setTokens({ access: data.access });
  return data?.access ?? null;
}

export async function apiFetch(path, options = {}, { auth = true } = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body) headers.set("Content-Type", "application/json");

  if (auth) {
    const access = getAccess();
    if (access) headers.set("Authorization", `Bearer ${access}`);
  }

  let res = await fetch(url, { ...options, headers });

  if (auth && res.status === 401) {
    const newAccess = await refreshAccessToken();
    if (!newAccess) {
      clearTokens();
      return res;
    }
    headers.set("Authorization", `Bearer ${newAccess}`);
    res = await fetch(url, { ...options, headers });
  }

  return res;
}

export function tokenStore() {
  return { getAccess, getRefresh, setTokens, clearTokens };
}