import { render, screen } from "@testing-library/react";
import App from "./App";

jest.mock("./App/AppRoutes", () => ({
  AppRoutes: () => <div>Mocked AppRoutes</div>,
}));

describe("App Component", () => {
  it("renders AppRoutes inside a Router", () => {
    render(<App />);
    expect(screen.getByText("Mocked AppRoutes")).toBeInTheDocument();
  });
});
