
import { User } from "../entities/User";
import { MyContext } from "../types";
import { Resolver, Query, Ctx, Arg, Mutation, Field, InputType, ObjectType } from "type-graphql";
import argon2 from "argon2";
import { COOKIE_NAME } from "../constants";

const validateEmail = (email: string) => {
    if (!email) return false;
    email = email.toLowerCase();
    var mailformat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    return email.match(mailformat);
}

@InputType()
class LoginData {
    @Field()
    email: string;
    @Field()
    password: string;
}

@InputType()
class RegisterUserData {
    @Field()
    name: string;
    @Field()
    loginData: LoginData;
}

@ObjectType()
class FieldError {
    @Field()
    field: string;
    @Field()
    message: string;
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];
    @Field(() => User, { nullable: true })
    user?: User;
}

@Resolver()
export class UserResolver {
    @Query(() => [User])
    users(@Ctx() { em }: MyContext): Promise<User[]> {
        return em.find(User, {});
    }

    @Query(() => User, { nullable: true })
    user(
        @Arg("id") _id: number,
        @Ctx() { em }: MyContext
    ): Promise<User | null> {
        return em.findOne(User, { _id });
    }

    @Query(() => User, { nullable: true })
    async me(@Ctx() { em, req }: MyContext) {
        if (!req.session.userId) {
            return null;
        }
        const user = await em.findOne(User, { _id: req.session.userId });
        return user;

    }

    @Mutation(() => UserResponse)
    async register(
        @Arg("registerData") registerData: RegisterUserData,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        const { name, loginData: { email: emailAddress, password } } = registerData;
        const email = emailAddress.toLowerCase();
        if (name.length <= 2) {
            return { errors: [{ field: "name", message: "Length has to be grater than 2" }] };
        }
        if (password.length <= 7) {
            return { errors: [{ field: "password", message: "Length has to be grater than 7" }] };
        }
        if (!validateEmail(email)) {
            return { errors: [{ field: "email", message: "The email is invalid" }] };
        }
        const existingUser = await em.findOne(User, { email });
        if (existingUser) {
            return { errors: [{ field: "email", message: "The email already taken" }] };
        }
        const hashedPassword = await argon2.hash(password);
        const user = em.create(User, { name, email, password: hashedPassword });
        
        try {
            await em.persistAndFlush(user);
            req.session.userId = user._id;
        } catch (error) {
            console.log(error.message);
        }
        return { user };
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg("loginData") loginData: LoginData,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        const { email: emailAddress, password } = loginData;
        const email = emailAddress.toLowerCase();
        const user = await em.findOne(User, { email });
        if (!user) {
            return { errors: [{ field: 'email', message: 'The email is does not exist' }] };
        }
        const valid = await argon2.verify(user.password, password);
        if (!valid) {
            return { errors: [{ field: 'password', message: 'Incorrect password' }] };
        }

        req.session.userId = user._id;
        
        return { user };
    }

    @Mutation(() => Boolean)
    logout(@Ctx() { req, res }: MyContext) {
      return new Promise((resolve) =>
        req.session.destroy((err) => {
          res.clearCookie(COOKIE_NAME);
          if (err) {
            console.log(err);
            resolve(false);
            return;
          }
  
          resolve(true);
        })
      );
    }

    @Mutation(() => UserResponse)
    async updateUser(
        @Arg("id") _id: number,
        @Arg("name", () => String) name: string,
        @Arg("email", () => String) email: string,
        @Ctx() { em }: MyContext
    ): Promise<UserResponse> {
        const user = await em.findOne(User, { _id });
        if (!user) {
            return { errors: [{ field: '_id', message: `User with id ${_id} not found` }] };
        }
        if (!name || name.length <= 2) {
            return { errors: [{ field: "name", message: "Length has to be grater than 2" }] };
        }
        if (!email || !validateEmail(email)) {
            return { errors: [{ field: "email", message: "The email is invalid" }] };
        }
        email = email.toLowerCase();
        const existingUser = await em.findOne(User, { email });
        if (existingUser && _id !== existingUser._id) {
            return { errors: [{ field: "email", message: "The email already taken" }] };
        }
        if (user.email !== email) {
            user.email = email;
        }
        if (user.name !== name) {
            user.name = name;
        }
        try {
            await em.persistAndFlush(user);
        } catch (error) {
            console.log(error.message);
        }
        return { user };
    }

    @Mutation(() => Boolean)
    async unregister(
        @Arg("id") _id: number,
        @Ctx() { em }: MyContext
    ): Promise<boolean> {
        await em.nativeDelete(User, { _id });            
        return true;
    }
}