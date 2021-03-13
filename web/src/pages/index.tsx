import { NavBar } from "../components/NavBar";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { useUsersQuery } from "../generated/graphql";

const Index = () => {
  const [{ data }] = useUsersQuery();
  return (
    <>
      <NavBar />
      <div>Hello world</div>
      <br />
      {!data
        ? <div>loading...</div>
        : data.users.map((u) => (
            <div key={u._id}>
              {u.name}: {u.email}
            </div>
          ))}
    </>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
