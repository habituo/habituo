import {
  Box,
  VStack,
  HStack,
  Grid,
  Text,
  FormControl,
  FormLabel,
  RadioGroup,
  useColorMode,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  useRadioGroup,
  useRadio,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { IconButton } from "@chakra-ui/react";
import { LuMoon, LuSun } from "react-icons/lu";
import { useTheme } from "../context/ThemeContext";
import customTheme from "./theme";

/**
 * Component for custom color radio buttons.
 * Handles the appearance and interaction of color options.
 */
const ColorRadioCard = (props) => {
  const { getInputProps, getRadioProps } = useRadio(props); // Chakra hook for handling radio inputs.
  const input = getInputProps(); // Gets the actual input props.
  const checkbox = getRadioProps(); // Gets the props to style the radio as a custom component.

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
          borderColor: `${props.value}.500`, // Highlight the selected color.
          boxShadow: `0 0 0 1px var(--chakra-colors-${props.value}-500)`,
        }}
      >
        <Box
          w="12px"
          h="12px"
          bg={`${props.value}.500`}
          borderRadius="full"
        ></Box>
        <Text as="span" fontSize="sm" fontWeight="medium" whiteSpace="nowrap">
          {props.label}
        </Text>
      </HStack>
    </Box>
  );
};

/**
 * Component for custom font family radio buttons.
 * Displays a preview of each font and allows selection.
 */
const FontRadioCard = ({ focusColor, ...props }) => {
  const { getInputProps, getRadioProps } = useRadio(props);
  const input = getInputProps(); // Input props for accessibility and state.
  const checkbox = getRadioProps(); // Props for styling the radio button.

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
          borderColor: `${focusColor}.500`, // Border color matches the focus color.
          boxShadow: `0 0 0 1px var(--chakra-colors-${focusColor}-500)`,
        }}
      >
        <Text fontFamily={props.value} fontSize="xl" fontWeight="medium">
          Ag
        </Text>
        <Text
          fontSize="xs"
          noOfLines={1}
          fontWeight="medium"
          fontFamily={props.value}
        >
          {props.label}
        </Text>
      </VStack>
    </Box>
  );
};

/**
 * Main component for the theme configuration panel.
 * Allows users to customize theme options such as color, font, and border radius.
 */
const ThemePanel = ({ onUpdateTheme }) => {
  const { updateTheme } = useTheme();
  const { colorMode, toggleColorMode } = useColorMode();

  // Set defaults values if not localStorage saved
  const defaultFocusColor = "blue";
  const defaultFontFamily = "Inter";
  const defaultBorderRadius = "lg";

  // Obtener valores de localStorage o usar los predeterminados
  const [focusColor, setFocusColor] = useState(() => {
    const storedFocusColor = localStorage.getItem("focusColor");
    return storedFocusColor || defaultFocusColor;
  });

  const [fontFamily, setFontFamily] = useState(() => {
    const storedFontFamily = localStorage.getItem("fontFamily");
    return storedFontFamily || defaultFontFamily;
  });

  const [borderRadius, setBorderRadius] = useState(() => {
    const storedBorderRadius = localStorage.getItem("borderRadius");
    return storedBorderRadius || defaultBorderRadius;
  });

  /**
   * Updates the global theme context whenever a configuration option changes.
   */
  const handleUpdateTheme = () => {
    updateTheme({
      focusColor,
      fontFamily,
      borderRadius,
    });

    if (onUpdateTheme) {
      onUpdateTheme({
        focusColor,
        fontFamily,
        borderRadius,
      });
    }
  };

  // Predefined options for colors, fonts, and border radius.
  const color = [
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
  ];
  const fonts = ["Outfit", "Inter", "Bricolage Grotesque", "Geist"];
  const borderMapping = {
    none: "none",
    sm: "sm",
    md: "md",
    lg: "lg",
    xl: "xl",
    "2xl": "2xl",
  };

  // Chakra's `useRadioGroup` hooks for handling radio group behaviors.
  const { getRootProps, getRadioProps } = useRadioGroup({
    name: "color",
    defaultValue: focusColor,
    onChange: (value) => {
      setFocusColor(value);
    },
  });
  const { getRootProps: getFontGroupProps, getRadioProps: getFontRadioProps } =
    useRadioGroup({
      name: "fontFamily",
      defaultValue: fontFamily,
      onChange: (value) => {
        setFontFamily(value);
      },
    });
  const group = getRootProps();
  const fontGroup = getFontGroupProps();

  useEffect(() => {
    updateTheme({ focusColor, fontFamily, borderRadius });

    localStorage.setItem("focusColor", focusColor);
    localStorage.setItem("fontFamily", fontFamily);
    localStorage.setItem("borderRadius", borderRadius);

    if (onUpdateTheme) {
      onUpdateTheme({ focusColor, fontFamily, borderRadius });
    }
  }, [focusColor, fontFamily, borderRadius]);

  return (
    <Box p={2}>
      <VStack spacing={4}>
        {/* Color Mode Toggle */}
        <FormControl
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          <FormLabel htmlFor="color-mode" mb="0" fontSize="md">
            Ajustes del tema
          </FormLabel>
          <IconButton
            fontSize="lg"
            bg="transparent"
            onChange={toggleColorMode}
            //isChecked={colorMode === "dark"}
            onClick={toggleColorMode}
            size="sm"
          >
            {colorMode === "light" ? <LuSun /> : <LuMoon />}
          </IconButton>
        </FormControl>

        {/* Focus Color */}
        <FormControl>
          <FormLabel fontSize="sm">Color principal</FormLabel>
          <RadioGroup>
            <Grid
              {...group}
              display="grid"
              gridTemplateColumns="repeat(3, minmax(0, 1fr))"
              gap={1.5}
            >
              {color.map((color) => {
                const radio = getRadioProps({ value: color });
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
          </RadioGroup>
        </FormControl>

        {/* Font Family */}
        <FormControl>
          <FormLabel fontSize="sm">Tipografía</FormLabel>
          <RadioGroup
            value={fontFamily}
            onChange={(value) => {
              setFontFamily(value);
              handleUpdateTheme();
            }}
          >
            <Grid
              {...fontGroup}
              display="grid"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              gap={1.5}
            >
              {fonts.map((font) => {
                const radio = getFontRadioProps({ value: font });
                return (
                  <FontRadioCard
                    key={font}
                    {...radio}
                    value={font}
                    focusColor={focusColor}
                    label={font.charAt(0).toUpperCase() + font.slice(1)}
                  />
                );
              })}
            </Grid>
          </RadioGroup>
        </FormControl>

        {/* Border Radius */}
        <FormControl>
          <FormLabel fontSize="sm">Bordes: {borderRadius}</FormLabel>
          <Slider
            aria-label={`border-${borderRadius}`}
            min={0}
            max={5}
            step={1}
            defaultValue={Object.keys(borderMapping).indexOf(borderRadius)}
            onChange={(value) => {
              const newRadius = Object.keys(borderMapping)[value];
              setBorderRadius(newRadius);
              handleUpdateTheme();
            }}
          >
            {/* Track and thumb */}
            <SliderTrack h="8px" borderRadius={customTheme.borderRadius}>
              <SliderFilledTrack bg={`${focusColor}.500`} />
            </SliderTrack>

            {/* Thumb */}
            <SliderThumb
              boxSize="20px"
              border={`2px solid var(--chakra-colors-${focusColor}-500)`}
            />
          </Slider>
        </FormControl>
      </VStack>
    </Box>
  );
};

export default ThemePanel;
