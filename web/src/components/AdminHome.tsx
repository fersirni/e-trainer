import {
  Box,
  Center,
  Flex,
  Heading,
  Skeleton,
  Spacer,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react";
import React from "react";
import { useUsersQuery } from "../generated/graphql";
import { AdminBar } from "./AdminBar";
import { Wrapper } from "./Wrapper";

interface AdminHomeProps {}

export const AdminHome: React.FC<AdminHomeProps> = () => {
  const [{ data, fetching }] = useUsersQuery();
  let body = null;
  if (fetching) {
  } else if (data?.users) {
    body = (
      <>
        <AdminBar />
        <Wrapper variant="regular">
          <Center pb={16}>
            <Heading>I'm a Heading</Heading>
          </Center>
          <Flex>
            <Stat bg={"#035e81"}>
              <Box p={4}>
                <StatLabel>Created Users</StatLabel>
                <StatNumber>
                  {data.users.length}
                </StatNumber>
                <StatHelpText>asdasdasdasd</StatHelpText>
              </Box>
            </Stat>
            <Spacer bg={"#035e8100"} />
            <Stat bg={"#035e81"}>
              <Box p={4}>
                <StatLabel>Created Users</StatLabel>
                <StatNumber>
                  {data.users.length}
                </StatNumber>
                <StatHelpText>asdasdasdasd</StatHelpText>
              </Box>
            </Stat>
            <Spacer bg={"#035e8100"} />
            <Stat bg={"#035e81"}>
              <Box p={4}>
                <StatLabel>Created Users</StatLabel>
                <StatNumber>
                  {data.users.length}
                </StatNumber>
                <StatHelpText>asdasdasdasd</StatHelpText>
              </Box>
            </Stat>
          </Flex>
        </Wrapper>
      </>
    );
  } else {
    body = (
      <>
        <AdminBar />
        <Wrapper variant="big">
          <Skeleton height="400px" width="400px" />
        </Wrapper>
      </>
    );
  }
  return <>{body}</>;
};
