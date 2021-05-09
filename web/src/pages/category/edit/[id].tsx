import React, { useEffect, useState } from "react";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../../../utils/createUrqlClient";
import { NextPage } from "next";
import { Wrapper } from "../../../components/Wrapper";
import { AdminBar } from "../../../components/AdminBar";
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
  Link,
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
import { useIsAuth } from "../../../utils/useIsAuth";
import {
  useCategoryQuery,
  useExercisesQuery,
  useUpdateCategoryMutation,
  useUpdateExercisesMutation,
} from "../../../generated/graphql";
import { SearchIcon } from "@chakra-ui/icons";
import NextLink from "next/link";
import { TiPlus, TiTrash } from "react-icons/ti";
import { toErrorMap } from "../../../utils/toErrorMap";

const ADDED_STATUS = "added";
const REMOVED_STATUS = "removed";
const EditCategory: NextPage = () => {
  useIsAuth();
  const toast = useToast();
  const router = useRouter();
  const { id } = router.query || {};
  const categoryId: number = id
    ? typeof id === "string"
      ? parseInt(id)
      : -1
    : -1;

  const [category, setCategory] = useState({ exercises: [] } as any);
  const [exercises, setExercises] = useState([] as any[]);
  const [searchExerciseValue, setSearchExerciseValue] = useState("");
  const [variables, setVariables] = useState({ searchName: "" });

  const [, updateCategory] = useUpdateCategoryMutation();
  const [, updateExercises] = useUpdateExercisesMutation();
  const [{ data, fetching }] = useCategoryQuery({
    variables: { id: categoryId },
  });
  const [
    { data: exercisesData, fetching: fetchingExercises },
  ] = useExercisesQuery({
    variables,
  });
  const handleSubmit = async (values: any, { setErrors }: any) => {
    values.id = categoryId;
    const response = await updateCategory({ categoryData: { ...values } });
    if (response.data?.updateCategory.errors) {
      setErrors(toErrorMap(response.data.updateCategory.errors));
    } else {
      toast({
        title: "Success",
        description: "Category Updated!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
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
    exercise.categoryName = "(No owner found)";
    const newExercises = [...exercisesWithoutAssigned, exercise];
    setExercises(newExercises);
    const updated = {
      added: [],
      removed: [id],
    };
    await updateExercises({ categoryId, updated });
  };
  const assignExercise = (id: number) => {
    const exercise = exercises.find((e: any) => id === e.id);
    const exercisesWithoutAssigned = exercises.filter((e: any) => id !== e.id);
    exercise.status = ADDED_STATUS;
    exercise.categoryName = "This category";
    const newExercises = [...exercisesWithoutAssigned, exercise];
    setExercises(newExercises);
    const updated = {
      added: [id],
      removed: [],
    };
    updateExercises({ categoryId, updated });
  };

  useEffect(() => {
    if (!fetching && data?.category) {
      document.title = data.category.name || "Category";
      setCategory(data.category);
    }
  }, [fetching, data]);

  useEffect(() => {
    if (!fetchingExercises && exercisesData?.exercises) {
      const exercisesList = (exercisesData?.exercises || []).map((e: any) => ({
        id: e.id,
        name: e.name,
        categoryName: e.categoryName || "(No owner found)",
      }));
      const categoryExercises = (category?.exercises || []).map((e: any) => ({
        id: e.id,
        name: e.name,
        categoryName: "This cateogry",
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
  }, [fetchingExercises, exercisesData]);

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
        colorScheme="red"
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
    <Tr zIndex={1} position="sticky" top={0}>
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

  const body = exercises.map((e: any) => (
    <Tr key={e.id}>
      <Td>{e.id}</Td>
      <Td>
        <NextLink href={`/exercise/edit/${e.id}`}>
          <Link>{e.name}</Link>
        </NextLink>
      </Td>
      <Td>{e.categoryName}</Td>
      <Td isNumeric>{getButton(e.id)}</Td>
    </Tr>
  ));

  const table = fetchingExercises ? (
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
    <>
      <Box maxH={96} overflowY="auto">
        <Table size="sm">
          <Thead>{headers}</Thead>

          <Tbody>{body}</Tbody>
        </Table>
      </Box>
      <Table size="sm">
        <TableCaption>{`Exercises assigned: ${
          exercises.filter((e: any) => e.status === ADDED_STATUS).length
        }`}</TableCaption>
      </Table>
    </>
  ) : (
    emptyBody
  );

  const getForm = (category: any) => {
    const { name, isPublic, description, options } = category || {};
    return (
      <Formik
        initialValues={{ name, isPublic, description, options }}
        onSubmit={handleSubmit}
      >
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
                    <FormErrorMessage>{form.errors.name}</FormErrorMessage>
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
                    isInvalid={form.errors.options && form.touched.options}
                  >
                    <FormLabel>Advanced Options</FormLabel>
                    <Textarea
                      {...field}
                      placeholder="Expected Json Object"
                      variant="flushed"
                    />
                    <FormErrorMessage>{form.errors.options}</FormErrorMessage>
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
                    isInvalid={form.errors.options && form.touched.options}
                  >
                    <FormLabel htmlFor="isPublic" mb="0">
                      Make it public!
                    </FormLabel>
                    <Switch
                      colorScheme="teal"
                      {...field}
                      isChecked={isPublic}
                      id="isPublic"
                    />
                    <FormErrorMessage>{form.errors.options}</FormErrorMessage>
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
    );
  };
  let updateForm = null;
  if (!fetching && data?.category) {
    updateForm = getForm(data.category);
  }

  return (
    <>
      <AdminBar goBack="categories" />
      <Wrapper variant="big">
        <Flex>
          <Box flex="1" pr={10}>
            <Heading size="lg">Properties</Heading>
            {updateForm}
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
            {table}
          </Box>
        </Flex>
      </Wrapper>
    </>
  );
};

export default withUrqlClient(createUrqlClient)(EditCategory as any);
