import { Route, Routes } from "react-router-dom";

import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import CVBuilder from "./CVBuilder";
import CoverLetter from "./CoverLetter";
import Interview from "./Interview";
import History from "./History";
import Profile from "./Profile";
import Settings from "./Settings";

import ProtectedRoute from "../components/ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      {/* =========================
          PUBLIC ROUTES
      ========================= */}

      <Route path="/" element={<Login />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      {/* =========================
          PROTECTED ROUTES
      ========================= */}

      <Route element={<ProtectedRoute />}>
        <Route path="/index" element={<Dashboard />} />

        <Route path="/cv-builder" element={<CVBuilder />} />

        <Route path="/cover-letter" element={<CoverLetter />} />

        <Route path="/interview" element={<Interview />} />

        <Route path="/history" element={<History />} />

        <Route path="/profile" element={<Profile />} />

        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
