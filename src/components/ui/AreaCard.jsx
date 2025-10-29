import React, { useMemo } from "react";
import {
  LinkBox,
  Box,
  HStack,
  Text,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  LinkOverlay,
  useColorMode,
  Skeleton,
  SkeletonCircle,
} from "@chakra-ui/react";
import * as LuIcons from "react-icons/lu";
import { useTheme } from "../../context/ThemeContext/ThemeContext";

const formatRegisteredDate = (date) => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return "Sin fecha de creación";
  }

  const options = {
    day: "2-digit",
    month: "long",
    year: "numeric",
  };

  const formattedDate = date.toLocaleDateString("es-ES", options);

  return formattedDate.replace(
    /(\sde\s)(\w+)/,
    (match, p1, p2) => p1 + p2.charAt(0).toUpperCase() + p2.slice(1)
  );
};

const AreaCard = React.memo(({ area, handleEdit, confirmDelete }) => {
  const { themeOptions } = useTheme();
  const { colorMode } = useColorMode();

  const areaCreatedAtDate = useMemo(() => {
    if (area?.createdAt && typeof area.createdAt.toDate === "function") {
      return area.createdAt.toDate();
    }
    return area?.createdAt || null;
  }, [area?.createdAt]);

  if (!area) {
    return (
      <LinkBox
        as="article"
        p={3}
        pb={1}
        borderWidth="2px"
        borderRadius={themeOptions.borderRadius}
        w="100%"
        minH="119px"
        maxH="min-content"
        userSelect="none"
        bg={colorMode === "light" ? "white" : "black"}
        data-testid="area-card-skeleton"
      >
        <Skeleton w="40%" h="18px" />
        <Skeleton
          w="25px"
          h="25px"
          position="absolute"
          top={3}
          right={3}
          borderRadius="md"
        />
        <HStack my={4} alignItems="center">
          <SkeletonCircle size="6" />
          <Skeleton w="40%" h="26px" />
        </HStack>
        <Skeleton w="45%" h="12px" />
      </LinkBox>
    );
  }

  return (
    <LinkBox
      key={area.id}
      p={3}
      display="flex"
      flexDirection="column"
      alignItems="flex-start"
      gap={2}
      borderWidth="2px"
      borderRadius={themeOptions.borderRadius}
      w="100%"
      maxH="min-content"
      userSelect="none"
      cursor="pointer"
      transition=".1s all linear"
      bg={colorMode === "light" ? "white" : "black"}
      _hover={{
        bg:
          colorMode === "light"
            ? `var(--chakra-colors-${themeOptions.focusColor}-50)`
            : "var(--chakra-colors-blackAlpha-600)",
        borderColor: `var(--chakra-colors-${themeOptions.focusColor}-500)`,
      }}
      role="listitem"
      aria-label={`Área: ${area.name}`}
      data-testid={`area-card-${area.id}`}
    >
      <Box
        as="time"
        fontSize="sm"
        color={colorMode === "light" ? "gray.400" : "gray.600"}
        dateTime={
          areaCreatedAtDate ? areaCreatedAtDate.toISOString() : undefined
        }
      >
        {formatRegisteredDate(areaCreatedAtDate)}
      </Box>
      <HStack alignItems="center">
        <Text
          fontFamily={themeOptions.fontFamily}
          fontSize="xl"
          fontWeight={600}
        >
          {area?.icon}{" "}
          <LinkOverlay href={`/dashboard/areas/${area.id}`}>
            {area.name}
          </LinkOverlay>
        </Text>
      </HStack>
      <Text fontSize="sm" fontWeight={400} opacity={0.8}>
        {area.habitCount || 0} {area.habitCount === 1 ? "hábito" : "hábitos"}
      </Text>
      <Tooltip
        label="Opciones"
        aria-label="Opciones del área"
        borderRadius={themeOptions.borderRadius}
        bg={colorMode === "light" ? "white" : "black"}
        color={colorMode === "light" ? "black" : "white"}
      >
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label={`Más opciones para el área ${area.name}`}
            icon={<LuIcons.LuEllipsisVertical />}
            position="absolute"
            right={1}
            top={1}
            fontSize="lg"
            bg="transparent"
            size="sm"
            borderRadius={themeOptions.borderRadius}
            _hover={{
              bg: colorMode === "light" ? "gray.100" : "whiteAlpha.200",
            }}
            _active={{
              bg: colorMode === "light" ? "gray.200" : "whiteAlpha.300",
            }}
          />
          <MenuList
            m={0}
            p={0}
            minW="auto"
            borderRadius={themeOptions.borderRadius}
            bg={colorMode === "light" ? "var(--menu-bg)" : "gray.900"}
          >
            <MenuItem
              icon={<LuIcons.LuPenLine size={16} />}
              borderTopRadius={themeOptions.borderRadius}
              bg={colorMode === "light" ? "var(--menu-bg)" : "gray.900"}
              _hover={{
                bg:
                  colorMode === "light"
                    ? "rgb(237, 242, 247)"
                    : "rgba(255, 255, 255, 0.06)",
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(area);
              }}
            >
              Editar
            </MenuItem>
            <MenuItem
              icon={<LuIcons.LuTrash size={16} />}
              borderBottomRadius={themeOptions.borderRadius}
              bg={colorMode === "light" ? "var(--menu-bg)" : "gray.900"}
              _hover={{
                bg:
                  colorMode === "light"
                    ? "rgb(237, 242, 247)"
                    : "rgba(255, 255, 255, 0.06)",
              }}
              onClick={(e) => {
                e.stopPropagation();
                confirmDelete(area);
              }}
            >
              Eliminar
            </MenuItem>
          </MenuList>
        </Menu>
      </Tooltip>
    </LinkBox>
  );
});

export default AreaCard;
