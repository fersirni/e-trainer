import { Box, Flex } from "@chakra-ui/layout";
import React from "react";
import { useMeQuery } from "../generated/graphql";
import { Avatar, Center, Spacer, WrapItem } from "@chakra-ui/react";
import { isServer } from "../utils/isServer";
import { OptionsMenu } from "./OptionsMenu";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{ data, fetching }] = useMeQuery({
    pause: isServer(),
  });
  const [name, setName] = React.useState(data?.me?.name);
  if (!name) {
    if (fetching) {
    } else if (data?.me) {
      setName(data.me.name);
    }
  }
  return (
    <Flex bg="#24292e" p={4}>
      <Box>
        <Center>
          <WrapItem>
            <Avatar
              size="xs"
              name="Dan Abrahmov"
              src="https://bit.ly/dan-abramov"
            />
          </WrapItem>
          <Box ml={4} color="white">
            {name}
          </Box>
        </Center>
      </Box>
      <Spacer />
      <Box>
        <OptionsMenu />
      </Box>
    </Flex>
  );
};

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
