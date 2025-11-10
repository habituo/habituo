import { Routes, Route } from "react-router-dom";
import { HomePage, LoginPage, RegisterPage, RecoverPasswordPage, DashboardLayout, EmailVerifiedPage, LegalContentLayout, ContactPage, AboutPage, DashboardHomePage, AllAreasPage, AreaDetailPage, AllHabitsPage } from "../exports";

export const AppRoutes = () => (
    <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Authentication */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/recover-password" element={<RecoverPasswordPage />} />
        <Route path="/email-verified" element={<EmailVerifiedPage />} />

        {/* Legal pages */}
        <Route path="/policy" element={<LegalContentLayout content="policy" />} />
        <Route path="/terms" element={<LegalContentLayout content="terms" />} />

        {/* Dashboard (Protected area) */}
        <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHomePage />} />
            <Route path="areas" element={<AllAreasPage />} />
            <Route path="areas/:areaId" element={<AreaDetailPage />} />
            <Route path="habits" element={<AllHabitsPage />} />
        </Route>

        {/* 404 fallback */}
        <Route
            path="*"
            element={
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", textAlign: "center" }}>
                    <h1>404 - Page Not Found</h1>
                    <p>Sorry, the page you are looking for doesn't exist.</p>
                </div>
            }
        />
    </Routes>
);
