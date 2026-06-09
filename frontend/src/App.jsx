import React from "react";
import { Routes, Route } from "react-router-dom";
import Triggers from "./pages/Triggers";
import Anchors from "./pages/Anchors";
import LogEpisode from "./pages/LogEpisode";
import History from "./pages/History";
import SOS from "./pages/SOS";
import Checkins from "./pages/Checkins";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Triggers />} />
      <Route path="/anchors" element={<Anchors />} />
      <Route path="/log" element={<LogEpisode />} />
      <Route path="/checkins" element={<Checkins />} />
      <Route path="/history" element={<History />} />
      <Route path="/sos" element={<SOS />} />

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
