import React from "react";
import { Formik, Form, Field } from "formik";
import { Wrapper } from "../components/Wrapper";
import {
  Box,
  Button,
  Center,
  Image,
  Wrap,
  WrapItem,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  FormHelperText,
  InputRightElement,
} from "@chakra-ui/react";
import { useRegisterMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";

interface registerProps {}

const Register: React.FC<registerProps> = ({}) => {
  const router = useRouter();
  const [{}, register] = useRegisterMutation();
  const [show, setShow] = React.useState(false);
  const handleClick = () => setShow(!show);
  const handleSubmit = async (values: any, { setErrors }: any) => {
    const response = await register(values);
    if (response.data?.register.errors) {
      setErrors(toErrorMap(response.data.register.errors));
    } else if (response.data?.register.user) {
      router.push("/");
    }
  };
  const validateName = (name?: string) => {
    let error;
    const length = 2;
    if (!name) {
      error = "Required";
    } else if (name.length <= length) {
      error = `Length has to be grater than ${length}`;
    }
    return error;
  };
  const validatePassword = (name?: string) => {
    let error;
    const length = 7;
    if (!name) {
      error = "Required";
    } else if (name.length <= length) {
      error = `Length has to be grater than ${length}`;
    }
    return error;
  };
  const validateEmail = (email?: string) => {
    let emailError;
    if (!email) {
      emailError = "Required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      emailError = "Invalid email address";
    }
    return emailError;
  };
  let body = (
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
      <Formik
        initialValues={{name: '', email: '', password: ''}}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            <Box mt={8}>
              <Field name="name" validate={validateName}>
                {({ field, form }: any) => (
                  <FormControl
                    id="name"
                    isInvalid={form.errors.name && form.touched.name}
                    isRequired
                  >
                    <FormLabel htmlFor="name">Full name</FormLabel>
                    <Input
                      {...field}
                      id="name"
                      placeholder="Naruto Uzumaki"
                      variant="flushed"
                    />
                    <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
            </Box>
            <Box mt={8}>
              <Field name="email" validate={validateEmail}>
                {({ field, form }: any) => (
                  <FormControl
                    id="email"
                    isInvalid={form.errors.email && form.touched.email}
                    isRequired
                  >
                    <FormLabel>Email address</FormLabel>
                    <Input
                      type="email"
                      {...field}
                      placeholder="example@email.com"
                      variant="flushed"
                    />
                    <FormHelperText>
                      We'll never share your email.
                    </FormHelperText>
                    <FormErrorMessage>{form.errors.email}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
            </Box>
            <Box mt={8}>
              <Field name="password" validate={validatePassword}>
                {({ field, form }: any) => (
                  <FormControl
                    id="password"
                    isInvalid={form.errors.password && form.touched.password}
                    isRequired
                  >
                    <FormLabel>Password</FormLabel>
                    <Input
                      {...field}
                      pr="4.5rem"
                      variant="flushed"
                      type={show ? "text" : "password"}
                      placeholder="Enter password"
                    />
                    <InputRightElement width="4.5rem">
                      <Button h="1.75rem" size="sm" onClick={handleClick}>
                        {show ? "Hide" : "Show"}
                      </Button>
                    </InputRightElement>
                    <FormErrorMessage>{form.errors.password}</FormErrorMessage>
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
                    Register
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
  );
  return (
    <>{body}</>
  );
};

export default withUrqlClient(createUrqlClient)(Register);
