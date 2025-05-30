import { useState, useEffect, useCallback } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../hooks/firebase";
import {
  Flex,
  Avatar,
  Popover,
  PopoverTrigger,
  Portal,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  VStack,
  Text,
  Button,
  Box,
  Icon,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { FiLogOut } from "react-icons/fi";
import { useAuthUser } from "../../context/AuthUserContext";
import { useTheme } from "../../context/ThemeContext";

const UserProfileSection = () => {
  const { themeOptions } = useTheme();
  const { user, loading, logout } = useAuthUser();
  const toast = useToast();
  const [userData, setUserData] = useState({
    name: "Cargando...",
    avatar: undefined,
  });
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);

  useEffect(() => {
    if (user && !loading) {
      const fetchUserData = async () => {
        setIsFetchingProfile(true);
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          let nameToDisplay = user.displayName;
          let avatarToDisplay = user.photoURL;

          if (userSnap.exists()) {
            const userDocData = userSnap.data();
            nameToDisplay =
              userDocData.name ||
              user.displayName ||
              (user.email ? user.email.split("@")[0] : "Usuario");
            avatarToDisplay = userDocData.avatar || user.photoURL;
          } else {
            nameToDisplay =
              user.displayName ||
              (user.email ? user.email.split("@")[0] : "Usuario");
            avatarToDisplay = user.photoURL;
            throw new Error("No such document!");
          }

          setUserData({
            name: nameToDisplay,
            avatar: avatarToDisplay
              ? `https://wsrv.nl/?url=${encodeURIComponent(
                  avatarToDisplay
                )}&w=60&h=60&fit=cover&output=webp`
              : undefined,
          });
        } catch (error) {
          toast({
            title: <Text fontWeight={600}>Error al cargar perfil</Text>,
            description: "No se pudo cargar la información de tu perfil.",
            status: "error",
            position: "bottom",
          });

          setUserData({
            name:
              user.displayName ||
              (user.email ? user.email.split("@")[0] : "Usuario"),
            avatar: user.photoURL,
          });
        } finally {
          setIsFetchingProfile(false);
        }
      };

      fetchUserData();
    } else if (!user && !loading) {
      setUserData({
        name: "",
        avatar: undefined,
      });
      setIsFetchingProfile(false);
    }
  }, [user, loading, toast]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      toast({
        title: <Text fontWeight={600}>Sesión cerrada</Text>,
        description: "Has cerrado sesión correctamente.",
        status: "info",
        position: "bottom",
      });
    } catch (error) {
      toast({
        title: <Text fontWeight={600}>Error al cerrar sesión</Text>,
        description: error.message || "Ocurrió un error al cerrar sesión.",
        status: "error",
        position: "bottom",
      });
    }
  }, [logout, toast]);

  if (!user) return null;

  const { name: displayName, avatar: displayAvatar } = userData;

  return (
    <Box>
      <Popover placement="bottom-end">
        <PopoverTrigger>
          <Avatar
            src={displayAvatar}
            name={displayName}
            cursor="pointer"
            size="sm"
            opacity={isFetchingProfile ? 0.7 : 1}
            border={
              isFetchingProfile
                ? `2px solid ${themeOptions.focusColor}`
                : "none"
            }
          >
            {isFetchingProfile && (
              <Spinner size="xs" color={themeOptions.focusColor} />
            )}
          </Avatar>
        </PopoverTrigger>
        <Portal>
          <PopoverContent
            w="auto"
            borderRadius={themeOptions.borderRadius}
            p={1}
            _focusVisible="none"
          >
            <PopoverArrow />
            <PopoverBody userSelect="none">
              <VStack spacing={4} align="end">
                <Flex alignItems="center" justifyContent="flex-start" gap={3}>
                  <Avatar src={displayAvatar} name={displayName} size="md">
                    {isFetchingProfile && (
                      <Spinner size="sm" color={themeOptions.focusColor} />
                    )}
                  </Avatar>
                  <Box>
                    <Text fontSize="sm" fontWeight={500}>
                      {isFetchingProfile ? "Cargando nombre..." : displayName}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      {user.email}
                    </Text>
                  </Box>
                </Flex>
                <Button
                  h="2rem"
                  px="0.625rem"
                  variant="ghost"
                  fontSize="xs"
                  iconSpacing={1}
                  leftIcon={<Icon as={FiLogOut} boxSize={4} />}
                  onClick={handleLogout}
                  isLoading={loading}
                  loadingText="Cerrando..."
                >
                  Cerrar sesión
                </Button>
              </VStack>
            </PopoverBody>
          </PopoverContent>
        </Portal>
      </Popover>
    </Box>
  );
};

export default UserProfileSection;
