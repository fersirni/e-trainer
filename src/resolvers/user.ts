
import { User } from "../entities/User";
import { MyContext } from "../types";
import { Resolver, Query, Ctx, Arg, Mutation, Field, InputType, ObjectType } from "type-graphql";
import argon2 from "argon2";

const validateEmail = (email: string) => {
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

    @Mutation(() => UserResponse)
    async register(
        @Arg("registerData") registerData: RegisterUserData,
        @Ctx() { em }: MyContext
    ): Promise<UserResponse> {
        const { name, loginData: { email: emailAddress, password } } = registerData;
        const email = emailAddress.toLowerCase();
        if (name.length <= 2) {
            return { errors: [{ field: "name", message: "Length has to be grater than 2" }] };
        }
        if (password.length <= 8) {
            return { errors: [{ field: "password", message: "Length has to be grater than 8" }] };
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
        } catch (error) {
            console.log(error.message);
        }
        return { user };
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg("loginData") loginData: LoginData,
        @Ctx() { em }: MyContext
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

        return { user };
    }

    @Mutation(() => User, { nullable: true })
    async updateUser(
        @Arg("id") _id: number,
        @Arg("name", () => String, { nullable: true }) name: string,
        @Arg("email", () => String, { nullable: true }) email: string,
        @Ctx() { em }: MyContext
    ): Promise<User | null> {
        const user = await em.findOne(User, { _id });
        if (!user) {
            return null;
        }
        if (typeof name !== undefined || typeof email !== undefined) {
            if (name) user.name = name;
            if (email) user.email = email.toLowerCase();
            await em.persistAndFlush(user);
        }
        return user;
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