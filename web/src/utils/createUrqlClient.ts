import {
  dedupExchange,
  Exchange,
  fetchExchange,
  stringifyVariables,
} from "urql";
import { cacheExchange, Resolver } from "@urql/exchange-graphcache";
import { betterUpdateQuery } from "../utils/betterUpdateQuery";
import {
  LoginMutation,
  LogoutMutation,
  MeDocument,
  MeQuery,
  RegisterMutation,
  UnregisterMutation,
  UpdateUserMutation,
} from "../generated/graphql";
import { pipe, tap } from "wonka";
import Router from "next/router";

const NOT_AUTHENTICATED_MESSAGE = "Not authenticated";

const errorExchange: Exchange = ({ forward }) => (ops$) => {
  return pipe(
    forward(ops$),
    tap(({ error }) => {
      if (error?.message.includes(NOT_AUTHENTICATED_MESSAGE)) {
        Router.replace("/login");
      }
    })
  );
};

const cursorPagination = (queryName: string, returnType: string): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;
    const allFields = cache.inspectFields(entityKey);
    const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }
    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    const cachedKey = cache.resolve(entityKey, fieldKey) as string;
    // console.log("---------------------");
    // let cachedName = null;
    // if (cachedKey) {
    //   let start = cachedKey.search('searchName') + 10 + 1 + 1 + 1;
    //   let temp = cachedKey.slice(start,cachedKey.length -1);
    //   let end = temp.search("\"");
    //   cachedName = temp.slice(0,end);
    // }
    // console.log('formatedName', cachedName);
    // console.log("param",info.variables.searchName);
    const isItInTheCache = cache.resolve(cachedKey, queryName);
    info.partial = !isItInTheCache;
    const set: any = new Set();
    const results: string[] = [];
    let hasMore = true;
    fieldInfos.forEach((fi) => {
      const key = cache.resolve(entityKey, fi.fieldKey) as string;
      const data = cache.resolve(key, queryName) as string[];
      const _hasMore = cache.resolve(key, "hasMore");
      if (!_hasMore) {
        hasMore = _hasMore as boolean;
      }
      data.forEach(element => {
        set.add(element);
      });
    });
    set.forEach((element: string) => {
      results.push(element);
    });
    return { hasMore, __typename: returnType, [queryName]: results };
  };
};

export const createUrqlClient = (ssrExchange: any) => ({
  url: "http://localhost:4000/graphql",
  fetchOptions: {
    credentials: "include" as const,
  },
  exchanges: [
    dedupExchange,
    cacheExchange({
      keys: {
        PaginatedCategories: () => null,
      },
      resolvers: {
        Query: {
          //categories: cursorPagination("categories", "PaginatedCategories"),
        },
      },
      updates: {
        Mutation: {
          login: (_result, args, cache, info) => {
            betterUpdateQuery<LoginMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              (result, query) => {
                if (result.login.errors) {
                  return query;
                } else {
                  return {
                    me: result.login.user,
                  };
                }
              }
            );
          },
          logout: (_result, args, cache, info) => {
            betterUpdateQuery<LogoutMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              () => {
                return { me: null };
              }
            );
          },
          register: (_result, args, cache, info) => {
            betterUpdateQuery<RegisterMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              (result, query) => {
                if (result.register.errors) {
                  return query;
                } else {
                  return {
                    me: result.register.user,
                  };
                }
              }
            );
          },
          updateUser: (_result, args, cache, info) => {
            betterUpdateQuery<UpdateUserMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              (result, query) => {
                if (result.updateUser.errors) {
                  return query;
                } else {
                  return {
                    me: result.updateUser.user,
                  };
                }
              }
            );
          },
          unregister: (_result, args, cache, info) => {
            betterUpdateQuery<UnregisterMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              (result, query) => {
                if (!result.unregister) {
                  return query;
                } else {
                  return { me: null };
                }
              }
            );
          },
        },
      },
    }),
    errorExchange,
    ssrExchange,
    fetchExchange,
  ],
});
