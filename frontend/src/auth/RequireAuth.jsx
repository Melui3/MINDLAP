import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function RequireAuth({ children }) {
  const { user, ready } = useAuth();
  const loc = useLocation();

  if (!ready) {
    return (
      <div className="min-h-screen grid place-items-center bg-[rgb(var(--bg))] text-[rgb(var(--text))]">
        Loading…
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;

  return children;
}