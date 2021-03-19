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
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useForgotPasswordMutation, useMeQuery, useUnregisterMutation, useUpdateUserMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";
import { createUrqlClient } from "../utils/createUrqlClient";
import { withUrqlClient } from "next-urql";
import { isServer } from "../utils/isServer";

interface profileProps {}

const Profile: React.FC<profileProps> = ({}) => {
  const router = useRouter();
  const [{ data: currentUserData, fetching }] = useMeQuery({
    pause: isServer(),
  });
  const toast = useToast();
  const [{}, updateUser] = useUpdateUserMutation();
  const [{}, unregister] = useUnregisterMutation();
  const [, forgotPassword] = useForgotPasswordMutation();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();
  const handleSubmit = async (values: any, { setErrors }: any) => {
    values.id = currentUserData?.me?._id;
    const response = await updateUser(values);
    if (response.data?.updateUser.errors) {
      setErrors(toErrorMap(response.data.updateUser.errors));
    } else if (response.data?.updateUser.user) {
      router.push("/");
    }
  };
  const handleUnregister = async () => {
    const id = currentUserData?.me?._id;
    if (id) {
      const response = await unregister({id});
      if (response.data?.unregister) {
        onClose();
        router.push('/');
      }
    }
  };

  const handleChangePassword = async () => {
    const email = currentUserData?.me?.email;
    if (email) {
      const response = await forgotPassword({email});
      if (response.data?.forgotPassword) {
        toast({
          title: "Sent!",
          description: `Email sent to ${email}`,
          status: "info",
          duration: 5000,
          isClosable: true,
        });
      }
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
  const validateEmail = (email?: string) => {
    let emailError;
    if (!email) {
      emailError = "Required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      emailError = "Invalid email address";
    }
    return emailError;
  };
  let body = null;
  if (fetching) {
  } else if (currentUserData?.me) {
    let { _id: id, name, email } = currentUserData.me;
    body = (
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
        <Formik initialValues={{ id, name, email }} onSubmit={handleSubmit}>
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
                        placeholder="name"
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
        <Center mt={8}>
          <Button w={'100%'} colorScheme="blue" onClick={handleChangePassword}>Change password</Button>
        </Center>
        <Center mt={8}>
          <Button w={'100%'} colorScheme="red" onClick={onOpen}>Delete account</Button>
          <AlertDialog
            motionPreset="slideInBottom"
            leastDestructiveRef={cancelRef as any}
            onClose={onClose}
            isOpen={isOpen}
            isCentered
          >
            <AlertDialogOverlay />

            <AlertDialogContent>
              <AlertDialogHeader>Unregister</AlertDialogHeader>
              <AlertDialogCloseButton />
              <AlertDialogBody>
                Are you sure you want to delete your account?
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button ref={cancelRef as any} onClick={onClose}>
                  No
                </Button>
                <Button colorScheme="red" ml={3} onClick={handleUnregister}>
                  Yes
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Center>
      </Wrapper>
    );
  }
  return <>{body}</>;
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Profile);

