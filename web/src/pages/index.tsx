import { NavBar } from "../components/NavBar";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { useMeQuery, useUsersQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";
import { UserAuthentication } from "../components/UserAuthentication";
import { AdminHome } from "../components/AdminHome";

const Index = () => {
  const [{ data: usersData }] = useUsersQuery();
  const [{ data, fetching }] = useMeQuery({
    pause: isServer(),
  });
  let body = null;
  if (fetching) {
  } else if (!data?.me) {
    body = (
      <UserAuthentication />
    )
  } else if(data.me.profile === 'admin') {
    body = (
      <AdminHome />
    );
  } else {
    body = (
      <>
       <AdminHome />
      </>
    );
  }
  return <>{body}</>;
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
