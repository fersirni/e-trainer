import React from "react";
import { createUrqlClient } from "../utils/createUrqlClient";
import { withUrqlClient } from "next-urql";
import { useCategoriesQuery } from "../generated/graphql";
import { AdminBar } from "../components/AdminBar";
import { Wrapper } from "../components/Wrapper";
import {
  Center,
  Table,
  TableCaption,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";

interface categoriesProps {}

const Categories: React.FC<categoriesProps> = ({}) => {
  const [{ data: categoriesData }] = useCategoriesQuery();

  const headers = (
    <>
      <Tr>
        <Th>Name</Th>
        <Th>Description</Th>
        <Th>Privacy</Th>
        <Th isNumeric>Exercises</Th>
      </Tr>
    </>
  );

  let table;
  if (categoriesData?.categories) {
    const categories = categoriesData.categories.map((c) => {
      const isPublic = c.isPublic ? "public" : "private";
      const quantity = c.exercises ? c.exercises.length : 0;
      return {
        name: c.name,
        description: c.description,
        isPublic,
        quantity,
      };
    });

    const categoriesTd = categories.map((c, i) => (
      <Tr key={"category"+i}>
        <Td key={"name"+i} >{c.name}</Td>
        <Td key={"description"+i}>{c.description}</Td>
        <Td key={"isPublic"+i}>{c.isPublic}</Td>
        <Td key={"quantity"+i} isNumeric>{c.quantity}</Td>
      </Tr>
    ));

    table = (
      <>
        <Table variant="striped" size="md">
          <Thead>{headers}</Thead>
          <Tbody>{categoriesTd}</Tbody>
          <TableCaption>
            Total: {categories.length}
          </TableCaption>
        </Table>
      </>
    );
  }

  return (
    <>
      <AdminBar />
      <Wrapper variant="big">
        <Center>{table}</Center>
      </Wrapper>
    </>
  );
};

export default withUrqlClient(createUrqlClient)(Categories);
