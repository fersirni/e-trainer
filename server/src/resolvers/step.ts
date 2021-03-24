import { Step } from "../entities/Step";
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
import { Exercise } from "../entities/Exercise";
import { QuestionData } from "./question";

const STEP_TYPES = ["presentation", "information", "interactive", "results"];

@ObjectType()
class StepResponse {
  @Field(() => [Error], { nullable: true })
  errors?: Error[];
  @Field(() => Step, { nullable: true })
  step?: Step;
}

@InputType()
export class StepData {
  @Field({ nullable: true })
  id?: number;
  @Field({ nullable: true })
  name?: string;
  @Field({ nullable: true })
  options?: string;
  @Field({ nullable: true })
  description?: string;
  @Field({ nullable: true, defaultValue: 0 })
  ttl?: number;
  @Field({ nullable: true })
  type?: string;
  @Field(() => [QuestionData], { nullable: true })
  questions?: QuestionData[];
}

@Resolver()
export class StepResolver {
  private validateStepData(stepData: StepData): Error[] {
    let errors: Error[] = [];
    const { name, options, description, ttl, type /*, steps */ } = stepData;
    if (name && name.length < 5) {
      return [
        new FieldError("name", "The name length has to be grater than 5"),
      ];
    }
    if (ttl && ttl < 0) {
      return [
        new FieldError("ttl", "TTL value must be grater than or equal to 0"),
      ];
    }
    // Change this using enums or some typed approach
    if (type && !STEP_TYPES.includes(type)) {
      return [new FieldError("type", "Invalid type")];
    }
    // TODO: validate this fields. TBD
    console.log(description);
    console.log(options);
    // console.log(steps);
    return errors;
  }
  private async validateUpdateStepData(
    stepData: StepData
  ): Promise<StepResponse> {
    let errors: Error[] = [];
    let step;
    const { id } = stepData;
    if (!id) {
      errors.push(new FieldError("id", "Cannot find step without id"));
      return { errors };
    }
    step = await Step.findOne(id);
    if (!step) {
      errors.push(new FieldError("id", `Step with id ${id} not found`));
      return { errors };
    }
    errors = this.validateStepData(stepData);
    if (errors.length > 0) {
      return { errors };
    }
    return { step };
  }
  private getFieldsToUpdate(step: Step, stepData: StepData) {
    let fieldsToUpdate = {};
    const { name, options, description, type, ttl /*, questions*/ } = stepData;
    if (name && step.name !== name) {
      fieldsToUpdate = { ...fieldsToUpdate, name };
    }
    if (description && step.description !== description) {
      fieldsToUpdate = { ...fieldsToUpdate, description };
    }
    if (options && step.options !== options) {
      fieldsToUpdate = { ...fieldsToUpdate, options };
    }
    if (type && step.type !== type) {
      fieldsToUpdate = { ...fieldsToUpdate, type };
    }
    if (ttl && step.ttl !== ttl) {
      fieldsToUpdate = { ...fieldsToUpdate, ttl };
    }
    // TODO: Fix this. Probably two lists with the same data will be different.
    // if (questions && step.questions !== questions ) {
    //   fieldsToUpdate = { ...fieldsToUpdate, questions };
    // }
    return fieldsToUpdate;
  }

  @Query(() => Step, { nullable: true })
  step(@Arg("id") id: number): Promise<Step | undefined> {
    return Step.findOne(id, { relations: ["questions"] });
  }

  @Query(() => [Step])
  steps(): Promise<Step[]> {
    return Step.find({ relations: ["questions"] });
  }

  @Mutation(() => StepResponse)
  @UseMiddleware(isAuth)
  async createStep(
    @Arg("exerciseId") exerciseId: number,
    @Arg("stepData") stepData: StepData
  ): Promise<StepResponse> {
    let errors = [];
    let step: Step;
    errors = this.validateStepData(stepData);
    if (errors.length > 0) {
      return { errors };
    }
    try {
      const exercise = await Exercise.findOne(exerciseId);
      if (!exercise) {
        errors.push(
          new DBError("exercise", `Exercise with id ${exerciseId} not found`)
        );
        return { errors };
      }
      step = await Step.create({
        ...stepData,
      }).save();
      await getConnection()
        .createQueryBuilder()
        .relation(Exercise, "steps")
        .of(exercise)
        .add(step);
    } catch (error) {
      errors.push(new DBError("step", error.message));
      console.log(error.message);
      return { errors };
    }
    return { step };
  }

  @Mutation(() => StepResponse)
  @UseMiddleware(isAuth)
  async updateStep(@Arg("stepData") stepData: StepData): Promise<StepResponse> {
    let { step, errors = [] } = await this.validateUpdateStepData(stepData);
    if (errors.length > 0) {
      return { errors };
    }
    if (!step) {
      errors.push(new DBError("step", "Error while getting the step"));
      return { errors };
    }
    let fieldsToUpdate = this.getFieldsToUpdate(step, stepData);
    const { id } = stepData;
    try {
      const result = await getConnection()
        .createQueryBuilder()
        .update(Step)
        .set(fieldsToUpdate)
        .where("id = :id", { id })
        .returning("*")
        .execute();
      // const result = await Step.update({ id: step.id }, { ...fieldsToUpdate });
      step = result.raw[0];
    } catch (error) {
      console.log(error.message);
      errors.push(new DBError("step", error.message));
      return { errors };
    }
    return { step };
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteStep(@Arg("id") id: number): Promise<boolean> {
    try {
      await Step.delete(id);
      return true;
    } catch (error) {
      console.log(error.message);
      return false;
    }
  }
}
