import {
  Wrap,
  WrapItem,
  Center,
  Button,
  useToast,
  Heading,
  Box,
} from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import { InputField } from "../components/InputField";
import { Wrapper } from "../components/Wrapper";
import { useForgotPasswordMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

interface ForgotPasswordProps {}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({}) => {
  const [, forgotPassword] = useForgotPasswordMutation();
  const router = useRouter();
  const toast = useToast();
  return (
    <>
      <Wrapper variant="small">
        <Center>
          <Heading paddingBottom={16} paddingTop={16} mb={4} size="lg">
            Forgot your password?
          </Heading>
        </Center>
          <Box paddingBottom={8}>
            Don't worry it happens all the time, we'll send you and email to recover your password!!
          </Box>
        <Formik
          initialValues={{ email: "" }}
          onSubmit={async ({ email }) => {
            if (email) {
              const response = await forgotPassword({ email });
              if (response.data?.forgotPassword) {
                toast({
                  title: "Sent!",
                  description: `Email sent to ${email}`,
                  status: "info",
                  duration: 5000,
                  isClosable: true,
                });
              } else {
                toast({
                  title: "Error!",
                  description: `Failed to send email`,
                  status: "error",
                  duration: 5000,
                  isClosable: true,
                });
              }
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <InputField
                name="email"
                label="Please enter your email"
                placeholder="my@email.com"
              />
              <Wrap mt={10} spacing="30px" justify="center">
                <WrapItem>
                  <Center>
                    <Button
                      mt={4}
                      type="submit"
                      isLoading={isSubmitting}
                      colorScheme="teal"
                    >
                      Send
                    </Button>
                  </Center>
                </WrapItem>
                <WrapItem>
                  <Center>
                    <Button
                      mt={4}
                      type="reset"
                      isLoading={isSubmitting}
                      colorScheme="gray"
                      onClick={() => {
                        router.push("/login");
                      }}
                    >
                      Back
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

export default withUrqlClient(createUrqlClient)(ForgotPassword);
