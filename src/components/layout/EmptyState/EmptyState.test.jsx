import { render, screen, fireEvent } from "@testing-library/react";
import PropTypes from "prop-types";
import EmptyState from "./EmptyState";

const VStackMock = ({ children, ...props }) => <div {...props}>{children}</div>;
VStackMock.propTypes = { children: PropTypes.node };

const StackMock = ({ children, ...props }) => <div {...props}>{children}</div>;
StackMock.propTypes = { children: PropTypes.node };

const Button = ({ children, onClick, ...props }) => (
  <button onClick={onClick} {...props}>{children}</button>
);
Button.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
};

/**
 * Mock the ThemeContext to provide controlled theme values.
 * This avoids needing the real context provider during tests.
 */
jest.mock("../../../context/ThemeContext/ThemeContext", () => ({
  useTheme: () => ({
    themeOptions: { borderRadius: "8px" },
  }),
}));

/**
 * Mock Chakra UI components and hooks to isolate the EmptyState behavior.
 * Only preserve what is needed for rendering and interaction testing.
 */
jest.mock("@chakra-ui/react", () => {
  const original = jest.requireActual("@chakra-ui/react");

  return {
    ...original,
    VStack: VStackMock,
    Stack: StackMock,
    Button: Button,
    Text: (props) => <p {...props} />,
    Skeleton: (props) => <div data-testid="skeleton" {...props} />,
    useDisclosure: jest.fn(() => ({
      isOpen: false,
      onOpen: jest.fn(),
      onClose: jest.fn(),
    })),
    useColorMode: jest.fn(() => ({ colorMode: "light" })),
  };
});

/**
 * Mock exported modal components (AreaModal and HabitModal).
 * Each mock renders a simple identifiable div.
 */
jest.mock("../../../exports", () => ({
  AreaModal: jest.fn(() => <div data-testid="area-modal" />),
  HabitModal: jest.fn(() => <div data-testid="habit-modal" />),
}));

/** Import mocked hooks for manual behavior control in tests */
const { useDisclosure, useColorMode } = require("@chakra-ui/react");

/**
 * @test EmptyState component
 *
 * This suite verifies that the EmptyState component:
 * - Renders correctly for both "areas" and "habits" modes.
 * - Displays correct color mode styles.
 * - Opens the appropriate modal when the button is clicked.
 */
describe("EmptyState", () => {
  /** Reset mocks before each test for isolation */
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Ensure the component renders all expected elements and styles
   * when type='areas' and colorMode='light'.
   */
  test("renderiza correctamente con type='areas' en modo light", () => {
    useColorMode.mockReturnValue({ colorMode: "light" });
    render(<EmptyState type="areas" />);

    // Check motivational texts
    expect(
      screen.getByText(/Da el paso y construye tu mejor versión/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Los hábitos son como los escalones/i)
    ).toBeInTheDocument();

    // Verify button properties and color style
    const button = screen.getByRole("button", { name: /añadir área/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveStyle({ background: "gray.200" });

    // Skeleton placeholders should appear
    expect(screen.getAllByTestId("skeleton")).toHaveLength(3);

    // Area modal should be rendered, habit modal should not
    expect(screen.getByTestId("area-modal")).toBeInTheDocument();
    expect(screen.queryByTestId("habit-modal")).not.toBeInTheDocument();
  });

  /**
   * Simulate a click event to confirm that the Area modal opens properly.
   */
  test("abre el modal de área al hacer click", () => {
    const openAreaMock = jest.fn();
    useDisclosure.mockReturnValueOnce({
      isOpen: false,
      onOpen: openAreaMock,
      onClose: jest.fn(),
    });
    render(<EmptyState type="areas" />);
    const button = screen.getByRole("button", { name: /añadir área/i });
    fireEvent.click(button);
    expect(openAreaMock).toHaveBeenCalledTimes(1);
  });

  /**
   * Ensure the component renders correctly when type='habits'
   * and dark mode is active.
   */
  test("renderiza correctamente con type='habits' en modo dark", () => {
    useColorMode.mockReturnValue({ colorMode: "dark" });
    render(<EmptyState type="habits" />);

    const button = screen.getByRole("button", { name: /añadir hábito/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveStyle({ background: "gray.800" });

    // Habit modal should be rendered, area modal should not
    expect(screen.getByTestId("habit-modal")).toBeInTheDocument();
    expect(screen.queryByTestId("area-modal")).not.toBeInTheDocument();
  });

  /**
   * Simulate a click event to confirm that the Habit modal opens properly.
   */
  test("abre el modal de hábito al hacer click", () => {
    const openHabitMock = jest.fn();

    // First mock is for area modal, second for habit modal
    useDisclosure
      .mockReturnValueOnce({
        isOpen: false,
        onOpen: jest.fn(),
        onClose: jest.fn(),
      })
      .mockReturnValueOnce({
        isOpen: false,
        onOpen: openHabitMock,
        onClose: jest.fn(),
      });

    render(<EmptyState type="habits" />);
    const button = screen.getByRole("button", { name: /añadir hábito/i });

    fireEvent.click(button);
    expect(openHabitMock).toHaveBeenCalledTimes(1);
  });
});
