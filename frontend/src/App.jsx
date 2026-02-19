import React from "react";
import { Routes, Route } from "react-router-dom";
import RequireAuth from "./auth/RequireAuth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Checkins from "./pages/Checkins.jsx";
import Sessions from "./pages/Sessions";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />

      <Route
        path="/checkins"
        element={
          <RequireAuth>
            <Checkins />
          </RequireAuth>
        }
      />

      <Route
        path="/sessions"
        element={
          <RequireAuth>
            <Sessions />
          </RequireAuth>
        }
      />

      <Route path="*" element={<div className="min-h-screen grid place-items-center">404</div>} />
    </Routes>
  );
}