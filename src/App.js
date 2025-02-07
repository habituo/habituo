import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home, Login, Register, RecoverPassword, Dashboard } from "./routes/index";
import "./styles/index.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/inicio" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/recover-password" element={<RecoverPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/all-areas" element={<Dashboard />} />
        <Route path="/dashboard/areas/morning" element={<Dashboard />} />
        <Route path="/dashboard/areas/evening" element={<Dashboard />} />
        <Route path="/dashboard/areas/night" element={<Dashboard />} />
        <Route path="/dashboard/areas/:areaId" element={<Dashboard />} />
        <Route path="/dashboard/all-habits" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;