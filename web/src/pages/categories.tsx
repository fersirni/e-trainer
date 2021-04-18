import React, { useEffect, useState } from "react";
import { Wrapper } from "../components/Wrapper";
import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  Spacer,
  Spinner,
  Table,
  Tag,
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
import { useIsAuth } from "../utils/useIsAuth";
import { SearchIcon } from "@chakra-ui/icons";
import NextLink from "next/link";

interface categoriesProps {}

const Categories: React.FC<categoriesProps> = ({}) => {
  useIsAuth();
  const toast = useToast();
  const [value, setValue] = React.useState("");

  const [categories, setCategories] = useState([] as any[]);
  const [variables, setVariables] = useState({
    limit: 8,
    cursor: null as null | string,
    searchName: "",
  });
  const [{ data, fetching }] = useCategoriesQuery({ variables });
  const [{}, deleteCategory] = useDeleteCategoryMutation();

  useEffect(() => {
    document.title = "Categories";
    if (!fetching && data?.categories?.categories) {
      let filtered = categories.concat(data.categories.categories);
      let existingIds: number[] = [];
      let cleanIndexes = filtered
        .map((item, index) => {
          if (!existingIds.includes(item.id)) {
            existingIds.push(item.id);
            return index;
          }
          return undefined;
        })
        .filter((i) => i !== undefined);
      filtered = filtered.filter((i, index) => cleanIndexes.includes(index));
      setCategories(filtered);
    }
  }, [fetching, data]);

  const handleSearch = () => {
    setCategories([]);
    setVariables({
      limit: variables.limit,
      cursor: null,
      searchName: value,
    });
  };
  const handleChange = (event: any) => {
    setValue(event.target.value);
  };
  const handleDelete = async (id: number) => {
    const response = await deleteCategory({ id });
    if (response.data?.deleteCategory && categories) {
      let updatedCategories = categories.filter((category) => {
        return category.id !== id;
      });
      setCategories(updatedCategories);
    } else {
      toast({
        title: "Ups! Something went wrong :(",
        description: "Error while deleting category",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
    toast({
      title: "Success",
      description: "Category deleted!",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const formatCategories = (c: any) => {
    const privacy = c.isPublic ? "public" : "private";
    const quantity = c.exercises ? c.exercises.length : 0;
    const { id, name, shortDescription: description } = c;
    return {
      id,
      name,
      description,
      privacy,
      quantity,
    };
  };
  const privacyColor = (privacy: string) => {
    return privacy === "public" ? "teal" : "";
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
      <Table size="lg">
        <Thead>{headers}</Thead>
      </Table>
      <Center mt={32}>
        <Box>No Categories Found</Box>
      </Center>
    </>
  );

  const body = (categories || []).map(formatCategories).map((c) => (
    <Tr key={c.id}>
      <Td>{c.id}</Td>
      <Td>
        <NextLink href={`/category/edit/${c.id}`}>
          <Link>{c.name}</Link>
        </NextLink>
      </Td>
      <Td>{c.description}</Td>
      <Td>
        <Tag size="sm" colorScheme={privacyColor(c.privacy)}>
          {c.privacy}
        </Tag>
      </Td>
      <Td>{c.quantity}</Td>
      <Td isNumeric>
        <IconButton
          onClick={() => {
            if (c.id) {
              handleDelete(c.id);
            }
          }}
          size="sm"
          variant="outline"
          colorScheme="tomato"
          aria-label="Delete permanently"
          icon={<Icon as={TiTrash} boxSize={6} />}
        />
      </Td>
    </Tr>
  ));

  const table = fetching ? (
    <>
      <Table size="lg">
        <Thead>{headers}</Thead>
      </Table>
      <Center mt={32}>
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
        />
      </Center>
    </>
  ) : categories && categories.length > 0 ? (
    <Table size="lg">
      <Thead>{headers}</Thead>
      <Tbody>{body}</Tbody>
    </Table>
  ) : (
    emptyBody
  );

  return (
    <>
      <AdminBar />
      <Wrapper variant="big">
        <Flex>
          <Heading pb={8} size="lg">
            Categories
          </Heading>
        </Flex>
        <Flex>
          <Box mb={8} maxW="xs">
            <InputGroup>
              <Input
                variant="flushed"
                value={value}
                onChange={handleChange}
                placeholder="Search by name"
              />
              <InputRightElement width="4.5rem">
                <Button h="1.75rem" size="sm" onClick={handleSearch}>
                  <SearchIcon color="gray.300" />
                </Button>
              </InputRightElement>
            </InputGroup>
          </Box>
          <Spacer />
          <Box>
            <Button colorScheme="teal">Create</Button>
          </Box>
        </Flex>
        {table}
        {data && data.categories?.hasMore ? (
          <Flex>
            <Button
              onClick={() => {
                const cat = data.categories?.categories;
                let cursor: string | null = null;
                if (cat) {
                  cursor = cat[cat.length - 1].updatedAt;
                }
                setVariables({
                  limit: variables.limit,
                  cursor,
                  searchName: value,
                });
              }}
              m="auto"
              my={8}
              isLoading={fetching}
            >
              Load more
            </Button>
          </Flex>
        ) : null}
      </Wrapper>
    </>
  );
};

export default withUrqlClient(createUrqlClient)(Categories);
