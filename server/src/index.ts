import "reflect-metadata"; // typeorm and grpahql needs this to work correctly
import { COOKIE_NAME, __prod__ } from "./constants";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./resolvers/user";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import cors from "cors";
import { createConnection } from "typeorm";
import { User } from "./entities/User";
import argon2 from "argon2";
import { Routine } from "./entities/Routine";
import { Category } from "./entities/Category";
import { Exercise } from "./entities/Exercise";
import { Step } from "./entities/Step";
import { Dialog } from "./entities/dialogTypes/Dialog";
import { Answer } from "./entities/answerTypes/Answer";
import { CategoryResolver } from "./resolvers/category";
import { ExerciseResolver } from "./resolvers/exercise";
import { StepResolver } from "./resolvers/step";
import { DialogResolver } from "./resolvers/dialog";
import { AnswerResolver } from "./resolvers/answer";

const main = async () => {
  await createConnection({
    type: "postgres",
    database: "e-trainer",
    username: "postgres",
    password: "postgres",
    logging: true,
    synchronize: true,
    entities: [User, Routine, Category, Exercise, Step, Dialog, Answer],
  });

  const app = express();

  const RedisStore = connectRedis(session);
  const redis = new Redis();
  const redisStore = new RedisStore({
    client: redis,
    disableTouch: true,
  });
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );
  app.use(
    session({
      name: COOKIE_NAME,
      store: redisStore,
      cookie: {
        httpOnly: true,
        secure: __prod__, // cookie only works iin https
        sameSite: "lax", // csrf
        maxAge: 1000 * 60 * 60 * 24, // One day
      },
      saveUninitialized: false,
      secret: "asdasdsadsa",
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [
        UserResolver,
        CategoryResolver,
        ExerciseResolver,
        StepResolver,
        DialogResolver,
        AnswerResolver
      ],
      validate: false,
    }),
    context: ({ req, res }) => ({ req, res, redis }),
  });

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  const admin = await User.findOne({ where: { email: "admin@admin.com" } });
  if (!admin) {
    await User.create({
      name: "Admin",
      email: "admin@admin.com",
      password: await argon2.hash("admin"),
      profile: "admin",
    }).save();
  }

  app.listen(4000, () => {
    console.log("server started on localhost:4000");
  });
};

main().catch((err) => {
  console.error(err);
});
