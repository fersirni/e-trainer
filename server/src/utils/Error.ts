import { Field, ObjectType } from "type-graphql";

@ObjectType()
export abstract class Error {
  constructor(message: string) {
    this.message = message;
  }

  setField(field: string) {
    this.field = field;
  }
  setEntity(entity: string) {
    this.entity = entity;
  }
  setKey(key: string) {
    this.key = key;
  }

  @Field()
  message: string;
  @Field({ nullable: true })
  field: string;
  @Field({ nullable: true })
  entity: string;
  @Field({ nullable: true })
  key: string;
}
export class FieldError extends Error {
  constructor(field: string, message: string) {
    super(message);
    super.setField(field);
  }
}
export class DBError extends Error {
  constructor(entity: string, message: string) {
    super(message);
    super.setEntity(entity);
  }
}
export class CacheError extends Error {
  constructor(key: string, message: string) {
    super(message);
    super.setKey(key);
  }
}
