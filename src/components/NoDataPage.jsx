import React from "react";
import {
  VStack,
  Stack,
  Skeleton,
  Text,
  Button,
  useDisclosure,
} from "@chakra-ui/react";
import { ModalArea, ModalHabit } from "../routes/index";
import { useTheme } from "../context/ThemeContext";
import * as LuIcons from "react-icons/lu";

const NoDataPage = (props) => {
  const { themeOptions } = useTheme();
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

  return (
    <VStack
      w="100%"
      h={`calc(100vh - 90px)`}
      alignItems="center"
      justifyContent="center"
      userSelect="none"
      textAlign="center"
    >
      <Stack mb={2} borderRadius={themeOptions.borderRadius}>
        <Skeleton w="200px" h="40px" borderRadius={themeOptions.borderRadius} />
        <Skeleton w="200px" h="40px" borderRadius={themeOptions.borderRadius} />
        <Skeleton w="200px" h="40px" borderRadius={themeOptions.borderRadius} />
      </Stack>
      <Text as="h2" fontSize="xl" fontWeight="600">
        Da el paso y construye tu mejor versión
      </Text>
      <Text as="p" fontSize="sm" maxW="600px">
        Los hábitos son como los escalones de una escalera: al dar el primer
        paso, el resto se va sumando uno a uno.
      </Text>
      <Button
        ps={3}
        mt={2}
        leftIcon={<LuIcons.LuPlus size="16px" />}
        iconSpacing={1}
        onClick={props.type === "areas" ? openModalArea : openModalHabit}
      >
        Añadir {props.type === "areas" ? " área" : " hábito"}
      </Button>
      {props.type === "areas" ? (
        <ModalArea isOpen={isModalAreaOpen} onClose={closeModalArea} />
      ) : (
        <ModalHabit isOpen={isModalHabitOpen} onClose={closeModalHabit} />
      )}
    </VStack>
  );
};

export default NoDataPage;
