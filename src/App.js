import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HomePage, LoginPage, RegisterPage, RecoverPasswordPage, DashboardLayout, EmailVerifiedPage, LegalContentLayout, ContactPage, AboutPage, DashboardHomePage, AllAreasPage, AreaDetailPage, AllHabitsPage } from "./exports";
import "./styles/index.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/recover-password" element={<RecoverPasswordPage />} />
        <Route path="/email-verified" element={<EmailVerifiedPage />} />
        <Route path="/policy" element={<LegalContentLayout content="policy" />} />
        <Route path="/terms" element={<LegalContentLayout content="terms" />} />

        <Route path="/dashboard" element={<DashboardLayout />} >
          <Route index element={<DashboardHomePage />} />
          <Route path="areas" element={<AllAreasPage />} />
          <Route path="areas/:areaId" element={<AreaDetailPage />} />
          <Route path="habits" element={<AllHabitsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;