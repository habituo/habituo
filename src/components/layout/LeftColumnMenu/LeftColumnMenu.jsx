import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext/ThemeContext";
import { useAuthUser } from "../../../context/AuthUserContext/AuthUserContext";
import {
  HStack,
  Text,
  Button,
  VStack,
  useColorMode,
  useDisclosure,
  Divider,
} from "@chakra-ui/react";
import { getAppInfo } from "../../../hooks/useDatabase";
import * as LuIcons from "react-icons/lu";
import {
  CustomThemePanel,
  HabitModal,
  HabitsList,
  UserMenu,
  AreasList,
  SidebarSkeleton,
  SidebarSection,
  SidebarFooter,
  UserSettingsModal,
} from "../../../exports";
import useModals from "../../../hooks/useModals";
import PropTypes from "prop-types";
import useDeleteArea from "../../../hooks/useDeleteArea";

const LeftColumnMenu = ({ areas }) => {
  const { themeOptions } = useTheme();
  const { colorMode } = useColorMode();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuthUser();

  const [selectedArea, setSelectedArea] = useState(null);
  const [appInfo, setAppInfo] = useState({ name: "", version: "" });
  const [isContextMenuVisible, setContextMenuVisible] = useState(false);
  const contextMenuRef = useRef(null);

  const { modals, openModal, closeModal, isOpen } = useModals([
    "createHabit",
    "area",
    "delete",
    "profile",
    "logout",
  ]);
  const { handleDelete } = useDeleteArea({ user, closeModal });

  const { onOpen: onOpenLogoutConfirmation } = useDisclosure();

  const isHomeActive = location.pathname === "/dashboard";
  const isHabitsActive = location.pathname === "/dashboard/habits";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(e.target)
      ) {
        setContextMenuVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchInfo = async () => {
      const info = await getAppInfo();
      setAppInfo(info);
    };
    fetchInfo();
  }, []);

  if (loading || !user) {
    return (
      <VStack p={4} w="100%" h="100vh" spacing={4} align="start">
        <SidebarSkeleton />
      </VStack>
    );
  }

  return (
    <VStack
      as="nav"
      aria-label="Panel lateral de navegación"
      p={2}
      w="100%"
      h="100vh"
      position="relative"
      alignItems="stretch"
      justifyContent="stretch"
      spacing={2}
      bg={colorMode === "light" ? "white" : "black"}
    >
      <VStack align="stretch" spacing={2}>
        <UserMenu
          user={user}
          themeOptions={themeOptions}
          colorMode={colorMode}
          onOpenProfileModal={() => openModal("profile")}
          onOpenLogoutConfirmation={onOpenLogoutConfirmation}
        />
        <Button
          as={Button}
          px={2}
          w="100%"
          display="flex"
          alignItems="center"
          justifyContent="flex-start"
          fontSize="sm"
          onClick={() => navigate("/dashboard")}
          variant={isHomeActive ? "solid" : "unstyled"}
          colorScheme={isHomeActive ? themeOptions.focusColor : "blackAlpha"}
          leftIcon="🏠"
          _focusVisible={{}}
        >
          Inicio
        </Button>
      </VStack>
      <Divider />
      <VStack pb={4} align="stretch" spacing={2} maxH="100vh" overflowY="auto">
        <VStack align="stretch" spacing={1}>
          <SidebarSection
            title="Hábitos"
            tooltip="Añadir hábito"
            icon={<LuIcons.LuPlus size="16px" />}
            onIconClick={() => openModal("createHabit")}
            colorMode={colorMode}
            themeOptions={themeOptions}
          >
            <HabitsList
              isSelected={isHabitsActive}
              setSelectedArea={setSelectedArea}
              themeOptions={themeOptions}
              navigate={navigate}
            />
            <HabitModal
              isOpen={isOpen("createHabit")}
              onClose={() => closeModal("createHabit")}
            />
          </SidebarSection>
        </VStack>
        <VStack align="stretch" spacing={1}>
          <SidebarSection
            title="Áreas"
            tooltip="Añadir área"
            icon={<LuIcons.LuPlus size="16px" />}
            onIconClick={() => {
              setSelectedArea(null);
              openModal("area");
            }}
            colorMode={colorMode}
            themeOptions={themeOptions}
          >
            <AreasList
              areas={areas}
              themeOptions={themeOptions}
              colorMode={colorMode}
              selectedArea={selectedArea}
              setSelectedArea={setSelectedArea}
              isContextMenuVisible={isContextMenuVisible}
              setContextMenuVisible={setContextMenuVisible}
              contextMenuRef={contextMenuRef}
              handleDelete={handleDelete}
              navigate={navigate}
              modals={modals}
              openModal={openModal}
              closeModal={closeModal}
              isOpen={isOpen}
            />
          </SidebarSection>
        </VStack>
        <VStack align="stretch" spacing={1}>
          <HStack alignItems="center" justifyContent="flex-start">
            <Text
              fontSize="xs"
              fontWeight={600}
              textTransform="uppercase"
              color={colorMode === "light" ? "gray.400" : "gray.600"}
              isTruncated
            >
              Ajustes generales
            </Text>
          </HStack>
          <VStack spacing={1}>
            <Button
              as={Button}
              p={3}
              w="100%"
              display="flex"
              justifyContent="flex-start"
              fontSize="sm"
              onClick={() => openModal("profile")}
              variant="unstyled"
              colorScheme="blackAlpha"
              leftIcon={<LuIcons.LuSlidersHorizontal size="16px" />}
              _focusVisible={{}}
            >
              <Text isTruncated>Ajustes generales</Text>
            </Button>
            {user && (
              <UserSettingsModal
                isOpen={isOpen("profile")}
                onClose={() => closeModal("profile")}
                userData={user}
                user={user}
              />
            )}
            <CustomThemePanel />
          </VStack>
        </VStack>
      </VStack>
      <SidebarFooter version={appInfo.version} appName={appInfo.name} />
    </VStack>
  );
};

LeftColumnMenu.propTypes = {
  areas: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      icon: PropTypes.string,
    })
  ).isRequired,
};

export default LeftColumnMenu;
