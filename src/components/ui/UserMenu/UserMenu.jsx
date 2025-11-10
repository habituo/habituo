import {
  Avatar,
  Flex,
  Text,
  Button,
  VStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import PropTypes from "prop-types";
import * as LuIcons from "react-icons/lu";

const UserMenu = ({
  user,
  themeOptions,
  colorMode,
  onOpenProfileModal,
  onOpenLogoutConfirmation,
}) => {
  const { name, displayName, email, photoURL } = user || {};
  const userName = name || displayName || email?.split("@")[0] || "Usuario";

  const userPhotoURL = photoURL ? `//wsrv.nl/?url=${photoURL}` : undefined;

  return (
    <Menu>
      <MenuButton
        as={Button}
        px={2}
        h={45}
        w="100%"
        justifyContent="flex-start"
        color={colorMode === "light" ? "black" : "white"}
        _focusVisible={{}}
        aria-label="Perfil de usuario"
      >
        <Flex align="center" gap={2} overflow="hidden">
          <Avatar src={userPhotoURL} name={userName} size="sm" />
          <VStack alignItems="flex-start" spacing={0} overflow="hidden">
            <Text fontSize="sm" fontWeight={600} isTruncated>
              {userName}
            </Text>
            <Text fontSize="xs" fontWeight={400} isTruncated>
              {email}
            </Text>
          </VStack>
        </Flex>
      </MenuButton>

      <MenuList p={0} borderRadius={themeOptions.borderRadius}>
        <MenuItem
          p={2}
          justifyContent="flex-start"
          fontSize="sm"
          icon={<LuIcons.LuUserRound size="16px" />}
          variant="ghost"
          borderRadius={0}
          borderTopRadius={themeOptions.borderRadius}
          _focusVisible={{}}
          onClick={onOpenProfileModal}
        >
          Ver perfil
        </MenuItem>
        <MenuItem
          p={2}
          justifyContent="flex-start"
          fontSize="sm"
          icon={<LuIcons.LuLogOut size="16px" />}
          variant="ghost"
          borderRadius={0}
          borderBottomRadius={themeOptions.borderRadius}
          _focusVisible={{}}
          onClick={onOpenLogoutConfirmation}
        >
          Cerrar sesión
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

UserMenu.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    displayName: PropTypes.string,
    email: PropTypes.string,
    photoURL: PropTypes.string,
  }),
  themeOptions: PropTypes.shape({
    borderRadius: PropTypes.string.isRequired,
  }).isRequired,
  colorMode: PropTypes.oneOf(["light", "dark"]).isRequired,
  onOpenProfileModal: PropTypes.func.isRequired,
  onOpenLogoutConfirmation: PropTypes.func.isRequired,
};

UserMenu.defaultProps = {
  user: {
    name: null,
    displayName: null,
    email: null,
    photoURL: null,
  },
};

export default UserMenu;
