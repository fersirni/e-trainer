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
  Flex,
  Select,
} from "@chakra-ui/react";
import { Formik, Form, Field } from "formik";
import { useRouter } from "next/router";
import React from "react";
import {
  useCreateStepMutation,
  useUpdateStepMutation,
} from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";

interface StepConfigurationProps {
  step?: any;
  exerciseId?: any;
  onStepAdded?: any;
}

export const StepConfiguration: React.FC<StepConfigurationProps> = ({
  step,
  exerciseId,
  onStepAdded,
}) => {
  const toast = useToast();
  const router = useRouter();
  const [, updateStep] = useUpdateStepMutation();
  const [, createStep] = useCreateStepMutation();

  const emptyStep = <>There is no step configured yet.</>;

  const handleSubmit = async (values: any, { setErrors }: any) => {
    let response;
    let errors;
    let savedStep;
    if (step?.id) {
      values.id = step.id;
      response = await updateStep({ stepData: { ...values } });
      errors = response.data?.updateStep.errors;
      savedStep = response.data?.updateStep.step;
    } else {
      response = await createStep({ exerciseId, stepData: { ...values } });
      errors = response.data?.createStep.errors;
      savedStep = response.data?.createStep.step;
    }
    if (errors) {
      setErrors(toErrorMap(errors));
      return;
    } else {
      toast({
        title: "Success",
        description: "Saved!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      if (!savedStep) {
        console.error(
          "It looks that something went wrong while retrieveing the step :("
        );
      } else {
        onStepAdded(savedStep);
      }
    }
  };
  const {
    name = "",
    order = 0,
    description = "",
    options = "",
    type = "",
    ttl = 0,
  } = step || {};
  const form = (
    <>
      <Formik
        initialValues={{
          name,
          order,
          description,
          options,
          type,
          ttl,
        }}
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
                        <FormLabel htmlFor="name">Step Name</FormLabel>
                        <Input
                          {...field}
                          id="name"
                          placeholder="Step 1"
                          variant="flushed"
                        />
                        <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                </Box>
                <Box flex="1" pl={10}>
                  <Field name="type">
                    {({ field, form }: any) => (
                      <FormControl
                        id="type"
                        isInvalid={form.errors.type && form.touched.type}
                        isRequired
                      >
                        <FormLabel htmlFor="type">Step Type</FormLabel>
                        <Select
                          placeholder="Select option"
                          variant="flushed"
                          {...field}
                          id="type"
                        >
                          <option value="presentation">Presentation</option>
                          <option value="information">Information</option>
                          <option value="interactive">Interactive</option>
                          <option value="results">Results</option>
                        </Select>
                        <FormErrorMessage>{form.errors.type}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                </Box>
              </Flex>
            </Box>
            <Box mt={8}>
              <Flex>
                <Box flex={1} pr={10}>
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
                          placeholder="This step is about..."
                          variant="flushed"
                        />
                        <FormErrorMessage>
                          {form.errors.description}
                        </FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                </Box>
                <Box flex={1} pl={10}>
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
                        <FormErrorMessage>
                          {form.errors.options}
                        </FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                </Box>
              </Flex>
            </Box>
            <Box mt={8}>
              <Flex>
                <Box flex="1" pr={10}>
                  <Field name="order" pr={4}>
                    {({ field, form }: any) => (
                      <FormControl
                        id="order"
                        isInvalid={form.errors.order && form.touched.order}
                        isRequired
                      >
                        <FormLabel htmlFor="order">Order</FormLabel>
                        <Input
                          {...field}
                          id="order"
                          type="number"
                          placeholder="1"
                          variant="flushed"
                        />
                        <FormErrorMessage>{form.errors.order}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                </Box>
                <Box flex="1" pl={10}>
                  <Field name="ttl">
                    {({ field, form }: any) => (
                      <FormControl
                        id="ttl"
                        isInvalid={form.errors.ttl && form.touched.ttl}
                      >
                        <FormLabel htmlFor="ttl">Duration in seconds</FormLabel>
                        <Input
                          {...field}
                          id="ttl"
                          type="number"
                          placeholder="Empty or 0 waits for 'Next step'"
                          variant="flushed"
                        />
                        <FormErrorMessage>{form.errors.ttl}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                </Box>
              </Flex>
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
    </>
  );
  return <>{form || emptyStep}</>;
};
