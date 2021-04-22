import {
  Box,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Textarea,
  Wrap,
  WrapItem,
  Center,
  Button,
  useToast,
  Spinner,
  Flex,
  Select,
} from "@chakra-ui/react";
import { Formik, Form, Field } from "formik";
import { useRouter } from "next/router";
import React from "react";
import { Exercise, useExerciseQuery, useUpdateExerciseMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";

interface ExerciseConfigurationProps {
  exerciseId: number;
}

export const ExerciseConfiguration: React.FC<ExerciseConfigurationProps> = ({
  exerciseId,
}) => {
  const toast = useToast();
  const router = useRouter();
  const [, updateExercise ] = useUpdateExerciseMutation();
  const [{ data, fetching }] = useExerciseQuery({
    variables: { id: exerciseId },
  });

  const handleSubmit = async (values: any, { setErrors }: any) => {
    values.id = exerciseId;
    const response = await updateExercise({ exerciseData: { ...values } });
    if (response.data?.updateExercise.errors) {
      setErrors(toErrorMap(response.data.updateExercise.errors));
    } else {
      toast({
        title: "Success",
        description: "Exercise Updated!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getForm = (exercise: Exercise) => {
    const { name, difficulty, description, options } = exercise || {};
    return (
      <Formik
        initialValues={
          {
            name, difficulty, description, options
          }
        }
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            <Box mt={8}>
              <Flex>
                <Box flex="1" pr={10}>
                  <Field name="name" pr={4}>
                    {({ field, form }: any) => (
                      <FormControl
                        id="name"
                        isInvalid={form.errors.name && form.touched.name}
                        isRequired
                      >
                        <FormLabel htmlFor="name">Exercise Name</FormLabel>
                        <Input
                          {...field}
                          id="name"
                          placeholder="Exercise 1"
                          variant="flushed"
                        />
                        <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                </Box>
                <Box flex="1" pl={10}>
                  <Field name="difficulty">
                    {({ field, form }: any) => (
                      <FormControl
                        id="difficulty"
                        isInvalid={
                          form.errors.difficulty && form.touched.difficulty
                        }
                        isRequired
                      >
                        <FormLabel htmlFor="difficulty">
                          Difficulty Level
                        </FormLabel>
                        <Select
                          defaultValue="easy"
                          placeholder="Select option"
                          variant="flushed"
                          {...field}
                          id="difficulty"
                        >
                          <option value="easy">Easy</option>
                          <option value="normal">Normal</option>
                          <option value="hard">Hard</option>
                          <option value="very difficult">Very difficult</option>
                          <option value="god">GOD</option>
                        </Select>
                        <FormErrorMessage>
                          {form.errors.difficulty}
                        </FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                </Box>
              </Flex>
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
                      placeholder="This exercise is about..."
                      variant="flushed"
                    />
                    <FormErrorMessage>{form.errors.description}</FormErrorMessage>
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
                      router.push("/exercises");
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
    )
  };

  const spinner = (
    <Center mt={32}>
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color="blue.500"
        size="xl"
      />
    </Center>
  );

  let form = null;
  if (!fetching && data?.exercise) {
    form = getForm(data.exercise as Exercise);
  }

  return <>{form || spinner}</>;
};
