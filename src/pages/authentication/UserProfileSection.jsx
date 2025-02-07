import React, { useState, useEffect } from "react";
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
} from "@chakra-ui/react";
import { FiLogOut } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const UserProfileSection = () => {
  const { themeOptions } = useTheme();
  const { user, logout } = useAuth();

  const [userData, setUserData] = useState({
    name: "",
  });

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userDocData = userSnap.data();
            const name =
              userDocData.name ||
              user.displayName ||
              (user.email ? user.email.split("@")[0] : "Usuario");
            const avatar = userDocData.avatar || user.photoURL;

            setUserData({
              name,
              avatar: avatar ? `//wsrv.nl/?url=${avatar}` : undefined,
            });
          } else {
            throw new Error("No such document!");
          }
        } catch (error) {
          throw new Error("Error fetching user data: ", error);
        }
      };

      fetchUserData();
    }
  }, [user]);

  if (!user) return null;

  const { name } = userData;

  const displayName = name;
  const displayAvatar = user.photoURL
    ? `//wsrv.nl/?url=${user.photoURL}`
    : undefined;

  if (user) {
    return (
      <Box>
        <Popover placement="bottom-end">
          <PopoverTrigger>
            <Avatar
              src={displayAvatar}
              name={displayName}
              cursor="pointer"
              size="sm"
            />
          </PopoverTrigger>
          <Portal>
            <PopoverContent
              w="auto"
              borderRadius={themeOptions.borderRadius}
              p={1}
              _focusVisible={{
                borderColor: "transparent",
                boxShadow: "none",
                outline: "none",
              }}
            >
              <PopoverArrow />
              <PopoverBody userSelect="none">
                <VStack spacing={4} align="end">
                  <Flex alignItems="center" justifyContent="flex-start" gap={3}>
                    <Avatar src={displayAvatar} name={displayName} size="md" />
                    <Box>
                      <Text fontSize="sm">{displayName}</Text>
                      <Text fontSize="sm" color="var(--chakra-colors-gray-400)">
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
                    onClick={logout}
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
  }
};

export default UserProfileSection;
