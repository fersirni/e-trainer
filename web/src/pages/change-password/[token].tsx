import React, { useState } from "react";
import {
  Center,
  Box,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Wrap,
  WrapItem,
  Button,
  Image,
  InputRightElement,
  useToast,
} from "@chakra-ui/react";
import { Formik, Form, Field } from "formik";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { Wrapper } from "../../components/Wrapper";
import { useChangePasswordMutation } from "../../generated/graphql";
import { toErrorMap } from "../../utils/toErrorMap";

const ChangePassword: NextPage<{ token: string }> = ({ token }) => {
  const router = useRouter();
  const toast = useToast();
  const [show, setShow] = React.useState(false);
  const [, changePassword] = useChangePasswordMutation();
  const handleClick = () => setShow(!show);
  const handleSubmit = async (values: any, { setErrors }: any) => {
    const response = await changePassword({
      newPassword: values.newPassword,
      token,
    });
    if (response.data?.changePassword.errors) {
      const errorMap = toErrorMap(response.data.changePassword.errors);
      if ("token" in errorMap) {
        toast({
          title: "Error",
          description: errorMap.token,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
      setErrors(errorMap);
    } else if (response.data?.changePassword.user) {
      router.push("/");
    }
  };
  const validatePassword = (password?: string) => {
    let error;
    const length = 7;
    if (!password) {
      error = "Required";
    } else if (password.length <= length) {
      error = `Length has to be grater than ${length}`;
    }
    return error;
  };

  return (
    <>
      <Wrapper variant="small">
        <Center>
          <Image
            borderRadius="full"
            boxSize="150px"
            src="https://bit.ly/sage-adebayo"
            alt="Segun Adebayo"
            m={10}
          />
        </Center>
        <Formik initialValues={{ newPassword: "" }} onSubmit={handleSubmit}>
          {({ isSubmitting }) => (
            <Form>
              <Box mt={8}>
                <Field name="newPassword" validate={validatePassword}>
                  {({ field, form }: any) => (
                    <FormControl
                      id="password"
                      isInvalid={
                        form.errors.newPassword && form.touched.newPassword
                      }
                      isRequired
                    >
                      <FormLabel>New Password</FormLabel>
                      <Input
                        {...field}
                        pr="4.5rem"
                        variant="flushed"
                        type={show ? "text" : "password"}
                        placeholder="Enter new password"
                      />
                      <InputRightElement width="4.5rem">
                        <Button h="1.75rem" size="sm" onClick={handleClick}>
                          {show ? "Hide" : "Show"}
                        </Button>
                      </InputRightElement>
                      <FormErrorMessage>
                        {form.errors.newPassword}
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
                      Change password
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
                        router.push("/");
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
      </Wrapper>
    </>
  );
};

ChangePassword.getInitialProps = ({ query }) => {
  return {
    token: query.token as string,
  };
};

export default withUrqlClient(createUrqlClient)(ChangePassword as any );
