import { Exercise } from "../entities/Exercise";
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
import { Category } from "../entities/Category";
import { StepData, StepResolver } from "./step";
import { Step } from "../entities/Step";

const DIFFICULTY_LEVELS = ["easy", "normal", "hard", "very difficult", "god"];

@ObjectType()
class ExerciseResponse {
  @Field(() => [Error], { nullable: true })
  errors?: Error[];
  @Field(() => Exercise, { nullable: true })
  exercise?: Exercise;
}

@InputType()
export class ExerciseData {
  @Field({ nullable: true })
  id?: number;
  @Field({ nullable: true })
  name?: string;
  @Field({ nullable: true })
  options?: string;
  @Field({ nullable: true })
  description?: string;
  @Field({ nullable: true })
  difficulty?: string;
  @Field(() => [StepData], { nullable: true })
  steps?: StepData[];
}

@Resolver()
export class ExerciseResolver {
  private isIncluded(step: Step, steps: StepData[]): boolean {
    const included = steps.find(s => s.id && s.id === step.id);
    if (included) {
      return true;
    }
    return false;
  }
  private validateExerciseData(exerciseData: ExerciseData): Error[] {
    let errors: Error[] = [];
    const {
      name,
      options,
      description,
      difficulty /*, steps */,
    } = exerciseData;
    if (name && name.length < 5) {
      return [
        new FieldError("name", "The name length has to be grater than 5"),
      ];
    }

    // Change this using enums or some typed approach
    if (difficulty && !DIFFICULTY_LEVELS.includes(difficulty)) {
      return [new FieldError("difficulty", "Invalid difficulty")];
    }
    // TODO: validate this fields. TBD
    console.log(description);
    console.log(options);
    // console.log(exercises);
    return errors;
  }
  private async validateUpdateExerciseData(
    exerciseData: ExerciseData
  ): Promise<ExerciseResponse> {
    let errors: Error[] = [];
    let exercise;
    const { id } = exerciseData;
    if (!id) {
      errors.push(new FieldError("id", "Cannot find exercise without id"));
      return { errors };
    }
    exercise = await Exercise.findOne(id);
    if (!exercise) {
      errors.push(new FieldError("id", `Exercise with id ${id} not found`));
      return { errors };
    }
    errors = this.validateExerciseData(exerciseData);
    if (errors.length > 0) {
      return { errors };
    }
    return { exercise };
  }
  private getFieldsToUpdate(exercise: Exercise, exerciseData: ExerciseData) {
    let fieldsToUpdate = {};
    const { name, options, description, difficulty /*, steps*/ } = exerciseData;
    if (name && exercise.name !== name) {
      fieldsToUpdate = { ...fieldsToUpdate, name };
    }
    if (description && exercise.description !== description) {
      fieldsToUpdate = { ...fieldsToUpdate, description };
    }
    if (options && exercise.options !== options) {
      fieldsToUpdate = { ...fieldsToUpdate, options };
    }
    if (difficulty && exercise.difficulty !== difficulty) {
      fieldsToUpdate = { ...fieldsToUpdate, difficulty };
    }
    return fieldsToUpdate;
  }

  @Query(() => Exercise, { nullable: true })
  exercise(@Arg("id") id: number): Promise<Exercise | undefined> {
    return Exercise.findOne(id, { relations: ["steps"] });
  }

  @Query(() => [Exercise])
  exercises(): Promise<Exercise[]> {
    return Exercise.find({ relations: ["steps"] });
  }

  @Mutation(() => ExerciseResponse)
  @UseMiddleware(isAuth)
  async createExercise(
    @Arg("categoryId") categoryId: number,
    @Arg("exerciseData") exerciseData: ExerciseData
  ): Promise<ExerciseResponse> {
    let errors = [];
    let exercise: Exercise;
    errors = this.validateExerciseData(exerciseData);
    if (errors.length > 0) {
      return { errors };
    }
    try {
      const category = await Category.findOne(categoryId);
      if (!category) {
        errors.push(
          new DBError("category", `Category with id ${categoryId} not found`)
        );
        return { errors };
      }
      exercise = await Exercise.create({
        ...exerciseData,
      }).save();
      await getConnection()
        .createQueryBuilder()
        .relation(Category, "exercises")
        .of(category)
        .add(exercise);
    } catch (error) {
      errors.push(new DBError("exercise", error.message));
      console.log(error.message);
      return { errors };
    }
    return { exercise };
  }

  @Mutation(() => ExerciseResponse)
  @UseMiddleware(isAuth)
  async updateExercise(
    @Arg("exerciseData") exerciseData: ExerciseData
  ): Promise<ExerciseResponse> {
    let { exercise, errors = [] } = await this.validateUpdateExerciseData(
      exerciseData
    );
    if (errors.length > 0) {
      return { errors };
    }
    if (!exercise) {
      errors.push(new DBError("exercise", "Error while getting the exercise"));
      return { errors };
    }
    let fieldsToUpdate = this.getFieldsToUpdate(exercise, exerciseData);
    const { id } = exerciseData;
    try {
      const steps = exerciseData.steps || [];
      const stepsToRemove = exercise.steps.filter( step => !this.isIncluded(step, steps));
      delete exerciseData.id;
      delete exerciseData.steps;
      const sr = new StepResolver();
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        if (step.id) {
          await sr.updateStep(step);
        } else {
          await sr.createStep(exercise.id, step);
        }
      }

      if (stepsToRemove.length > 0) {
        await getConnection()
          .createQueryBuilder()
          .relation(Exercise, "steps")
          .of(exercise) // you can use just post id as well
          .remove(stepsToRemove);
      }
      const result = await getConnection()
        .createQueryBuilder()
        .update(Exercise)
        .set(fieldsToUpdate)
        .where("id = :id", { id })
        .returning("*")
        .execute();
      // const result = await Exercise.update({ id: exercise.id }, { ...fieldsToUpdate });
      exercise = result.raw[0];
    } catch (error) {
      console.log(error.message);
      errors.push(new DBError("exercise", error.message));
      return { errors };
    }
    return { exercise };
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteExercise(@Arg("id") id: number): Promise<boolean> {
    try {
      await Exercise.delete(id);
      return true;
    } catch (error) {
      console.log(error.message);
      return false;
    }
  }
}
