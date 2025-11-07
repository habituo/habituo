import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppRoutes } from "./AppRoutes";

jest.mock("../exports", () => {
    const PropTypes = require("prop-types");
    const { Outlet } = require("react-router-dom");

    // Define the mock component for LegalContentLayout
    const LegalContentLayoutMock = ({ content }) => <div>Legal Content: {content}</div>;

    // Attach PropTypes directly to the mock component function
    LegalContentLayoutMock.propTypes = {
        content: PropTypes.string.isRequired,
    };

    // Define the mock component for DashboardLayout
    const DashboardLayoutMock = ({ children }) => (
        <div>
            Dashboard Layout
            <Outlet />
        </div>
    );

    // Attach PropTypes directly to the mock component function
    DashboardLayoutMock.propTypes = {
        children: PropTypes.node,
    };

    return {
        HomePage: () => <div>Home Page</div>,
        LoginPage: () => <div>Login Page</div>,
        RegisterPage: () => <div>Register Page</div>,
        RecoverPasswordPage: () => <div>Recover Password Page</div>,
        EmailVerifiedPage: () => <div>Email Verified Page</div>,
        ContactPage: () => <div>Contact Page</div>,
        AboutPage: () => <div>About Page</div>,
        LegalContentLayout: LegalContentLayoutMock,
        DashboardLayout: DashboardLayoutMock,
        DashboardHomePage: () => <div>Dashboard Home Page</div>,
        AllAreasPage: () => <div>All Areas Page</div>,
        AreaDetailPage: () => <div>Area Detail Page</div>,
        AllHabitsPage: () => <div>All Habits Page</div>,
        NotFoundPage: () => <div>404 - Page Not Found</div>,
    };
});

describe("AppRoutes", () => {
    const renderRoute = (path) =>
        render(
            <MemoryRouter initialEntries={[path]}>
                <AppRoutes />
            </MemoryRouter>
        );

    // Public pages
    it.each([
        ["/", "Home Page"],
        ["/home", "Home Page"],
        ["/about", "About Page"],
        ["/contact", "Contact Page"],
    ])("renders %s showing '%s'", (path, expectedText) => {
        renderRoute(path);
        expect(screen.getByText(expectedText)).toBeInTheDocument();
    });

    // Auth pages
    it.each([
        ["/login", "Login Page"],
        ["/register", "Register Page"],
        ["/recover-password", "Recover Password Page"],
        ["/email-verified", "Email Verified Page"],
    ])("renders %s showing '%s'", (path, expectedText) => {
        renderRoute(path);
        expect(screen.getByText(expectedText)).toBeInTheDocument();
    });

    // Legal pages
    it.each([
        ["/policy", "policy"],
        ["/terms", "terms"],
    ])("renders %s passing content '%s'", (path, contentProp) => {
        renderRoute(path);
        // Expects the mocked LegalContentLayout output
        expect(screen.getByText(`Legal Content: ${contentProp}`)).toBeInTheDocument();
    });

    // Dashboard pages
    const dashboardRoutes = [
        ["/dashboard", "Dashboard Home Page"],
        ["/dashboard/areas", "All Areas Page"],
        ["/dashboard/areas/123", "Area Detail Page"],
        ["/dashboard/habits", "All Habits Page"],
    ];

    it.each(dashboardRoutes)("renders %s showing the Dashboard Layout and the correct content ('%s')", (path, expectedContent) => {
        renderRoute(path);
        expect(screen.getByText("Dashboard Layout")).toBeInTheDocument();
        expect(screen.getByText(expectedContent)).toBeInTheDocument();
    });

    // 404 fallback
    it("renders 404 page for unknown routes", () => {
        renderRoute("/unknown-route");
        expect(screen.getByText("404 - Page Not Found")).toBeInTheDocument();
    });
});
