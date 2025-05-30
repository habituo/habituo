import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home, Login, Register, RecoverPassword, Dashboard, EmailVerified } from "./routes/index";
import "./styles/index.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas principales */}
        <Route path="/" element={<Home />} />
        <Route path="/inicio" element={<Home />} />

        {/* Rutas de autenticación */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/recover-password" element={<RecoverPassword />} />
        <Route path="/email-verified" element={<EmailVerified />} />

        {/* Rutas de Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/all-areas" element={<Dashboard />} />
        <Route path="/dashboard/all-habits" element={<Dashboard />} />

        {/* Rutas con parámetros dinámicos para las áreas */}
        <Route path="/dashboard/areas/:areaId" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;