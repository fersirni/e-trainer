import React from "react";
import {
  Button,
  Center,
  Spacer,
  Flex,
  Heading,
  Divider,
} from "@chakra-ui/react";
import { Wrapper } from "./Wrapper";
import { useRouter } from "next/router";

interface UserAuthenticationProps {
  variant?: "small" | "regular";
}

export const UserAuthentication: React.FC<UserAuthenticationProps> = () => {
  const router = useRouter();
  return (
    <>
      <Wrapper variant="regular">
        <Center>
          <Heading>Welcome!</Heading>
        </Center>
        <Wrapper variant="small">
          <Flex>
            <Button
              colorScheme="teal"
              size="lg"
              onClick={() => {
                router.push("/login");
              }}
            >
              Log in
            </Button>
            <Spacer />
            <Center height={"auto"}>
              <Divider colorScheme="teal" orientation="vertical" variant='solid'/>
            </Center>
            <Spacer />
            <Button
              colorScheme="blue"
              size="lg"
              onClick={() => {
                router.push("/register");
              }}
            >
              Register
            </Button>
          </Flex>
        </Wrapper>
      </Wrapper>
    </>
  );
};
