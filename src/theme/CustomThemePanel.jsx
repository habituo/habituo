import { useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { useTheme } from "../context/ThemeContext";
import {
  Box,
  Button,
  VStack,
  HStack,
  Grid,
  Text,
  FormControl,
  FormLabel,
  useColorMode,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  useRadioGroup,
  useRadio,
  useDisclosure,
  DrawerCloseButton,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { LuMoon, LuSun } from "react-icons/lu";
import { PiMagicWandLight } from "react-icons/pi";
import customTheme from "./theme";

const ColorRadioCard = (props) => {
  const { getInputProps, getRadioProps } = useRadio(props);
  const input = getInputProps();
  const checkbox = getRadioProps();

  return (
    <Box as="label">
      <input {...input} />
      <HStack
        {...checkbox}
        width="100%"
        cursor="pointer"
        borderWidth="1px"
        borderRadius="base"
        px={3}
        py={2}
        pe={0}
        spacing={2}
        _checked={{
          borderColor: `${props.value}.500`,
          boxShadow: `0 0 0 1px var(--chakra-colors-${props.value}-500)`,
        }}
      >
        <Box
          w="12px"
          h="12px"
          bg={`${props.value}.500`}
          borderRadius="full"
        ></Box>
        <Text as="span" fontSize="sm" fontWeight={400} whiteSpace="nowrap">
          {props.label}
        </Text>
      </HStack>
    </Box>
  );
};

ColorRadioCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

const FontRadioCard = ({ focusColor, ...props }) => {
  const { getInputProps, getRadioProps } = useRadio(props);
  const input = getInputProps();
  const checkbox = getRadioProps();

  return (
    <Box as="label">
      <input {...input} />
      <VStack
        {...checkbox}
        cursor="pointer"
        borderWidth="1px"
        borderRadius="base"
        p={3}
        spacing={0}
        _checked={{
          borderColor: `${focusColor}.500`,
          boxShadow: `0 0 0 1px var(--chakra-colors-${focusColor}-500)`,
        }}
      >
        <Text fontFamily={props.value} fontSize="xl" fontWeight={600}>
          Ag
        </Text>
        <Text
          fontSize="xs"
          noOfLines={1}
          fontWeight={400}
          fontFamily={props.value}
        >
          {props.label}
        </Text>
      </VStack>
    </Box>
  );
};

FontRadioCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  focusColor: PropTypes.string.isRequired,
};

const CustomThemePanel = ({ onUpdateTheme }) => {
  const { updateTheme, themeOptions } = useTheme();
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const defaultFocusColor = "blue";
  const defaultFontFamily = "Inter";
  const defaultBorderRadius = "lg";
  const currentFocusColor = themeOptions.focusColor || defaultFocusColor;
  const currentFontFamily = themeOptions.fontFamily || defaultFontFamily;
  const currentBorderRadius = themeOptions.borderRadius || defaultBorderRadius;
  const colorOptions = useMemo(
    () => [
      "gray",
      "red",
      "orange",
      "yellow",
      "green",
      "teal",
      "blue",
      "cyan",
      "purple",
      "pink",
    ],
    []
  );
  const fontOptions = useMemo(
    () => ["Outfit", "Inter", "Bricolage Grotesque", "Geist"],
    []
  );
  const borderMapping = useMemo(
    () => ({
      none: "none",
      sm: "sm",
      md: "md",
      lg: "lg",
      xl: "xl",
      "2xl": "2xl",
    }),
    []
  );

  const handleThemeChange = useCallback(
    (key, value) => {
      const newTheme = {
        focusColor: key === "focusColor" ? value : currentFocusColor,
        fontFamily: key === "fontFamily" ? value : currentFontFamily,
        borderRadius: key === "borderRadius" ? value : currentBorderRadius,
      };
      updateTheme(newTheme);

      localStorage.setItem("focusColor", newTheme.focusColor);
      localStorage.setItem("fontFamily", newTheme.fontFamily);
      localStorage.setItem("borderRadius", newTheme.borderRadius);

      if (onUpdateTheme) {
        onUpdateTheme(newTheme);
      }
    },
    [
      updateTheme,
      onUpdateTheme,
      currentFocusColor,
      currentFontFamily,
      currentBorderRadius,
    ]
  );

  const {
    getRootProps: getColorGroupProps,
    getRadioProps: getColorRadioProps,
  } = useRadioGroup({
    name: "color",
    value: currentFocusColor,
    onChange: (value) => handleThemeChange("focusColor", value),
  });
  const colorGroup = getColorGroupProps();

  const { getRootProps: getFontGroupProps, getRadioProps: getFontRadioProps } =
    useRadioGroup({
      name: "fontFamily",
      value: currentFontFamily,
      onChange: (value) => handleThemeChange("fontFamily", value),
    });
  const fontGroup = getFontGroupProps();
  const currentSliderValue = useMemo(() => {
    const keys = Object.keys(borderMapping);
    const index = keys.indexOf(currentBorderRadius);
    return index !== -1 ? index : keys.indexOf(defaultBorderRadius);
  }, [currentBorderRadius, borderMapping, defaultBorderRadius]);

  return (
    <>
      <Button
        as={Button}
        p={3}
        w="100%"
        display="flex"
        justifyContent="flex-start"
        fontSize="sm"
        onClick={onOpen}
        variant="unstyled"
        colorScheme="blackAlpha"
        leftIcon={<PiMagicWandLight size="16px" />}
        _focusVisible="none"
      >
        Crea tu estilo
      </Button>

      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent
          bg={colorMode === "light" ? "gray.100" : "gray.900"}
          fontFamily={currentFontFamily}
        >
          <DrawerCloseButton />
          <DrawerHeader p={4} borderBottomWidth="1px">
            <Text mb={2} fontSize="xl">
              Crea tu estilo
            </Text>
            <Text fontSize="xs" fontWeight={400}>
              Elige el estilo que quieras y crea tu propio diseño.
            </Text>
          </DrawerHeader>
          <DrawerBody p={4}>
            <FormControl
              mb={4}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <FormLabel htmlFor="color-mode" mb={0} fontSize="md">
                Modo Día/Noche
              </FormLabel>
              <Tooltip
                label={`Cambiar a modo ${
                  colorMode === "light" ? "oscuro" : "claro"
                }`}
                placement="left"
              >
                <IconButton
                  icon={colorMode === "light" ? <LuSun /> : <LuMoon />}
                  onClick={toggleColorMode}
                  size="sm"
                  aria-label="Toggle color mode"
                />
              </Tooltip>
            </FormControl>

            <FormControl mb={4}>
              <FormLabel fontSize="sm">Color principal</FormLabel>
              <Grid
                {...colorGroup}
                display="grid"
                gridTemplateColumns="repeat(3, minmax(0, 1fr))"
                gap={1.5}
              >
                {colorOptions.map((color) => {
                  const radio = getColorRadioProps({ value: color });
                  return (
                    <ColorRadioCard
                      key={color}
                      {...radio}
                      value={color}
                      label={color.charAt(0).toUpperCase() + color.slice(1)}
                    />
                  );
                })}
              </Grid>
            </FormControl>

            <FormControl mb={4}>
              <FormLabel fontSize="sm">Tipografía</FormLabel>
              <Grid
                {...fontGroup}
                display="grid"
                gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                gap={1.5}
              >
                {fontOptions.map((font) => {
                  const radio = getFontRadioProps({ value: font });
                  return (
                    <FontRadioCard
                      key={font}
                      {...radio}
                      value={font}
                      focusColor={currentFocusColor}
                      label={font.charAt(0).toUpperCase() + font.slice(1)}
                    />
                  );
                })}
              </Grid>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">Bordes: {currentBorderRadius}</FormLabel>
              <Slider
                aria-label={`border-${currentBorderRadius}`}
                min={0}
                max={Object.keys(borderMapping).length - 1}
                step={1}
                value={currentSliderValue}
                onChange={(value) => {
                  const newRadius = Object.keys(borderMapping)[value];
                  handleThemeChange("borderRadius", newRadius);
                }}
              >
                <SliderTrack h="8px" borderRadius={customTheme.borderRadius}>
                  <SliderFilledTrack bg={`${currentFocusColor}.500`} />
                </SliderTrack>
                <SliderThumb
                  boxSize="20px"
                  border={`2px solid var(--chakra-colors-${currentFocusColor}-500)`}
                >
                  <Text
                    fontSize="xs"
                    fontWeight="bold"
                    color="white"
                    transform="translateY(-150%)"
                  >
                    {currentBorderRadius}
                  </Text>
                </SliderThumb>
              </Slider>
            </FormControl>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

CustomThemePanel.propTypes = {
  onUpdateTheme: PropTypes.func,
};

export default CustomThemePanel;
