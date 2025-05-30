import React, { useCallback } from "react";
import {
  VStack,
  Stack,
  Skeleton,
  Text,
  Button,
  useDisclosure,
  useColorMode,
} from "@chakra-ui/react";
import { ModalArea, ModalHabit } from "../routes/index";
import { useTheme } from "../context/ThemeContext";
import * as LuIcons from "react-icons/lu";

const NoDataPage = ({ type }) => {
  const { themeOptions } = useTheme();
  const { colorMode } = useColorMode();
  const {
    isOpen: isModalAreaOpen,
    onOpen: openModalArea,
    onClose: closeModalArea,
  } = useDisclosure();
  const {
    isOpen: isModalHabitOpen,
    onOpen: openModalHabit,
    onClose: closeModalHabit,
  } = useDisclosure();

  const AddIcon = LuIcons.LuPlus;
  const buttonText = type === "areas" ? " área" : " hábito";
  const headingText = "Da el paso y construye tu mejor versión";
  const paragraphText =
    "Los hábitos son como los escalones de una escalera: al dar el primer paso, el resto se va sumando uno a uno.";

  const handleButtonClick = useCallback(() => {
    if (type === "areas") {
      openModalArea();
    } else {
      openModalHabit();
    }
  }, [type, openModalArea, openModalHabit]);

  return (
    <VStack
      w="100%"
      h={`calc(100vh - 90px)`}
      alignItems="center"
      justifyContent="center"
      userSelect="none"
      textAlign="center"
      bg={colorMode === "light" ? "gray.100" : "gray.900"}
    >
      <Stack mb={2} borderRadius={themeOptions.borderRadius}>
        <Skeleton w="200px" h="40px" borderRadius={themeOptions.borderRadius} />
        <Skeleton w="200px" h="40px" borderRadius={themeOptions.borderRadius} />
        <Skeleton w="200px" h="40px" borderRadius={themeOptions.borderRadius} />
      </Stack>
      <Text as="h2" fontSize="xl" fontWeight={600}>
        {headingText}
      </Text>
      <Text as="p" fontSize="sm" maxW="600px">
        {paragraphText}
      </Text>
      <Button
        ps={3}
        mt={2}
        leftIcon={<AddIcon size="16px" />}
        iconSpacing={1}
        onClick={handleButtonClick}
        aria-label={`Añadir${buttonText}`}
      >
        Añadir{buttonText}
      </Button>
      {type === "areas" && (
        <ModalArea isOpen={isModalAreaOpen} onClose={closeModalArea} />
      )}
      {type === "habits" && (
        <ModalHabit isOpen={isModalHabitOpen} onClose={closeModalHabit} />
      )}
    </VStack>
  );
};

export default NoDataPage;
