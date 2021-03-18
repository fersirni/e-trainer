import React from "react";
import { Wrapper } from "../components/Wrapper";
import {
  Heading,
  Icon,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { useUnregisterMutation, useUsersQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { withUrqlClient } from "next-urql";
import { AdminBar } from "../components/AdminBar";
import { TiTrash } from "react-icons/ti";

interface usersProps {}

const Users: React.FC<usersProps> = ({}) => {
  const [{}, unregister] = useUnregisterMutation();
  const [{ data, fetching }] = useUsersQuery();
  const [users, setUsers] = React.useState(data?.users);
  if (!users) {
    if (fetching) {
    } else if (data?.users) {
      setUsers(data.users);
    }
  }
  const handleDelete = async (id: number) => {
    const response = await unregister({ id });
    if (response.data?.unregister) {
      if (data?.users) {
        let updatedUsers = data.users.filter((user) => {
          return user._id !== id;
        });
        setUsers(updatedUsers);
      }
    }
  };
 
  return (
    <>
      <AdminBar />
      <Wrapper variant="big">
        <Heading mb={4} size="lg">
          Users
        </Heading>
        <Table size="lg">
          <Thead>
            <Tr>
              <Th>Id</Th>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Profile</Th>
              <Th isNumeric>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {users && users.length > 0 ? (
              users.map((user) => (
                <Tr key={user._id}>
                  <Td>{user._id}</Td>
                  <Td>{user.name}</Td>
                  <Td>{user.email}</Td>
                  <Td>admin</Td>
                  <Td isNumeric>
                    <Icon
                      as={TiTrash}
                      boxSize={6}
                      onClick={() => {
                        handleDelete(user._id);
                      }}
                    />
                  </Td>
                </Tr>
              ))
            ) : (
              <div>Loading...</div>
            )}
          </Tbody>
        </Table>
      </Wrapper>
    </>
  );
};

export default withUrqlClient(createUrqlClient)(Users);
