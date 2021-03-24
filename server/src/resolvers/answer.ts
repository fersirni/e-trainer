import { Answer } from "../entities/answerTypes/Answer";
import { DBError, Error, FieldError } from "../utils/Error";
import {
  Arg,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { getConnection } from "typeorm";
import { isAuth } from "../middleware/isAuth";
import { Step } from "../entities/Step";
import { ANSWER_TYPES } from "../constants";
import { Question } from "../entities/questionTypes/Question";


@ObjectType()
class AnswerResponse {
  @Field(() => [Error], { nullable: true })
  errors?: Error[];
  @Field(() => Answer, { nullable: true })
  answer?: Answer;
}

@InputType()
export class AnswerData {
  @Field({ nullable: true })
  id?: number;
  @Field({ nullable: true })
  data?: string;
  @Field({ nullable: true })
  drawData?: string;
  @Field({ nullable: true })
  type?: string;
  @Field({ nullable: true })
  isCorrect?: boolean;
}

@Resolver()
export class AnswerResolver {
  private validateAnswerData(answerData: AnswerData): Error[] {
    let errors: Error[] = [];
    const {
      id,
      type,
      data,
      drawData /* exercises */,
    } = answerData;

    if (!id && !data) {
      return [new FieldError("data", "Data can't be empty")];
    }

    if (type && !ANSWER_TYPES.includes(type)) {
      return [new FieldError("type", "Invalid type")];
    }

    // TODO: validate this fields. TBD
    console.log(drawData);
    return errors;
  }
  private async validateUpdateAnswerData(
    answerData: AnswerData
  ): Promise<AnswerResponse> {
    let errors: Error[] = [];
    let answer;
    const { id } = answerData;
    if (!id) {
      errors.push(new FieldError("id", "Cannot find answer without id"));
      return { errors };
    }
    answer = await Answer.findOne(id);
    if (!answer) {
      errors.push(new FieldError("id", `Answer with id ${id} not found`));
      return { errors };
    }
    errors = await this.validateAnswerData(answerData);
    if (errors.length > 0) {
      return { errors };
    }
    return { answer };
  }
  private getFieldsToUpdate(answer: Answer, answerData: AnswerData) {
    let fieldsToUpdate = {};
    const {
      type,
      isCorrect,
      data,
      drawData,
    } = answerData;

    if (type && answer.type !== type) {
      fieldsToUpdate = { ...fieldsToUpdate, type };
    }
    if (typeof  isCorrect === 'boolean' && answer.isCorrect !== isCorrect) {
      fieldsToUpdate = { ...fieldsToUpdate, isCorrect };
    }
    if (data && answer.data !== data) {
      fieldsToUpdate = { ...fieldsToUpdate, data };
    }
    if (drawData && answer.drawData !== drawData) {
      fieldsToUpdate = { ...fieldsToUpdate, drawData };
    }
    return fieldsToUpdate;
  }

  @Query(() => Answer, { nullable: true })
  answer(@Arg("id") id: number): Promise<Answer | undefined> {
    return Answer.findOne(id);
  }

  @Query(() => [Answer])
  answers(): Promise<Answer[]> {
    return Answer.find();
  }

  @Mutation(() => AnswerResponse)
  @UseMiddleware(isAuth)
  async createAnswer(
    @Arg("questionId") questionId: number,
    @Arg("answerData") answerData: AnswerData
  ): Promise<AnswerResponse> {
    let errors = [];
    let answer: Answer;
    errors = this.validateAnswerData(answerData);
    if (errors.length > 0) {
      return { errors };
    }
    try {
      const question = await Question.findOne(questionId);
      if (!question) {
        errors.push(new DBError("question", `Question with id ${questionId} not found`));
        return { errors };
      }
      answer = await Answer.create({
        ...answerData,
      }).save();
      await getConnection()
        .createQueryBuilder()
        .relation(Question, "answers")
        .of(question)
        .add(answer);
    } catch (error) {
      errors.push(new DBError("answer", error.message));
      console.log(error.message);
      return { errors };
    }
    return { answer };
  }

  @Mutation(() => AnswerResponse)
  @UseMiddleware(isAuth)
  async updateAnswer(
    @Arg("answerData") answerData: AnswerData
  ): Promise<AnswerResponse> {
    let { answer, errors = [] } = await this.validateUpdateAnswerData(
      answerData
    );
    if (errors.length > 0) {
      return { errors };
    }
    if (!answer) {
      errors.push(new DBError("answer", "Error while getting the answer"));
      return { errors };
    }

    let fieldsToUpdate = this.getFieldsToUpdate(answer, answerData);
    const { id } = answerData;
    try {
      const result = await getConnection()
        .createQueryBuilder()
        .update(Answer)
        .set(fieldsToUpdate)
        .where("id = :id", { id })
        .returning("*")
        .execute();
      // const result = await Answer.update({ id: answer.id }, { ...fieldsToUpdate });
      answer = result.raw[0];
    } catch (error) {
      console.log(error.message);
      errors.push(new DBError("answer", error.message));
      return { errors };
    }
    return { answer };
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteAnswer(@Arg("id") id: number): Promise<boolean> {
    try {
      await Answer.delete(id);
      return true;
    } catch (error) {
      console.log(error.message);
      return false;
    }
  }
}
