import { User } from "../entities/User";
import { MyContext } from "../types";
import {
  Resolver,
  Query,
  Ctx,
  Arg,
  Mutation,
  Field,
  InputType,
  ObjectType,
  UseMiddleware,
} from "type-graphql";
import argon2 from "argon2";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";
import { getConnection, Not } from "typeorm";
import { Error, FieldError, DBError, CacheError } from "../utils/Error";
import { isAuth } from "../middleware/isAuth";

const validateEmail = (email: string) => {
  if (!email) return false;
  email = email.toLowerCase();
  var mailformat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  return email.match(mailformat);
};

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
class UserResponse {
  @Field(() => [Error], { nullable: true })
  errors?: Error[];
  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  static async userUpdate(fieldsToUpdate: {}, _id: number) {
    const result = await getConnection()
      .createQueryBuilder()
      .update(User)
      .set(fieldsToUpdate)
      .where({ _id })
      .returning("*")
      .execute();
    return result.raw[0];
  }

  private async validateRegisterData(
    name: string,
    password: string,
    email: string
  ) {
    let errors = [];
    if (name.length <= 2) {
      errors.push(new FieldError("name", "Length has to be grater than 2"));
    }
    if (password.length <= 7) {
      errors.push(new FieldError("password", "Length has to be grater than 7"));
    }
    if (!validateEmail(email)) {
      errors.push(new FieldError("email", "The email is invalid"));
    }
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      errors.push(new FieldError("email", "The email already taken"));
    }
    return errors;
  }

  private async validateUpdateUser(
    name: string,
    email: string,
    userId: number
  ) {
    let errors = [];
    if (!name || name.length <= 2) {
      errors.push(new FieldError("name", "Length has to be grater than 2"));
    }
    if (!email || !validateEmail(email)) {
      errors.push(new FieldError("email", "The email is invalid"));
    }
    const existingUser = await User.findOne({
      where: { email, _id: Not(userId) },
    });
    if (existingUser) {
      errors.push(new FieldError("email", "The email already taken"));
    }
    return errors;
  }

  @Query(() => User, { nullable: true })
  me(@Ctx() { req }: MyContext) {
    if (!req.session.userId) {
      return null;
    }
    return User.findOne(req.session.userId);
  }

  @Query(() => User, { nullable: true })
  user(@Arg("id") _id: number): Promise<User | undefined> {
    return User.findOne(_id);
  }

  @Query(() => [User])
  users(): Promise<User[]> {
    return User.find();
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("registerData") registerData: RegisterUserData,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const {
      name,
      loginData: { email: emailAddress, password },
    } = registerData;
    const email = emailAddress?.toLowerCase();

    const errors = await this.validateRegisterData(name, password, email);
    if (errors.length > 0) {
      return { errors };
    }

    const hashedPassword = await argon2.hash(password);
    let user;
    try {
      user = await User.create({
        name,
        email,
        password: hashedPassword,
      }).save();
      req.session.userId = user._id;
    } catch (error) {
      errors.push(new DBError("user", error.message));
      console.log(error.message);
      return { errors };
    }
    return { user };
  }

  @Mutation(() => Boolean)
  async unregister(@Arg("id") _id: number): Promise<boolean> {
    try {
      await User.delete(_id);
      return true;
    } catch (error) {
      console.log(error.message);
      return false;
    }
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("loginData") loginData: LoginData,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    let { email, password } = loginData;
    email = email.toLowerCase();

    let errors = [];
    const user = await User.findOne({ where: { email } });
    if (!user) {
      errors.push(new FieldError("email", "The email is does not exist"));
      return { errors };
    }

    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      errors.push(new FieldError("password", "Incorrect password"));
      return { errors };
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
  @UseMiddleware(isAuth)
  async updateUser(
    @Arg("id") _id: number,
    @Arg("name", () => String) name: string,
    @Arg("email", () => String) email: string
  ): Promise<UserResponse> {
    let errors = [];
    let user = await User.findOne(_id);
    if (!user) {
      errors.push(new FieldError("_id", `User with id ${_id} not found`));
      return { errors };
    }
    email = email?.toLowerCase();
    errors = await this.validateUpdateUser(name, email, user._id);
    if (errors.length > 0) {
      return { errors };
    }
    let fieldsToUpdate = {};
    if (user.email !== email) {
      fieldsToUpdate = { ...fieldsToUpdate, email };
    }
    if (user.name !== name) {
      fieldsToUpdate = { ...fieldsToUpdate, name };
    }
    try {
      //await User.update({ _id: user._id }, { ...fieldsToUpdate });
      user = await UserResolver.userUpdate(fieldsToUpdate, _id);
    } catch (error) {
      console.log(error.message);
      errors.push(new DBError("user", error.message));
      return { errors };
    }
    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis }: MyContext
  ) {
    try {
      email = email?.toLowerCase();
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return false;
      }

      const token = v4();
      redis.set(
        FORGET_PASSWORD_PREFIX + token,
        user._id,
        "ex",
        1000 * 60 * 60 * 24
      );
      const resetPasswordLink = `<a href="http://localhost:3000/change-password/${token}">Reset password</a>`;
      await sendEmail(email, resetPasswordLink);
    } catch (error) {
      console.log(error.message);
      return false;
    }
    return true;
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("newPassword") newPassword: string,
    @Arg("token") token: string,
    @Ctx() { redis, req }: MyContext
  ): Promise<UserResponse> {
    let errors = [];
    const key = FORGET_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);
    if (!userId) {
      errors.push(new CacheError("token", "Token expired"));
      return { errors };
    }

    if (newPassword.length <= 7) {
      errors.push(new FieldError("password", "Length has to be grater than 7"));
      return { errors };
    }

    const _id = parseInt(userId);
    let user;
    try {
      user = await User.findOne(_id);
    } catch (error) {
      console.log(error.message);
      errors.push(new DBError("user", error.message));
      return { errors };
    }
    if (!user) {
      errors.push(new CacheError("token", "User no longer exists"));
      return { errors };
    }
    await User.update({ _id }, { password: await argon2.hash(newPassword) });
    req.session.userId = user._id;
    await redis.del(key);
    return { user };
  }
}
