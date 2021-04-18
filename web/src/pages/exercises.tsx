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
  useDeleteExerciseMutation,
  useExercisesQuery,
} from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { withUrqlClient } from "next-urql";
import { AdminBar } from "../components/AdminBar";
import { TiTrash } from "react-icons/ti";
import { useIsAuth } from "../utils/useIsAuth";
import { SearchIcon } from "@chakra-ui/icons";
import NextLink from "next/link";
import { useRouter } from "next/router";

interface exercisesProps {}

const Exercises: React.FC<exercisesProps> = ({}) => {
  useIsAuth();
  const router = useRouter();
  const toast = useToast();
  const [value, setValue] = React.useState("");

  const [exercises, setExercises] = useState([] as any[]);
  const [variables, setVariables] = useState({
    searchName: "",
  });
  const [{ data, fetching }] = useExercisesQuery({ variables });
  const [{}, deleteExercise] = useDeleteExerciseMutation();

  useEffect(() => {
    document.title = "Exercises";
    if (!fetching && data?.exercises) {
      let existingIds: number[] = [];
      let filtered = exercises.concat(data.exercises).filter((c: any) => {
        if (!existingIds.includes(c.id)) {
          existingIds.push(c.id);
          return true;
        } else {
          return false;
        }
      });
      setExercises(filtered);
    }
  }, [fetching, data]);

  const handleSearch = () => {
    setExercises([]);
    setVariables({ searchName: value });
  };
  const handleChange = (event: any) => {
    setValue(event.target.value);
  };
  const handleDelete = async (id: number) => {
    const response = await deleteExercise({ id });
    if (response.data?.deleteExercise && exercises) {
      let updatedExercises = exercises.filter((exercise) => {
        return exercise.id !== id;
      });
      setExercises(updatedExercises);
    } else {
      toast({
        title: "Ups! Something went wrong :(",
        description: "Error while deleting the exercise",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
    toast({
      title: "Success",
      description: "Exercise deleted!",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const difficultyColor = (level: string) => {
    let color = "teal";
    switch (level) {
      case "easy":
        color = "green";
        break;
      case "normal":
        color = "blue";
        break;
      case "hard":
        color = "yellow";
        break;
      case "very difficult":
        color = "red";
        break;
      case "god":
        color = "white";
        break;
      default:
        break;
    }
    return color;
  };

  const headers = (
    <Tr>
      <Th>Id</Th>
      <Th>Name</Th>
      <Th>Description</Th>
      <Th>Difficulty</Th>
      <Th isNumeric>Actions</Th>
    </Tr>
  );

  const emptyBody = (
    <>
      <Table size="lg">
        <Thead>{headers}</Thead>
      </Table>
      <Center mt={32}>
        <Box>
          No Exercises Found.
          <NextLink href="/exercise/create">
            <Link>Go create one!</Link>
          </NextLink>
        </Box>
      </Center>
    </>
  );

  const body = (exercises || []).map((e) => (
    <Tr key={e.id}>
      <Td>{e.id}</Td>
      <Td>
        <NextLink href={`/exercise/edit/${e.id}`}>
          <Link>{e.name}</Link>
        </NextLink>
      </Td>
      <Td>{e.shortDescription}</Td>
      <Td>
        <Tag size="sm" colorScheme={difficultyColor(e.difficulty)}>
          {e.difficulty}
        </Tag>
      </Td>
      <Td isNumeric>
        <IconButton
          onClick={() => {
            if (e.id) {
              handleDelete(e.id);
            }
          }}
          size="sm"
          variant="outline"
          colorScheme="red"
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
  ) : exercises && exercises.length > 0 ? (
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
            Exercises
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
          <Box mr={8}>
            <Button
              colorScheme="teal"
              onClick={() => router.push("/exercise/create")}
            >
              Create
            </Button>
          </Box>
        </Flex>
        {table}
      </Wrapper>
    </>
  );
};

export default withUrqlClient(createUrqlClient)(Exercises);
