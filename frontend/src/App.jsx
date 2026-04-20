import React from "react";
import { Routes, Route } from "react-router-dom";
import RequireAuth from "./auth/RequireAuth";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Triggers from "./pages/Triggers";
import LogEpisode from "./pages/LogEpisode";
import History from "./pages/History";
import SOS from "./pages/SOS";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/" element={<RequireAuth><Triggers /></RequireAuth>} />
      <Route path="/log" element={<RequireAuth><LogEpisode /></RequireAuth>} />
      <Route path="/history" element={<RequireAuth><History /></RequireAuth>} />
      <Route path="/sos" element={<RequireAuth><SOS /></RequireAuth>} />

      <Route
        path="*"
        element={
          <div className="min-h-screen grid place-items-center font-display text-4xl text-[rgb(var(--muted))]">
            404
          </div>
        }
      />
    </Routes>
  );
}
