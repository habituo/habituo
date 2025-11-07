import { useState, useMemo } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
  Text,
  useColorMode,
  Portal,
} from "@chakra-ui/react";
import EmojiPicker from "emoji-picker-react";
import PropTypes from "prop-types";

const EmojiSelector = ({ selectedEmoji, onSelect, themeOptions }) => {
  const { colorMode } = useColorMode();
  const [showPicker, setShowPicker] = useState(false);

  const handleEmojiSelect = (emojiData) => {
    onSelect(emojiData.emoji);
    setShowPicker(false);
  };

  const pickerTheme = colorMode === "dark" ? "dark" : "light";

  const borderRadius = useMemo(() => {
    const radiusMap = {
      "3xl": 24,
      "2xl": 16,
      xl: 12,
      lg: 8,
      md: 6,
      sm: 2,
      none: 0,
    };
    return radiusMap[themeOptions.borderRadius] || 6;
  }, [themeOptions.borderRadius]);

  return (
    <Popover
      placement="bottom-start"
      closeOnBlur={true}
      isOpen={showPicker}
      onClose={() => setShowPicker(false)}
    >
      <PopoverTrigger>
        <Button
          variant="outline"
          borderRadius={themeOptions.borderRadius}
          _focusVisible={{}}
          aria-label="Seleccionar emoji"
          onClick={() => setShowPicker(!showPicker)}
        >
          <Text>{selectedEmoji}</Text>
        </Button>
      </PopoverTrigger>
      <Portal>
        <PopoverContent
          p={0}
          borderRadius={themeOptions.borderRadius}
          zIndex="popover"
          width="100%"
          maxW="300px"
        >
          <EmojiPicker
            onEmojiClick={handleEmojiSelect}
            searchPlaceholder="Buscar emoji..."
            lazyLoadEmojis={true}
            theme={pickerTheme}
            width="100%"
            className="emoji-selector-mod"
          />
          <style>
            {`
              .emoji-selector-mod * {
                font-family: ${themeOptions.fontFamily} !important;
              }
              .emoji-selector-mod * {
                border-radius: ${borderRadius}px !important;
              }
            `}
          </style>
        </PopoverContent>
      </Portal>
    </Popover>
  );
};

EmojiSelector.propTypes = {
  selectedEmoji: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
  themeOptions: PropTypes.shape({
    borderRadius: PropTypes.string.isRequired,
    fontFamily: PropTypes.string.isRequired,
  }).isRequired,
};

export default EmojiSelector;
