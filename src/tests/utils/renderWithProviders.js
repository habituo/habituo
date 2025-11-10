import { render } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";

/**
 * Renderiza un componente React envuelto con los providers necesarios (Chakra, etc.)
 * para que los tests funcionen igual que en la app real.
 */
const renderWithProviders = (ui, options = {}) => {
  return render(<ChakraProvider>{ui}</ChakraProvider>, options);
};

export default renderWithProviders;
