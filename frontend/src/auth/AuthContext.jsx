import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch, tokenStore } from "../api/apiFetch";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const store = useMemo(() => tokenStore(), []);
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  async function loadMe() {
    const access = store.getAccess();
    if (!access) {
      setUser(null);
      setReady(true);
      return;
    }
    const res = await apiFetch("/me/", { method: "GET" }, { auth: true });
    if (!res.ok) {
      setUser(null);
      setReady(true);
      return;
    }
    setUser(await res.json());
    setReady(true);
  }

  useEffect(() => { loadMe(); }, []);

  async function login(username, password) {
    const res = await apiFetch(
      "/auth/token/",
      { method: "POST", body: JSON.stringify({ username, password }) },
      { auth: false }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.detail || "Login failed");
    }
    const tokens = await res.json();
    store.setTokens(tokens);
    await loadMe();
  }

  function logout() {
    store.clearTokens();
    setUser(null);
  }

  return (
    <AuthCtx.Provider value={{ user, ready, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}