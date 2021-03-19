import {
  Wrap,
  WrapItem,
  Center,
  Button,
  useToast,
} from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import React from "react";
import { InputField } from "../components/InputField";
import { Wrapper } from "../components/Wrapper";
import { useForgotPasswordMutation } from "../generated/graphql";


interface ForgotPasswordProps {}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({}) => {
  const [, forgotPassword] = useForgotPasswordMutation();
  const router = useRouter();
  const toast = useToast();
  return (
    <>
      <Wrapper variant="small">
        <Formik
          initialValues={{ email: "" }}
          onSubmit={async ({ email }, { setErrors }) => {
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
                label="Email"
                placeholder="example@email.com"
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

export default ForgotPassword;