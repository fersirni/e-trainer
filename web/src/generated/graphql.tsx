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
  answer?: Maybe<Answer>;
  answers: Array<Answer>;
  dialog?: Maybe<Dialog>;
  dialogs: Array<Dialog>;
  step?: Maybe<Step>;
  steps: Array<Step>;
  exercise?: Maybe<Exercise>;
  exercises: Array<Exercise>;
  category?: Maybe<Category>;
  categories: Array<Category>;
};


export type QueryUserArgs = {
  id: Scalars['Float'];
};


export type QueryAnswerArgs = {
  id: Scalars['Float'];
};


export type QueryDialogArgs = {
  id: Scalars['Float'];
};


export type QueryStepArgs = {
  id: Scalars['Float'];
};


export type QueryExerciseArgs = {
  id: Scalars['Float'];
};


export type QueryCategoryArgs = {
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
  currentActivity?: Maybe<Activity>;
  activities?: Maybe<Array<Activity>>;
  categories?: Maybe<Array<Category>>;
  createdAt: Scalars['String'];
  updatedAt: Scalars['String'];
};

export type Activity = {
  __typename?: 'Activity';
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
  steps?: Maybe<Array<Maybe<Step>>>;
  createdAt: Scalars['String'];
  updatedAt: Scalars['String'];
};

export type Step = {
  __typename?: 'Step';
  id: Scalars['Int'];
  order: Scalars['Float'];
  name: Scalars['String'];
  type: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  options?: Maybe<Scalars['String']>;
  ttl?: Maybe<Scalars['Float']>;
  dialogs?: Maybe<Array<Maybe<Dialog>>>;
  createdAt: Scalars['String'];
  updatedAt: Scalars['String'];
};

export type Dialog = {
  __typename?: 'Dialog';
  id: Scalars['Int'];
  order: Scalars['Float'];
  name: Scalars['String'];
  data: Scalars['String'];
  type: Scalars['String'];
  answerType: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  options?: Maybe<Scalars['String']>;
  drawData?: Maybe<Scalars['String']>;
  answers?: Maybe<Array<Maybe<Answer>>>;
  createdAt: Scalars['String'];
  updatedAt: Scalars['String'];
};

export type Answer = {
  __typename?: 'Answer';
  id: Scalars['Int'];
  data: Scalars['String'];
  isCorrect: Scalars['Boolean'];
  type: Scalars['String'];
  drawData?: Maybe<Scalars['String']>;
  createdAt: Scalars['String'];
  updatedAt: Scalars['String'];
};

export type Category = {
  __typename?: 'Category';
  id: Scalars['Int'];
  name: Scalars['String'];
  isPublic: Scalars['Boolean'];
  creatorId: Scalars['Float'];
  description?: Maybe<Scalars['String']>;
  options?: Maybe<Scalars['String']>;
  exercises?: Maybe<Array<Maybe<Exercise>>>;
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
  createAnswer: AnswerResponse;
  updateAnswer: AnswerResponse;
  deleteAnswer: Scalars['Boolean'];
  createDialog: DialogResponse;
  updateDialog: DialogResponse;
  deleteDialog: Scalars['Boolean'];
  createStep: StepResponse;
  updateStep: StepResponse;
  deleteStep: Scalars['Boolean'];
  createExercise: ExerciseResponse;
  updateExercise: ExerciseResponse;
  deleteExercise: Scalars['Boolean'];
  updateSteps: Scalars['Boolean'];
  createCategory: CategoryResponse;
  updateCategory: CategoryResponse;
  deleteCategory: Scalars['Boolean'];
  updateExercises: Scalars['Boolean'];
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


export type MutationCreateAnswerArgs = {
  answerData: AnswerData;
  dialogId: Scalars['Float'];
};


export type MutationUpdateAnswerArgs = {
  answerData: AnswerData;
};


export type MutationDeleteAnswerArgs = {
  id: Scalars['Float'];
};


export type MutationCreateDialogArgs = {
  dialogData: DialogData;
  stepId: Scalars['Float'];
};


export type MutationUpdateDialogArgs = {
  dialogData: DialogData;
};


export type MutationDeleteDialogArgs = {
  id: Scalars['Float'];
};


export type MutationCreateStepArgs = {
  stepData: StepData;
  exerciseId: Scalars['Float'];
};


export type MutationUpdateStepArgs = {
  stepData: StepData;
};


export type MutationDeleteStepArgs = {
  id: Scalars['Float'];
};


export type MutationCreateExerciseArgs = {
  exerciseData: ExerciseData;
  categoryId: Scalars['Float'];
};


export type MutationUpdateExerciseArgs = {
  exerciseData: ExerciseData;
};


export type MutationDeleteExerciseArgs = {
  id: Scalars['Float'];
};


export type MutationUpdateStepsArgs = {
  added: UpdatedSteps;
  removed: UpdatedSteps;
  exerciseId: Scalars['Float'];
};


export type MutationCreateCategoryArgs = {
  categoryData: CategoryData;
};


export type MutationUpdateCategoryArgs = {
  categoryData: CategoryData;
};


export type MutationDeleteCategoryArgs = {
  id: Scalars['Float'];
};


export type MutationUpdateExercisesArgs = {
  added: UpdatedExercises;
  removed: UpdatedExercises;
  categoryId: Scalars['Float'];
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

export type AnswerResponse = {
  __typename?: 'AnswerResponse';
  errors?: Maybe<Array<Error>>;
  answer?: Maybe<Answer>;
};

export type AnswerData = {
  id?: Maybe<Scalars['Float']>;
  data?: Maybe<Scalars['String']>;
  drawData?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  isCorrect?: Maybe<Scalars['Boolean']>;
};

export type DialogResponse = {
  __typename?: 'DialogResponse';
  errors?: Maybe<Array<Error>>;
  dialog?: Maybe<Dialog>;
};

export type DialogData = {
  id?: Maybe<Scalars['Float']>;
  order?: Maybe<Scalars['Float']>;
  name?: Maybe<Scalars['String']>;
  options?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  data?: Maybe<Scalars['String']>;
  drawData?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  answerType?: Maybe<Scalars['String']>;
  answers?: Maybe<Array<AnswerData>>;
};

export type StepResponse = {
  __typename?: 'StepResponse';
  errors?: Maybe<Array<Error>>;
  step?: Maybe<Step>;
};

export type StepData = {
  id?: Maybe<Scalars['Float']>;
  order?: Maybe<Scalars['Float']>;
  name?: Maybe<Scalars['String']>;
  options?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  ttl?: Maybe<Scalars['Float']>;
  type?: Maybe<Scalars['String']>;
  dialogs?: Maybe<Array<DialogData>>;
};

export type ExerciseResponse = {
  __typename?: 'ExerciseResponse';
  errors?: Maybe<Array<Error>>;
  exercise?: Maybe<Exercise>;
};

export type ExerciseData = {
  id?: Maybe<Scalars['Float']>;
  name?: Maybe<Scalars['String']>;
  options?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  difficulty?: Maybe<Scalars['String']>;
  steps?: Maybe<Array<StepData>>;
};

export type UpdatedSteps = {
  ids?: Maybe<Array<Scalars['Int']>>;
};

export type CategoryResponse = {
  __typename?: 'CategoryResponse';
  errors?: Maybe<Array<Error>>;
  category?: Maybe<Category>;
};

export type CategoryData = {
  id?: Maybe<Scalars['Float']>;
  name?: Maybe<Scalars['String']>;
  options?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  isPublic?: Maybe<Scalars['Boolean']>;
  exercises?: Maybe<Array<ExerciseData>>;
};

export type UpdatedExercises = {
  ids?: Maybe<Array<Scalars['Int']>>;
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