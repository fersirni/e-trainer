import { Box, Flex } from "@chakra-ui/layout";
import React from "react";
import { useMeQuery } from "../generated/graphql";
import {
  Avatar,
  Center,
  Spacer,
  WrapItem,
} from "@chakra-ui/react";
import { isServer } from "../utils/isServer";
import { OptionsMenu } from "./OptionsMenu";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{ data, fetching }] = useMeQuery({
    pause: isServer(),
  });
  let actions = null;
  let profile = null;

  if (fetching) {
  } else if (!data?.me) {
    // actions = (
    //   <>
    //     <NextLink href="/login">
    //       <Link color="white" mr={2}>
    //         Log in
    //       </Link>
    //     </NextLink>
    //     <NextLink href="/register">
    //       <Link color="white">Register</Link>
    //     </NextLink>
    //   </>
    // );
  } else {
    profile = (
      <>
        <Center>
          <WrapItem>
            <Avatar
              size="xs"
              name="Dan Abrahmov"
              src="https://bit.ly/dan-abramov"
            />
          </WrapItem>
          <Box ml={4} color="white">
            {data.me.name}
          </Box>
        </Center>
      </>
    );
    actions = (
      <OptionsMenu />
    );
  }
  return (
    <Flex bg="#24292e" p={4}>
      <Box>{profile}</Box>
      <Spacer />
      <Box>{actions}</Box>
    </Flex>
  );
};
