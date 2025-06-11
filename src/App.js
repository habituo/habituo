import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home, Login, Register, RecoverPassword, Dashboard, EmailVerified, LegalContent, Contact, About } from "./routes/index";
import "./styles/index.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/inicio" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/recover-password" element={<RecoverPassword />} />
        <Route path="/email-verified" element={<EmailVerified />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/all-areas" element={<Dashboard />} />
        <Route path="/dashboard/all-habits" element={<Dashboard />} />
        <Route path="/dashboard/areas/:areaId" element={<Dashboard />} />
        <Route path="/policy" element={<LegalContent content="policy" />} />
        <Route path="/terms" element={<LegalContent content="terms" />} />
      </Routes>
    </Router>
  );
}

export default App;