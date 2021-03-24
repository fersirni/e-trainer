import { Question } from "../entities/questionTypes/Question";
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
import { ANSWER_TYPES, QUESTION_TYPES } from "../constants";
import { AnswerData } from "./answer";


@ObjectType()
class QuestionResponse {
  @Field(() => [Error], { nullable: true })
  errors?: Error[];
  @Field(() => Question, { nullable: true })
  question?: Question;
}

@InputType()
export class QuestionData {
  @Field({ nullable: true })
  id?: number;
  @Field({ nullable: true })
  name?: string;
  @Field({ nullable: true })
  options?: string;
  @Field({ nullable: true })
  description?: string;
  @Field({ nullable: true })
  data?: string;
  @Field({ nullable: true })
  drawData?: string;
  @Field({ nullable: true })
  type?: string;
  @Field({ nullable: true })
  answerType?: string;
  @Field(() => [AnswerData], { nullable: true })
  answers?: AnswerData[];
}

@Resolver()
export class QuestionResolver {
  private validateQuestionData(questionData: QuestionData): Error[] {
    let errors: Error[] = [];
    const {
      id,
      name,
      options,
      description,
      type,
      answerType,
      data,
      drawData /* exercises */,
    } = questionData;
    if (name && name.length < 5) {
      errors.push(
        new FieldError("name", "The name length has to be grater than 5")
      );
      return errors;
    }

    if (!id && !data) {
      return [new FieldError("data", "Data can't be empty")];
    }

    if (!id && !answerType) {
      return [new FieldError("answerType", "Answer type can't be empty")];
    }
    if (type && !QUESTION_TYPES.includes(type)) {
      return [new FieldError("type", "Invalid type")];
    }

    if (answerType && !ANSWER_TYPES.includes(answerType)) {
      return [new FieldError("answerType", "Invalid type")];
    }

    // TODO: validate this fields. TBD
    console.log(description);
    console.log(options);
    console.log(data);
    console.log(drawData);
    // console.log(exercises);
    return errors;
  }
  private async validateUpdateQuestionData(
    questionData: QuestionData
  ): Promise<QuestionResponse> {
    let errors: Error[] = [];
    let question;
    const { id } = questionData;
    if (!id) {
      errors.push(new FieldError("id", "Cannot find question without id"));
      return { errors };
    }
    question = await Question.findOne(id);
    if (!question) {
      errors.push(new FieldError("id", `Question with id ${id} not found`));
      return { errors };
    }
    errors = await this.validateQuestionData(questionData);
    if (errors.length > 0) {
      return { errors };
    }
    return { question };
  }
  private getFieldsToUpdate(question: Question, questionData: QuestionData) {
    let fieldsToUpdate = {};
    const {
      name,
      options,
      description,
      type,
      answerType,
      data,
      drawData,
    } = questionData;
    if (name && question.name !== name) {
      fieldsToUpdate = { ...fieldsToUpdate, name };
    }
    if (description && question.description !== description) {
      fieldsToUpdate = { ...fieldsToUpdate, description };
    }
    if (options && question.options !== options) {
      fieldsToUpdate = { ...fieldsToUpdate, options };
    }
    if (type && question.type !== type) {
      fieldsToUpdate = { ...fieldsToUpdate, type };
    }
    if (answerType && question.answerType !== answerType) {
      fieldsToUpdate = { ...fieldsToUpdate, answerType };
    }
    if (data && question.data !== data) {
      fieldsToUpdate = { ...fieldsToUpdate, data };
    }
    if (drawData && question.drawData !== drawData) {
      fieldsToUpdate = { ...fieldsToUpdate, drawData };
    }

    // TODO: Fix this. Probably two lists with the same data will be different.
    // if (exercises && question.exercises !== exercises) {
    //   fieldsToUpdate = { ...fieldsToUpdate, exercises };
    // }
    return fieldsToUpdate;
  }

  @Query(() => Question, { nullable: true })
  question(@Arg("id") id: number): Promise<Question | undefined> {
    return Question.findOne(id, { relations: ["answers"] });
  }

  @Query(() => [Question])
  questions(): Promise<Question[]> {
    return Question.find({ relations: ["answers"] });
  }

  @Mutation(() => QuestionResponse)
  @UseMiddleware(isAuth)
  async createQuestion(
    @Arg("stepId") stepId: number,
    @Arg("questionData") questionData: QuestionData
  ): Promise<QuestionResponse> {
    let errors = [];
    let question: Question;
    errors = this.validateQuestionData(questionData);
    if (errors.length > 0) {
      return { errors };
    }
    try {
      const step = await Step.findOne(stepId);
      if (!step) {
        errors.push(new DBError("step", `Step with id ${stepId} not found`));
        return { errors };
      }
      question = await Question.create({
        ...questionData,
      }).save();
      await getConnection()
        .createQueryBuilder()
        .relation(Step, "questions")
        .of(step)
        .add(question);
    } catch (error) {
      errors.push(new DBError("question", error.message));
      console.log(error.message);
      return { errors };
    }
    return { question };
  }

  @Mutation(() => QuestionResponse)
  @UseMiddleware(isAuth)
  async updateQuestion(
    @Arg("questionData") questionData: QuestionData
  ): Promise<QuestionResponse> {
    let { question, errors = [] } = await this.validateUpdateQuestionData(
      questionData
    );
    if (errors.length > 0) {
      return { errors };
    }
    if (!question) {
      errors.push(new DBError("question", "Error while getting the question"));
      return { errors };
    }

    let fieldsToUpdate = this.getFieldsToUpdate(question, questionData);
    const { id } = questionData;
    try {
      const result = await getConnection()
        .createQueryBuilder()
        .update(Question)
        .set(fieldsToUpdate)
        .where("id = :id", { id })
        .returning("*")
        .execute();
      // const result = await Question.update({ id: question.id }, { ...fieldsToUpdate });
      question = result.raw[0];
    } catch (error) {
      console.log(error.message);
      errors.push(new DBError("question", error.message));
      return { errors };
    }
    return { question };
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteQuestion(@Arg("id") id: number): Promise<boolean> {
    try {
      await Question.delete(id);
      return true;
    } catch (error) {
      console.log(error.message);
      return false;
    }
  }
}
