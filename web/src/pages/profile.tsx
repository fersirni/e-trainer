import React from "react";
import { Formik, Form } from "formik";
import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";
import { Box, Button} from "@chakra-ui/react";
import { useMeQuery, useUpdateUserMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";
import { createUrqlClient } from "../utils/createUrqlClient";
import { withUrqlClient } from "next-urql";

interface profileProps {}

const Profile: React.FC<profileProps> = ({}) => {
  const router = useRouter();
  const [{ data: currentUserData }] = useMeQuery();
  const [{}, updateUser] = useUpdateUserMutation();
  let name: string;
  let email: string;
  if (currentUserData?.me) {
    name = currentUserData.me.name;
    email = currentUserData.me.email;
  }
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ id: -1, name: "", email: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await updateUser(values);
          if (response.data?.updateUser.errors) {
            setErrors(toErrorMap(response.data.updateUser.errors));
          } else if (response.data?.updateUser.user) {
            router.push("/");
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <Box>
              <InputField
                name="name"
                label="Full name"
                placeholder="Naruto Uzumaki"
              />
            </Box>
            <Box mt={4}>
              <InputField
                name="email"
                label="Email"
                placeholder="example@email.com"
              />
            </Box>
            <Button
              mt={4}
              type="submit"
              isLoading={isSubmitting}
              colorScheme="teal"
            >
              Save
            </Button>
            <Button
              mt={4}
              type="reset"
              isLoading={isSubmitting}
              colorScheme="gray"
            >
              Cancel
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(Profile);
