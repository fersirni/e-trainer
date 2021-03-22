import React from "react";
import { NavBar } from "./NavBar";
import {
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Icon,
  MenuGroup,
  MenuDivider,
} from "@chakra-ui/react";
import {
  TiUser,
  TiCogOutline,
  TiBookmark,
  TiPuzzle,
  TiMessages,
  TiHome,
  TiFlash,
} from "react-icons/ti";
import { Wrapper } from "./Wrapper";
import { useRouter } from "next/router";

interface AdminBarProps {}

export const AdminBar: React.FC<AdminBarProps> = () => {
  const router = useRouter();
  function handleClick(event: any) {
    router.push(`/${event.target.name}`);
  }
  return (
    <>
      <NavBar />
      <Wrapper variant="big">
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="Options"
            icon={<Icon as={TiCogOutline} boxSize={8} />}
          />
          <MenuList>
            <MenuItem
              name="home"
              icon={<Icon as={TiHome} boxSize={4} />}
              onClick={() => router.push('/')}
            >
              Home
            </MenuItem>
            <MenuDivider />
            <MenuGroup title="Entities">
              <MenuItem
                name="users"
                icon={<Icon as={TiUser} boxSize={4} />}
                onClick={handleClick}
              >
                Users
              </MenuItem>
              <MenuItem
                name="routines"
                icon={<Icon as={TiFlash} boxSize={4} />}
                onClick={handleClick}
              >
                Routines
              </MenuItem>
              <MenuItem
                name="categories"
                icon={<Icon as={TiBookmark} boxSize={4} />}
                onClick={handleClick}
              >
                Categories
              </MenuItem>
              <MenuItem
                name="exercises"
                icon={<Icon as={TiPuzzle} boxSize={4} />}
                onClick={handleClick}
              >
                Exercises
              </MenuItem>
              <MenuItem
                name="steps"
                icon={<Icon as={TiMessages} boxSize={4} />}
                onClick={handleClick}
              >
                Steps
              </MenuItem>
            </MenuGroup>
          </MenuList>
        </Menu>
      </Wrapper>
    </>
  );
};
