import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import AuthCallback from "./pages/AuthCallback.tsx";
import Dashboard from "./pages/Dashboard";
import WrappedStory from "./pages/WrappedStory.tsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/dashboard" element={<WrappedStory />} />
      <Route path="/lastdashboard" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
