import React, { createContext } from "react";

const AuthCtx = createContext({ ready: true });

export function AuthProvider({ children }) {
  return <AuthCtx.Provider value={{ ready: true }}>{children}</AuthCtx.Provider>;
}
