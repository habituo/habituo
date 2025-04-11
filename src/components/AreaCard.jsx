import React from "react";
import {
  LinkBox,
  Box,
  HStack,
  Heading,
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
import { useTheme } from "../context/ThemeContext";

const AreaCard = ({ area, handleEdit, confirmDelete }) => {
  // Basic experience states
  const { themeOptions } = useTheme();
  const { colorMode } = useColorMode();
  const IconComponent = LuIcons[area.icon] || LuIcons.LuFolder;

  return (
    <>
      {area ? (
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
          bg={colorMode === "light" ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)"}
          _hover={{
            bg:
              colorMode === "light"
                ? `var(--chakra-colors-${themeOptions.focusColor}-50)`
                : "var(--chakra-colors-blackAlpha-600)",
            borderColor: `var(--chakra-colors-${themeOptions.focusColor}-500)`,
          }}
        >
          <Box as="time" fontSize="sm" opacity={0.8}>
            {area.registeredAt
              ? `${area.registeredAt.toLocaleDateString("es-ES", {
                  day: "2-digit",
                })} de ${area.registeredAt
                  .toLocaleDateString("es-ES", { month: "long" })
                  .replace(/^\w/, (c) =>
                    c.toUpperCase()
                  )} de ${area.registeredAt.getFullYear()}`
              : "Sin fecha de creación"}
          </Box>
          <HStack alignItems="center">
            <IconComponent size="20px" />
            <Heading
              fontFamily={themeOptions.fontFamily}
              fontSize="xl"
              fontWeight="600"
            >
              <LinkOverlay href={`/dashboard/areas/${area.id}`}>
                {area.name}
              </LinkOverlay>
            </Heading>
          </HStack>
          <Text fontSize="sm" fontWeight="400" opacity={0.8}>
            {area.habitCount} {area.habitCount === 1 ? "hábito" : "hábitos"}
          </Text>
          <Tooltip
            label="Opciones"
            aria-label="Tooltip"
            borderRadius={themeOptions.borderRadius}
            bg={colorMode === "light" ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)"}
            color={
              colorMode === "light" ? "rgb(0, 0, 0)" : "rgb(255, 255, 255)"
            }
          >
            <Menu>
              <MenuButton
                as={IconButton}
                aria-label="Options"
                icon={<LuIcons.LuEllipsisVertical />}
                position="absolute"
                right={1}
                top={1}
                fontSize="lg"
                bg="transparent"
                size="sm"
                borderRadius={themeOptions.borderRadius}
              />
              <MenuList
                m={0}
                p={0}
                minW="auto"
                borderRadius={themeOptions.borderRadius}
                bg={
                  colorMode === "light" ? "var(--menu-bg)" : "rgb(23, 23, 23)"
                }
              >
                <MenuItem
                  icon={<LuIcons.LuPenLine size={16} />}
                  borderTopRadius={themeOptions.borderRadius}
                  bg={
                    colorMode === "light" ? "var(--menu-bg)" : "rgb(23, 23, 23)"
                  }
                  _hover={{
                    bg:
                      colorMode === "light"
                        ? "rgb(237 242 247)"
                        : "rgba(255, 255, 255, 0.06)",
                  }}
                  onClick={() => handleEdit(area)}
                >
                  Editar
                </MenuItem>
                <MenuItem
                  icon={<LuIcons.LuTrash size={16} />}
                  borderBottomRadius={themeOptions.borderRadius}
                  bg={
                    colorMode === "light" ? "var(--menu-bg)" : "rgb(23, 23, 23)"
                  }
                  _hover={{
                    bg:
                      colorMode === "light"
                        ? "rgb(237 242 247)"
                        : "rgba(255, 255, 255, 0.06)",
                  }}
                  onClick={() => confirmDelete(area)}
                >
                  Eliminar
                </MenuItem>
              </MenuList>
            </Menu>
          </Tooltip>
        </LinkBox>
      ) : (
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
          bg={colorMode === "light" ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)"}
        >
          <Skeleton w="40%" h="18px" />
          <Skeleton w="25px" h="25px" top={2} right={2} position="absolute" />
          <HStack my={4}>
            <SkeletonCircle size="6" />
            <Skeleton w="40%" h="26px" />
          </HStack>
          <Skeleton w="45%" h="12px" />
        </LinkBox>
      )}
    </>
  );
};

export default AreaCard;
