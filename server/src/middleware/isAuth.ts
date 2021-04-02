import { NOT_AUTHENTICATED_MESSAGE } from "../constants";
import { MyContext } from "../types";
import { MiddlewareFn } from "type-graphql";

export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
  if (!context.req.session.userId) {
    throw new Error(NOT_AUTHENTICATED_MESSAGE);
  }
  return next();
};
