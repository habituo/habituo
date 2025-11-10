import { Box, HStack, IconButton, Text, useTheme } from "@chakra-ui/react";
import * as LuIcons from "react-icons/lu";

const DashboardHeader = ({
  onOpenLeftMenu,
  onOpenRightMenu,
  isMobile,
  userName,
  greeting,
  currentDate,
  colorMode,
}) => {
  const themeOptions = useTheme();

  return (
    <HStack
      px={isMobile ? 2 : 5}
      py={2}
      minH={58}
      borderBottom="2px solid var(--chakra-colors-chakra-border-color)"
      w="100%"
      alignItems="center"
      justifyContent="space-between"
      bg={colorMode === "light" ? "white" : "black"}
    >
      <HStack w="100%" spacing={2}>
        {isMobile && (
          <IconButton
            icon={<LuIcons.LuMenu size="24px" />}
            onClick={onOpenLeftMenu}
            variant="ghost"
            borderRadius={themeOptions.borderRadius}
            aria-label="Abrir menú"
            _focusVisible={{}}
          />
        )}
        <Box
          w="100%"
          display="flex"
          flexDirection={{ base: "column", md: "row" }}
          justifyContent={{ base: "center", md: "space-between" }}
          gap={1}
        >
          <Text
            as="h2"
            fontSize={{ base: "lg", md: "xl" }}
            textAlign={isMobile && "left"}
            fontWeight={400}
            noOfLines={1}
            lineHeight={1}
            overflow="visible"
            color={colorMode === "light" ? "#00000060" : "#FFFFFF60"}
          >
            {greeting},
            <Text
              as="span"
              fontWeight={600}
              color={colorMode === "light" ? "black" : "white"}
            >
              {" "}
              {userName}
            </Text>
          </Text>
          <HStack spacing={2}>
            <LuIcons.LuCalendarDays size="14px" />
            <Text
              fontSize={{ base: "sm", md: "md" }}
              fontWeight={400}
              lineHeight={1}
            >
              {currentDate}
            </Text>
          </HStack>
        </Box>
      </HStack>
      {isMobile && (
        <IconButton
          icon={<LuIcons.LuChartColumnBig size="24px" />}
          onClick={onOpenRightMenu}
          variant="ghost"
          borderRadius={themeOptions.borderRadius}
          aria-label="Abrir menú"
          _focusVisible={{}}
        />
      )}
    </HStack>
  );
};

export default DashboardHeader;
