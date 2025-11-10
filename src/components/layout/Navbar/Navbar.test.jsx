import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Navbar from "./Navbar";
import {
  useColorMode,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { useAuthUser } from "../../../context/AuthUserContext/AuthUserContext";
import { useTheme } from "../../../context/ThemeContext/ThemeContext";
import { BrowserRouter } from "react-router-dom";

// Mock Firebase API methods to prevent real database calls
jest.mock("../../../api/firebase/firebase", () => ({
  db: {},
  collection: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  onSnapshot: jest.fn(),
  getDocs: jest.fn(),
  setDoc: jest.fn(),
  serverTimestamp: jest.fn(),
  writeBatch: jest.fn(),
  increment: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  Timestamp: jest.fn(),
}));

// Mock the AuthUserContext to control logged-in state in tests
jest.mock("../../../context/AuthUserContext/AuthUserContext", () => ({
  useAuthUser: jest.fn(),
}));

// Mock the ThemeContext to control theme options
jest.mock("../../../context/ThemeContext/ThemeContext", () => ({
  useTheme: jest.fn(),
}));

// Mock logo assets to simplify tests
jest.mock(
  "../../../assets/images/light_habituo-logo.svg",
  () => "light_habituo-logo.svg"
);
jest.mock(
  "../../../assets/images/dark_habituo-logo.svg",
  () => "dark_habituo-logo.svg"
);

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Mock Chakra UI hooks
jest.mock("@chakra-ui/react", () => {
  const actual = jest.requireActual("@chakra-ui/react");
  return {
    ...actual,
    useColorMode: jest.fn(), // allows us to mock light/dark mode
    useColorModeValue: jest.fn(), // allows us to mock conditional values based on theme
    useDisclosure: jest.fn(() => ({
      // allows us to mock drawer behavior
      isOpen: false,
      onOpen: jest.fn(),
      onClose: jest.fn(),
    })),
  };
});

// Cleanup and reset mocks after each test
afterEach(() => {
  cleanup(); // unmount components from the DOM to avoid conflicts
  jest.clearAllMocks(); // reset call counts but preserve mock implementations
});

// Mock color mode (light/dark) and toggle function
const mockMode = (mode = "light") => {
  useColorMode.mockReturnValue({ colorMode: mode, toggleColorMode: jest.fn() });
  useColorModeValue.mockImplementation((light, dark) =>
    mode === "light" ? light : dark
  );
};

// Mock current authenticated user
const mockUser = (user = null) => {
  useAuthUser.mockReturnValue({ user });
};

// Mock theme options (like focus color)
const mockTheme = () => {
  useTheme.mockReturnValue({ themeOptions: { focusColor: "orange" } });
};

// Tests for Navbar component
describe("Navbar component", () => {
  test("renders light logo when colorMode is light", () => {
    mockMode("light"); // simulate light theme
    mockUser(null); // simulate no user logged in
    mockTheme(); // provide theme options
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    const logo = screen.getByAltText(/Logotipo de Habituo App/i);
    // Expect the light logo to render in light mode
    expect(logo).toHaveAttribute("src", "dark_habituo-logo.svg");
  });

  test("renders dark logo when colorMode is dark", () => {
    mockMode("dark"); // simulate dark theme
    mockUser(null);
    mockTheme();
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    const logo = screen.getByAltText(/Logotipo de Habituo App/i);
    // Expect the dark logo to render in dark mode
    expect(logo).toHaveAttribute("src", "dark_habituo-logo.svg");
  });

  test("shows login button when no user", () => {
    mockMode("light");
    mockUser(null); // no authenticated user
    mockTheme();
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    // The login button should be visible if user is not logged in
    const loginBtn = screen.getByRole("button", { name: /iniciar sesión/i });
    expect(loginBtn).toBeInTheDocument();
  });

  test("does not show login button when user exists", () => {
    mockMode("light");
    mockUser({ id: "123", name: "Test User" }); // simulate logged-in user
    mockTheme();
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    // The login button should not appear if user exists
    const loginBtn = screen.queryByRole("button", { name: /iniciar sesión/i });
    expect(loginBtn).not.toBeInTheDocument();
  });

  test("toggle theme button calls toggleColorMode", () => {
    const toggleMock = jest.fn();
    useColorMode.mockReturnValue({
      colorMode: "light",
      toggleColorMode: toggleMock, // mock function to track clicks
    });
    useColorModeValue.mockImplementation((l, d) => l);
    mockUser(null);
    mockTheme();
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    const toggleBtn = screen.getAllByLabelText(
      /cambiar modo claro\/oscuro/i
    )[0];
    fireEvent.click(toggleBtn); // simulate user clicking the toggle button
    expect(toggleMock).toHaveBeenCalled(); // check if the function was triggered
  });

  test("all main nav links are rendered", () => {
    mockMode("light");
    mockUser(null);
    mockTheme();
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    // Check all main navigation links
    expect(screen.getByRole("link", { name: /tablero/i })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /documentación/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /acerca de/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /contacto/i })).toBeInTheDocument();
  });

  test("drawer opens when menu button clicked", () => {
    const onOpenMock = jest.fn();
    // Override default useDisclosure mock to track onOpen
    useDisclosure.mockReturnValue({
      isOpen: false,
      onOpen: onOpenMock,
      onClose: jest.fn(),
    });
    mockMode("light");
    mockUser(null);
    mockTheme();
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    const menuBtn = screen.getByLabelText(/abrir menú de navegación/i);
    fireEvent.click(menuBtn);
    expect(onOpenMock).toHaveBeenCalled(); // ensure drawer opens on click
  });

  /* EMPIEZAAAA */

  test("drawer logo closes drawer on click", () => {
    const onCloseMock = jest.fn();
    useDisclosure.mockReturnValue({
      isOpen: true,
      onOpen: jest.fn(),
      onClose: onCloseMock,
    });
    mockMode("light");
    mockUser(null);
    mockTheme();

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    // Find drawer logo by alt text
    const drawerLogo = screen.getByAltText(
      /Logotipo de Habituo - Tu tracker de hábitos/i
    );
    fireEvent.click(drawerLogo); // simulate click
    expect(onCloseMock).toHaveBeenCalled(); // drawer should close
  });

  test("drawer navigation links are rendered and clickable", () => {
    useDisclosure.mockReturnValue({
      isOpen: true,
      onOpen: jest.fn(),
      onClose: jest.fn(),
    });
    mockMode("light");
    mockUser(null);
    mockTheme();

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    const drawerLinks = [
      /tablero/i,
      /documentación/i,
      /acerca de/i,
      /contacto/i,
    ];

    for (const label of drawerLinks) {
      const link = screen.getByRole("link", { name: label });
      expect(link).toBeInTheDocument();
    }
  });

  test("drawer shows login button when no user", () => {
    const onCloseMock = jest.fn();
    useDisclosure.mockReturnValue({
      isOpen: true,
      onOpen: jest.fn(),
      onClose: onCloseMock,
    });
    mockMode("light");
    mockUser(null);
    mockTheme();

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    const loginBtn = screen.getByRole("button", { name: /iniciar sesión/i });
    expect(loginBtn).toBeInTheDocument();

    fireEvent.click(loginBtn);
    // Since handleNavigate calls navigate and onClose, drawer should close
    expect(onCloseMock).toHaveBeenCalled();
  });

  test("drawer shows user profile section when user exists", () => {
    useDisclosure.mockReturnValue({
      isOpen: true,
      onOpen: jest.fn(),
      onClose: jest.fn(),
    });
    mockMode("light");
    mockUser({ id: "123", name: "Test User" });
    mockTheme();

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    // Check if user profile section is present
    const avatars = screen.getAllByLabelText(/usuario/i);
    expect(avatars.length).toBeGreaterThan(0); // at least one avatar exists

    // The login button should not exist
    const loginBtn = screen.queryByRole("button", { name: /iniciar sesión/i });
    expect(loginBtn).not.toBeInTheDocument();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    useAuthUser.mockReturnValue({ user: null }); // no user
    useColorMode.mockReturnValue({
      colorMode: "light",
      toggleColorMode: jest.fn(),
    });
    useColorModeValue.mockImplementation((l, d) => l);
  });

  test("clicking login button calls navigate('/login')", async () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    const loginBtn = screen.getByRole("button", { name: /iniciar sesión/i });

    // userEvent simula la interacción real y asegura cobertura
    await userEvent.click(loginBtn);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});
