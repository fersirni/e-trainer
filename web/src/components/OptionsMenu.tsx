import { HamburgerIcon, EditIcon, CloseIcon } from "@chakra-ui/icons";
import {
  Menu,
  MenuButton,
  IconButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import React from "react";
import { useLogoutMutation } from "../generated/graphql";
import { useRouter } from "next/router";

interface OptionsMenuProps {}

export const OptionsMenu: React.FC<OptionsMenuProps> = ({}) => {
  const router = useRouter();
  const [{}, logout] = useLogoutMutation();
  return (
    <Menu>
      <MenuButton
        mr={4}
        as={IconButton}
        aria-label="Options"
        icon={<HamburgerIcon />}
        color="white"
        bg="#24292e"
        size={"s"}
      />
      <MenuList>
        <MenuItem
          icon={<EditIcon />}
          onClick={() => {
            router.push("/profile");
          }}
        >
          Account Settings
        </MenuItem>
        <MenuItem
          icon={<CloseIcon />}
          onClick={() => {
            logout();
          }}
        >
          Log out
        </MenuItem>
      </MenuList>
    </Menu>
  );
};
