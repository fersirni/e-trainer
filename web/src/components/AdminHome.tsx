import React from "react";
import { NavBar } from "../components/NavBar";
import {
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Icon,
  MenuGroup,
} from "@chakra-ui/react";
import { TiUser, TiCogOutline } from "react-icons/ti";

import {
  ExternalLinkIcon,
} from "@chakra-ui/icons";

interface AdminHomeProps {}

export const AdminHome: React.FC<AdminHomeProps> = () => {
  return (
    <>
      <NavBar />
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label="Options"
          icon={<Icon as={TiCogOutline} />}
          bg="white"
        />
        <MenuList>
          <MenuGroup title="Profile">
            <MenuItem icon={<Icon as={TiUser} />}>Users</MenuItem>
          </MenuGroup>
          <MenuGroup title="Entities">
            <MenuItem icon={<Icon as={TiUser} />}>Users</MenuItem>
            <MenuItem icon={<ExternalLinkIcon />}>New Window</MenuItem>
          </MenuGroup>
        </MenuList>
      </Menu>
    </>
  );
};
