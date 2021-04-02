import React from "react";
import { Wrapper } from "../components/Wrapper";
import {
  Box,
  Center,
  Heading,
  Icon,
  Skeleton,
  Table,
  TableCaption,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
} from "@chakra-ui/react";
import {
  useCategoriesQuery,
  useDeleteCategoryMutation,
} from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { withUrqlClient } from "next-urql";
import { AdminBar } from "../components/AdminBar";
import { TiTrash } from "react-icons/ti";
import { useRouter } from "next/router";

interface categoriesProps {}
const NOT_AUTHENTICATED_MESSAGE = "Not authenticated";

const Categories: React.FC<categoriesProps> = ({}) => {
  const [{}, deleteCategory] = useDeleteCategoryMutation();
  const [{ data, fetching, error }] = useCategoriesQuery();
  const [categories, setCategories] = React.useState(data?.categories);
  const router = useRouter();
  const toast = useToast();
  if (error) {
    console.log(error.message);
    if (error.message.includes(NOT_AUTHENTICATED_MESSAGE)) {
      router.push("/");
    }
    toast({
      title: "Ups! Something went wrong :(",
      description: error.message,
      status: "error",
      duration: 5000,
      isClosable: true,
    });
  }
  
  if (!categories) {
    if (fetching) {
    } else if (data?.categories) {
      setCategories(data.categories);
    }
  }

  const handleDelete = async (id: number) => {
    const response = await deleteCategory({ id });
    if (response.data?.deleteCategory && categories) {
      let updatedCategories = categories.filter((category) => {
        return category.id !== id;
      });
      setCategories(updatedCategories);
    }
  };

  const formatCategories = (c: any) => {
    const privacy = c.isPublic ? "public" : "private";
    const quantity = c.exercises ? c.exercises.length : 0;
    const { id, name, description } = c;
    return {
      id,
      name,
      description,
      privacy,
      quantity,
    };
  };

  const headers = (
    <Tr>
      <Th>Id</Th>
      <Th>Name</Th>
      <Th>Description</Th>
      <Th>Privacy</Th>
      <Th>Exercises</Th>
      <Th isNumeric>Actions</Th>
    </Tr>
  );

  const emptyBody = (
    <>
      <Center mt={32}>
        <Box>No Categories Found</Box>
      </Center>
    </>
  );

  const body = (categories || []).map(formatCategories).map((c) => (
    <Tr key={c.id}>
      <Td>{c.id}</Td>
      <Td>{c.name}</Td>
      <Td>{c.description}</Td>
      <Td>{c.privacy}</Td>
      <Td>{c.quantity}</Td>
      <Td isNumeric>
        <Icon
          as={TiTrash}
          boxSize={6}
          onClick={() => {
            if (c.id) {
              handleDelete(c.id);
            }
          }}
        />
      </Td>
    </Tr>
  ));

  const skeletonArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const skeleton = skeletonArray.map((n) => (
    <Skeleton key={n} mt="1" height="30px" />
  ));

  const table = fetching ? (
    <>
      <Table size="lg">
        <Thead>{headers}</Thead>
      </Table>
      <Box padding="6" boxShadow="lg">
        {skeleton}
      </Box>
    </>
  ) : categories && categories.length > 0 ? (
    <Table size="lg">
      <Thead>{headers}</Thead>
      <Tbody>{body}</Tbody>
      <TableCaption>Total: {categories.length}</TableCaption>
    </Table>
  ) : (
    emptyBody
  );

  return (
    <>
      <AdminBar />
      <Wrapper variant="big">
        <Heading mb={4} size="lg">
          Categories
        </Heading>
        {table}
      </Wrapper>
    </>
  );
};

export default withUrqlClient(createUrqlClient)(Categories);
