import React, { createContext, useContext } from "react";

const AuthCtx = createContext({ ready: true });

export function AuthProvider({ children }) {
  return <AuthCtx.Provider value={{ ready: true }}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
