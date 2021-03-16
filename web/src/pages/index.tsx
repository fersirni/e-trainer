import { NavBar } from "../components/NavBar";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { useMeQuery, useUsersQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";
import { UserAuthentication } from "../components/UserAuthentication";
import { AdminHome } from "../components/AdminHome";

const Index = () => {
  const [{ data: userData }] = useUsersQuery();
  const [{ data, fetching }] = useMeQuery({
    pause: isServer(),
  });
  let body = null;
  if (fetching) {
  } else if (!data?.me) {
    body = (
      <UserAuthentication />
    )
  } else if(data.me._id === 15) { // Change this to admin profile
    body = (
      <AdminHome />
    );
  } else {
    body = (
      <>
        <NavBar />
        <div>Hello world</div>
      <br />
      {!userData
        ? <div>loading...</div>
        : userData.users.map((u) => (
            <div key={u._id}>
              {u.name}: {u.email}
            </div>
          ))}
      </>
    );
  }
  return <>{body}</>;
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
