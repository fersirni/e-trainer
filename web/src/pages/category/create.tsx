import React, { useEffect, useState } from "react";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { NextPage } from "next";
import { Wrapper } from "../../components/Wrapper";
import { AdminBar } from "../../components/AdminBar";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  Center,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Spinner,
  Switch,
  Table,
  TableCaption,
  Tbody,
  Td,
  Textarea,
  Th,
  Thead,
  Tr,
  useToast,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { Field, Form, Formik } from "formik";
import { useIsAuth } from "../../utils/useIsAuth";
import {
  useCreateCategoryMutation,
  useExercisesQuery,
  useUpdateExercisesMutation,
} from "../../generated/graphql";
import { SearchIcon } from "@chakra-ui/icons";
import { TiPlus, TiTrash } from "react-icons/ti";
import { toErrorMap } from "../../utils/toErrorMap";

const ADDED_STATUS = "added";
const REMOVED_STATUS = "removed";
const CreateCategory: NextPage = () => {
  useIsAuth();
  const toast = useToast();
  const router = useRouter();

  const [category, setCategory] = useState({ exercises: [] } as any);
  const [exercises, setExercises] = useState([] as any[]);
  const [searchExerciseValue, setSearchExerciseValue] = useState("");
  const [variables, setVariables] = useState({ searchName: "" });

  const [, createCategory] = useCreateCategoryMutation();
  const [, updateExercises] = useUpdateExercisesMutation();
  const [{ data, fetching }] = useExercisesQuery({ variables });

  const handleSubmit = async (values: any, { setErrors }: any) => {
    const response = await createCategory({ categoryData: { ...values } });
    if (response.data?.createCategory.errors) {
      setErrors(toErrorMap(response.data.createCategory.errors));
    } else {
      toast({
        title: "Success",
        description: "Category Created!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      // router.push(`/category/edit/${response.data?.createCategory?.category?.id}`)
      setCategory(response.data?.createCategory.category);
    }
  };

  const handleChange = (event: any) => {
    const val = event.target.value;
    setVariables({
      searchName: val,
    });
    setSearchExerciseValue(val);
  };
  const handleSearch = () => {
    setExercises([]);
    setVariables({
      searchName: searchExerciseValue,
    });
  };

  const removeExercise = async (id: number) => {
    const exercise = exercises.find((e: any) => id === e.id);
    const exercisesWithoutAssigned = exercises.filter((e: any) => id !== e.id);
    exercise.status = REMOVED_STATUS;
    const newExercises = [...exercisesWithoutAssigned, exercise];
    setExercises(newExercises);
    const updated = {
      added: [],
      removed: [id],
    };
    await updateExercises({ categoryId: category.id, updated });
  };

  const assignExercise = (id: number) => {
    const exercise = exercises.find((e: any) => id === e.id);
    const exercisesWithoutAssigned = exercises.filter((e: any) => id !== e.id);
    exercise.status = ADDED_STATUS;
    const newExercises = [...exercisesWithoutAssigned, exercise];
    setExercises(newExercises);
    const updated = {
      added: [id],
      removed: [],
    };
    updateExercises({ categoryId: category.id, updated });
  };

  useEffect(() => {
    if (!fetching && data?.exercises) {
      const exercisesList = (data?.exercises || []).map((e: any) => ({
        id: e.id,
        name: e.name,
      }));
      const categoryExercises = (category?.exercises || []).map((e: any) => ({
        id: e.id,
        name: e.name,
        status: ADDED_STATUS,
      }));
      let filteredExercises = [...categoryExercises, ...exercisesList];
      let ids: number[] = [];
      filteredExercises = filteredExercises.filter((e: any) => {
        if (!ids.includes(e.id)) {
          ids.push(e.id);
          return true;
        } else {
          // skip duplicate
          return false;
        }
      });
      setExercises(filteredExercises);
    }
  }, [fetching, data]);

  const getButton = (id: number) => {
    const removeButton = (
      <IconButton
        onClick={() => {
          if (id) {
            removeExercise(id);
          }
        }}
        size="sm"
        variant="outline"
        colorScheme="tomato"
        aria-label="Remove"
        icon={<Icon as={TiTrash} boxSize={6} />}
      />
    );

    const assignButton = (
      <IconButton
        onClick={() => {
          if (id) {
            assignExercise(id);
          }
        }}
        size="sm"
        variant="outline"
        colorScheme="teal"
        aria-label="Assign"
        icon={<Icon as={TiPlus} boxSize={6} />}
      />
    );
    const exercisesAdded: number[] = exercises.map((e: any) => {
      if (e.status === ADDED_STATUS) {
        return e.id;
      }
    });
    if (exercisesAdded?.includes(id)) {
      return removeButton;
    } else {
      return assignButton;
    }
  };

  const headers = (
    <Tr>
      <Th>Id</Th>
      <Th>Name</Th>
      <Th>Owned By</Th>
      <Th isNumeric>Action</Th>
    </Tr>
  );

  const emptyBody = (
    <>
      <Table size="sm">
        <Thead>{headers}</Thead>
      </Table>
      <Center mt={32}>
        <Box>No Exercises found</Box>
      </Center>
    </>
  );

  const notSavedYet = (
    <>
      <Table size="sm">
        <Thead>{headers}</Thead>
      </Table>
      <Center mt={32}>
        <Box>You must save the category before assigning exercises</Box>
      </Center>
    </>
  );

  const body = exercises.map((e: any) => (
    <Tr key={e.id}>
      <Td>{e.id}</Td>
      <Td>{e.name}</Td>
      <Td>Coming Soon!</Td>
      <Td isNumeric>{getButton(e.id)}</Td>
    </Tr>
  ));

  const table = fetching ? (
    <>
      <Table size="sm">
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
  ) : exercises.length > 0 ? (
    <Table size="sm">
      <Thead>{headers}</Thead>
      <Tbody>{body}</Tbody>
      <TableCaption>{`Exercises assigned: ${
        exercises.filter((e: any) => e.status === ADDED_STATUS).length
      }`}</TableCaption>
      <TableCaption>{`Each exercise is owned by one category only.`}</TableCaption>
    </Table>
  ) : (
    emptyBody
  );

  return (
    <>
      <AdminBar goBack="categories" />
      <Wrapper variant="big">
        <Flex>
          <Box flex="1" pr={10}>
            <Heading size="lg">Properties</Heading>
            <Formik initialValues={{}} onSubmit={handleSubmit}>
              {({ isSubmitting }) => (
                <Form>
                  <Box mt={8}>
                    <Field name="name">
                      {({ field, form }: any) => (
                        <FormControl
                          id="name"
                          isInvalid={form.errors.name && form.touched.name}
                          isRequired
                        >
                          <FormLabel htmlFor="name">Category Name</FormLabel>
                          <Input
                            {...field}
                            id="name"
                            placeholder="My Category"
                            variant="flushed"
                          />
                          <FormErrorMessage>
                            {form.errors.name}
                          </FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>
                  </Box>
                  <Box mt={8}>
                    <Field name="description">
                      {({ field, form }: any) => (
                        <FormControl
                          id="description"
                          isInvalid={
                            form.errors.description && form.touched.description
                          }
                        >
                          <FormLabel>Description</FormLabel>
                          <Textarea
                            {...field}
                            placeholder="This category is about..."
                            variant="flushed"
                          />
                          <FormErrorMessage>
                            {form.errors.description}
                          </FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>
                  </Box>
                  <Box mt={8}>
                    <Field name="options">
                      {({ field, form }: any) => (
                        <FormControl
                          id="options"
                          isInvalid={
                            form.errors.options && form.touched.options
                          }
                        >
                          <FormLabel>Advanced Options</FormLabel>
                          <Textarea
                            {...field}
                            placeholder="Expected Json Object"
                            variant="flushed"
                          />
                          <FormErrorMessage>
                            {form.errors.options}
                          </FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>
                  </Box>
                  <Box mt={8}>
                    <Field name="isPublic">
                      {({ field, form }: any) => (
                        <FormControl
                          id="isPublic"
                          display="flex"
                          alignItems="center"
                          isInvalid={
                            form.errors.options && form.touched.options
                          }
                        >
                          <FormLabel htmlFor="isPublic" mb="0">
                            Make it public!
                          </FormLabel>
                          <Switch colorScheme="teal" {...field} id="isPublic" />
                          <FormErrorMessage>
                            {form.errors.options}
                          </FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>
                  </Box>
                  <Wrap mt={10} spacing="30px" justify="center">
                    <WrapItem>
                      <Center>
                        <Button
                          mt={4}
                          type="submit"
                          isLoading={isSubmitting}
                          colorScheme="teal"
                        >
                          Save
                        </Button>
                      </Center>
                    </WrapItem>
                    <WrapItem>
                      <Center>
                        <Button
                          mt={4}
                          type="reset"
                          colorScheme="gray"
                          onClick={() => {
                            router.push("/categories");
                          }}
                        >
                          Cancel
                        </Button>
                      </Center>
                    </WrapItem>
                  </Wrap>
                </Form>
              )}
            </Formik>
          </Box>
          <Box flex="1" pl={10} borderLeft="solid" borderLeftColor="gray.700">
            <Heading size="lg">Exercises</Heading>
            <Box ml="auto" mt={8} mb={8} maxW="xs">
              <InputGroup>
                <Input
                  variant="flushed"
                  value={searchExerciseValue}
                  onChange={handleChange}
                  placeholder="Search by exercise name"
                />
                <InputRightElement width="4.5rem">
                  <Button h="1.75rem" size="sm" onClick={handleSearch}>
                    <SearchIcon color="gray.300" />
                  </Button>
                </InputRightElement>
              </InputGroup>
            </Box>
            {category.id ? table : notSavedYet}
          </Box>
        </Flex>
      </Wrapper>
    </>
  );
};

export default withUrqlClient(createUrqlClient)(CreateCategory as any);
