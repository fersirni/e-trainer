import gql from 'graphql-tag';
import * as Urql from 'urql';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** The javascript `Date` as string. Type represents date and time as the ISO Date string. */
  DateTime: any;
};

export type Query = {
  __typename?: 'Query';
  me?: Maybe<User>;
  user?: Maybe<User>;
  users: Array<User>;
};


export type QueryUserArgs = {
  id: Scalars['Float'];
};

export type User = {
  __typename?: 'User';
  _id: Scalars['Int'];
  name: Scalars['String'];
  email: Scalars['String'];
  password: Scalars['String'];
  profile: Scalars['String'];
  profilePicture?: Maybe<Scalars['String']>;
  activeRoutine?: Maybe<Routine>;
  routines: Array<Routine>;
  createdAt: Scalars['String'];
  updatedAt: Scalars['String'];
};

export type Routine = {
  __typename?: 'Routine';
  id: Scalars['Int'];
  name: Scalars['String'];
  assignedBy: User;
  startDate: Scalars['DateTime'];
  dueDate?: Maybe<Scalars['DateTime']>;
  description?: Maybe<Scalars['String']>;
  exercises: Array<Exercise>;
  createdAt: Scalars['String'];
  updatedAt: Scalars['String'];
};


export type Exercise = {
  __typename?: 'Exercise';
  id: Scalars['Int'];
  name: Scalars['String'];
  difficulty: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  options?: Maybe<Scalars['String']>;
  steps: Array<Step>;
  createdAt: Scalars['String'];
  updatedAt: Scalars['String'];
};

export type Step = {
  __typename?: 'Step';
  id: Scalars['Int'];
  name: Scalars['String'];
  type: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  options?: Maybe<Scalars['String']>;
  ttl?: Maybe<Scalars['Float']>;
  createdAt: Scalars['String'];
  updatedAt: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  register: UserResponse;
  unregister: Scalars['Boolean'];
  login: UserResponse;
  logout: Scalars['Boolean'];
  updateUser: UserResponse;
  forgotPassword: Scalars['Boolean'];
  changePassword: UserResponse;
};


export type MutationRegisterArgs = {
  registerData: RegisterUserData;
};


export type MutationUnregisterArgs = {
  id: Scalars['Float'];
};


export type MutationLoginArgs = {
  loginData: LoginData;
};


export type MutationUpdateUserArgs = {
  email: Scalars['String'];
  name: Scalars['String'];
  id: Scalars['Float'];
};


export type MutationForgotPasswordArgs = {
  email: Scalars['String'];
};


export type MutationChangePasswordArgs = {
  token: Scalars['String'];
  newPassword: Scalars['String'];
};

export type UserResponse = {
  __typename?: 'UserResponse';
  errors?: Maybe<Array<Error>>;
  user?: Maybe<User>;
};

export type Error = {
  __typename?: 'Error';
  message: Scalars['String'];
  field?: Maybe<Scalars['String']>;
  entity?: Maybe<Scalars['String']>;
  key?: Maybe<Scalars['String']>;
};

export type RegisterUserData = {
  name: Scalars['String'];
  loginData: LoginData;
};

export type LoginData = {
  email: Scalars['String'];
  password: Scalars['String'];
};

export type RegularErrorFragment = (
  { __typename?: 'Error' }
  & Pick<Error, 'message' | 'field' | 'key' | 'entity'>
);

export type RegularUserFragment = (
  { __typename?: 'User' }
  & Pick<User, '_id' | 'name' | 'email'>
);

export type RegularUserResponseFragment = (
  { __typename?: 'UserResponse' }
  & { user?: Maybe<(
    { __typename?: 'User' }
    & RegularUserFragment
  )>, errors?: Maybe<Array<(
    { __typename?: 'Error' }
    & RegularErrorFragment
  )>> }
);

export type ChangePasswordMutationVariables = Exact<{
  token: Scalars['String'];
  newPassword: Scalars['String'];
}>;


export type ChangePasswordMutation = (
  { __typename?: 'Mutation' }
  & { changePassword: (
    { __typename?: 'UserResponse' }
    & RegularUserResponseFragment
  ) }
);

export type ForgotPasswordMutationVariables = Exact<{
  email: Scalars['String'];
}>;


export type ForgotPasswordMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'forgotPassword'>
);

export type LoginMutationVariables = Exact<{
  loginData: LoginData;
}>;


export type LoginMutation = (
  { __typename?: 'Mutation' }
  & { login: (
    { __typename?: 'UserResponse' }
    & RegularUserResponseFragment
  ) }
);

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'logout'>
);

export type RegisterMutationVariables = Exact<{
  name: Scalars['String'];
  email: Scalars['String'];
  password: Scalars['String'];
}>;


export type RegisterMutation = (
  { __typename?: 'Mutation' }
  & { register: (
    { __typename?: 'UserResponse' }
    & RegularUserResponseFragment
  ) }
);

export type UnregisterMutationVariables = Exact<{
  id: Scalars['Float'];
}>;


export type UnregisterMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'unregister'>
);

export type UpdateUserMutationVariables = Exact<{
  id: Scalars['Float'];
  email: Scalars['String'];
  name: Scalars['String'];
}>;


export type UpdateUserMutation = (
  { __typename?: 'Mutation' }
  & { updateUser: (
    { __typename?: 'UserResponse' }
    & RegularUserResponseFragment
  ) }
);

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = (
  { __typename?: 'Query' }
  & { me?: Maybe<(
    { __typename?: 'User' }
    & Pick<User, 'profile'>
    & RegularUserFragment
  )> }
);

export type UsersQueryVariables = Exact<{ [key: string]: never; }>;


export type UsersQuery = (
  { __typename?: 'Query' }
  & { users: Array<(
    { __typename?: 'User' }
    & RegularUserFragment
  )> }
);

export const RegularUserFragmentDoc = gql`
    fragment RegularUser on User {
  _id
  name
  email
}
    `;
export const RegularErrorFragmentDoc = gql`
    fragment RegularError on Error {
  message
  field
  key
  entity
}
    `;
export const RegularUserResponseFragmentDoc = gql`
    fragment RegularUserResponse on UserResponse {
  user {
    ...RegularUser
  }
  errors {
    ...RegularError
  }
}
    ${RegularUserFragmentDoc}
${RegularErrorFragmentDoc}`;
export const ChangePasswordDocument = gql`
    mutation ChangePassword($token: String!, $newPassword: String!) {
  changePassword(token: $token, newPassword: $newPassword) {
    ...RegularUserResponse
  }
}
    ${RegularUserResponseFragmentDoc}`;

export function useChangePasswordMutation() {
  return Urql.useMutation<ChangePasswordMutation, ChangePasswordMutationVariables>(ChangePasswordDocument);
};
export const ForgotPasswordDocument = gql`
    mutation ForgotPassword($email: String!) {
  forgotPassword(email: $email)
}
    `;

export function useForgotPasswordMutation() {
  return Urql.useMutation<ForgotPasswordMutation, ForgotPasswordMutationVariables>(ForgotPasswordDocument);
};
export const LoginDocument = gql`
    mutation Login($loginData: LoginData!) {
  login(loginData: $loginData) {
    ...RegularUserResponse
  }
}
    ${RegularUserResponseFragmentDoc}`;

export function useLoginMutation() {
  return Urql.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument);
};
export const LogoutDocument = gql`
    mutation Logout {
  logout
}
    `;

export function useLogoutMutation() {
  return Urql.useMutation<LogoutMutation, LogoutMutationVariables>(LogoutDocument);
};
export const RegisterDocument = gql`
    mutation Register($name: String!, $email: String!, $password: String!) {
  register(
    registerData: {name: $name, loginData: {email: $email, password: $password}}
  ) {
    ...RegularUserResponse
  }
}
    ${RegularUserResponseFragmentDoc}`;

export function useRegisterMutation() {
  return Urql.useMutation<RegisterMutation, RegisterMutationVariables>(RegisterDocument);
};
export const UnregisterDocument = gql`
    mutation Unregister($id: Float!) {
  unregister(id: $id)
}
    `;

export function useUnregisterMutation() {
  return Urql.useMutation<UnregisterMutation, UnregisterMutationVariables>(UnregisterDocument);
};
export const UpdateUserDocument = gql`
    mutation UpdateUser($id: Float!, $email: String!, $name: String!) {
  updateUser(id: $id, name: $name, email: $email) {
    ...RegularUserResponse
  }
}
    ${RegularUserResponseFragmentDoc}`;

export function useUpdateUserMutation() {
  return Urql.useMutation<UpdateUserMutation, UpdateUserMutationVariables>(UpdateUserDocument);
};
export const MeDocument = gql`
    query Me {
  me {
    ...RegularUser
    profile
  }
}
    ${RegularUserFragmentDoc}`;

export function useMeQuery(options: Omit<Urql.UseQueryArgs<MeQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<MeQuery>({ query: MeDocument, ...options });
};
export const UsersDocument = gql`
    query Users {
  users {
    ...RegularUser
  }
}
    ${RegularUserFragmentDoc}`;

export function useUsersQuery(options: Omit<Urql.UseQueryArgs<UsersQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<UsersQuery>({ query: UsersDocument, ...options });
};