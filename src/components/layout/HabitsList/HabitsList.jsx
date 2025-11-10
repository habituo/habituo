import { VStack, Button, Text } from "@chakra-ui/react";
import PropTypes from "prop-types";

const HabitsList = ({ isSelected, setSelectedArea, themeOptions, navigate }) => {
  return (
    <VStack spacing={1} align="stretch">
      <Button
        as={Button}
        p={2}
        w="100%"
        display="flex"
        alignItems="center"
        justifyContent="flex-start"
        fontSize="sm"
        onClick={() => {
          navigate("/dashboard/habits");
          setSelectedArea(null);
        }}
        variant={isSelected ? "solid" : "unstyled"}
        colorScheme={isSelected ? themeOptions.focusColor : "blackAlpha"}
        leftIcon="📋"
        _focusVisible={{}}
      >
        <Text isTruncated>Todos los hábitos</Text>
      </Button>
    </VStack>
  );
};

HabitsList.propTypes = {
  isSelected: PropTypes.bool.isRequired,
  setSelectedArea: PropTypes.func.isRequired,
  themeOptions: PropTypes.shape({
    focusColor: PropTypes.string.isRequired,
  }).isRequired,
  navigate: PropTypes.func.isRequired,
};

export default HabitsList;
