import React from "react";
import { Wrapper } from "../components/Wrapper";
import {
  Box,
  Button,
  Center,
  Heading,
  Table,
  TableCaption,
  Tbody,
  Td,
  Tfoot,
  Th,
  Thead,
  Tr,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { useUsersQuery } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";
import { createUrqlClient } from "../utils/createUrqlClient";
import { withUrqlClient } from "next-urql";
import { AdminBar } from "../components/AdminBar";

interface usersProps {}

const Users: React.FC<usersProps> = ({}) => {
  const router = useRouter();
  const [{ data, fetching }] = useUsersQuery();
  let body = null;
  if (fetching) {
  } else if (data?.users) {
    body = (
      <>
        <AdminBar />
        <Wrapper variant="big">
          <Heading mb={4} size='lg'>Users</Heading>
          <Table size="lg">
            <Thead>
              <Tr>
                <Th>Id</Th>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th isNumeric>Profile</Th>
              </Tr>
            </Thead>
            <Tbody>
            {
              data.users.map(user => (
                <Tr key={user._id}>
                  <Td>{user._id}</Td>
                  <Td>{user.name}</Td>
                  <Td>{user.email}</Td>
                  <Td isNumeric>admin</Td>
                </Tr>
              ))
            }
            </Tbody>
          </Table>
        </Wrapper>
      </>
    );
  }
  return <>{body}</>;
};

export default withUrqlClient(createUrqlClient)(Users);
