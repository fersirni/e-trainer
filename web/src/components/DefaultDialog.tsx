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
import React, { useEffect, useState } from "react";
import {
  useUpdateDialogMutation,
  useCreateDialogMutation,
} from "../generated/graphql";
import { getBase64 } from "../utils/getBase64";
import { toErrorMap } from "../utils/toErrorMap";

interface DefaultDialogProps {
  dialog?: any;
  stepId?: number;
  onDialogAdded?: any;
}

export const DefaultDialog: React.FC<DefaultDialogProps> = ({
  dialog,
  stepId,
  onDialogAdded,
}) => {
  const toast = useToast();
  const router = useRouter();
  const [dialogDataInput, setDialogDataInput] = useState(undefined as any);
  const [, updateDialog] = useUpdateDialogMutation();
  const [, createDialog] = useCreateDialogMutation();

  const emptyDialog = <>There is no dialog configured yet.</>;

  useEffect(() => {
    if (dialog?.type) {
      setDialogDataInput(dialog.type);
    }
  }, []);

  const handleSubmit = async (values: any, { setErrors }: any) => {
    let response;
    let errors;
    let savedDialog;
    if (values) {
      const { dataFile, dataText } = values || {};
      const file: string = getBase64(dataFile) || "";
      const fileName = dataFile?.name;
      delete values.dataFile;
      delete values.dataText;
      values.data = JSON.stringify({
        text: dataText,
        file,
        fileName,
      });
    }
    if (dialog?.id) {
      values.id = dialog.id;
      response = await updateDialog({ dialogData: { ...values } });
      errors = response.data?.updateDialog.errors;
      savedDialog = response.data?.updateDialog.dialog;
    } else {
      if (!stepId) {
        return;
      }
      response = await createDialog({ stepId, dialogData: { ...values } });
      errors = response.data?.createDialog.errors;
      savedDialog = response.data?.createDialog.dialog;
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
      if (!savedDialog) {
        console.error("It looks that something went wrong :(");
      } else {
        onDialogAdded(savedDialog);
      }
    }
  };

  const handleChange = (event: any) => {
    setDialogDataInput(event.target.value);
  };

  const {
    name = "",
    order = 0,
    description = "",
    options = "",
    type = "",
    answerType = "notNeeded",
    drawData = "",
  } = dialog || {};
  let data = dialog?.data;
  try {
    if (data) {
      data = JSON.parse(data);
    }
  } catch (error) {
    console.error("Data could not bge parse to json:", data);
  }
  const { text, file, fileName } = data || {};
  const form = (
    <>
      <Formik
        initialValues={{
          name,
          type,
          data,
          dataText: text,
          dataFile: file,
          fileName,
          order,
          description,
          options,
          answerType,
          drawData,
        }}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, setFieldValue }) => (
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
                        <FormLabel htmlFor="name">Dialog Name</FormLabel>
                        <Input
                          {...field}
                          id="name"
                          placeholder="Dialog 1"
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
                        <FormLabel htmlFor="type">Dialog Type</FormLabel>
                        <Select
                          onClick={handleChange}
                          placeholder="Select option"
                          variant="flushed"
                          {...field}
                          id="type"
                        >
                          <option value="text">Text</option>
                          <option value="image">Image</option>
                          <option value="audio">Audio</option>
                          <option value="video">Video</option>
                        </Select>
                        <FormErrorMessage>{form.errors.type}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                </Box>
              </Flex>
            </Box>
            {dialogDataInput === "text" ? (
              <Box mt={8}>
                <Field name="dataText">
                  {({ field, form }: any) => (
                    <FormControl
                      id="dataText"
                      isInvalid={form.errors.dataText && form.touched.dataText}
                    >
                      <FormLabel>Dialog Text</FormLabel>
                      <Textarea
                        id="dataText"
                        {...field}
                        placeholder="Insert the text here..."
                        variant="flushed"
                      />
                      <FormErrorMessage>{form.errors.data}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
              </Box>
            ) : dialogDataInput === "image" ? (
              <Flex mt={8}>
                <Box flex="1" pr={10}>
                  <Field name="dataFile">
                    {({ field, form }: any) => (
                      <FormControl
                        id="dataFile"
                        isInvalid={
                          form.errors.dataFile && form.touched.dataFile
                        }
                      >
                        <FormLabel>Image</FormLabel>
                        <Input
                          mt={4}
                          mb={2}
                          id="dataFile"
                          type="file"
                          placeholder="Load a new image..."
                          variant="flushed"
                          onChange={(event) => {
                            const files = event?.currentTarget?.files || [];
                            if (files.length > 0) {
                              setFieldValue("dataFile", files[0]);
                            }
                          }}
                        />
                        {fileName ? (
                          <Center backgroundColor="teal">{fileName} saved</Center>
                        ) : (
                          <Center color="tomato">No file saved yet</Center>
                        )}
                        <FormErrorMessage>{form.errors.data}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                </Box>
                <Box flex="1" pl={10}>
                  <Field name="dataText">
                    {({ field, form }: any) => (
                      <FormControl
                        id="dataText"
                        isInvalid={
                          form.errors.dataText && form.touched.dataText
                        }
                      >
                        <FormLabel>Image Description</FormLabel>
                        <Textarea
                          {...field}
                          placeholder="Insert some title or description here..."
                          variant="flushed"
                        />
                        <FormErrorMessage>{form.errors.data}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                </Box>
              </Flex>
            ) : (
              <Box mt={8}>Not implemented yet </Box>
            )}
            <Box mt={8}>
              <Flex>
                <Box flex="1" pr={10}>
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
                          placeholder="This dialog is about..."
                          variant="flushed"
                        />
                        <FormErrorMessage>
                          {form.errors.description}
                        </FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                </Box>
                <Box flex="1" pl={10}>
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
                  Draw data component
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
  return <>{form || emptyDialog}</>;
};
