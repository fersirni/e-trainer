import { Exercise } from "../entities/Exercise";
import { DBError, Error, FieldError } from "../utils/Error";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { getConnection } from "typeorm";
import { isAuth } from "../middleware/isAuth";
import { Category } from "../entities/Category";
import { StepData } from "./step";
import { MyContext } from "../types";
import { User } from "../entities/User";

const DIFFICULTY_LEVELS = ["easy", "normal", "hard", "very difficult", "god"];

@ObjectType()
class ExerciseResponse {
  @Field(() => [Error], { nullable: true })
  errors?: Error[];
  @Field(() => Exercise, { nullable: true })
  exercise?: Exercise;
}

@InputType()
class UpdatedSteps {
  @Field(() => [Int], {defaultValue: []})
  ids: number[]
}

@InputType()
export class ExerciseData {
  @Field({ nullable: true })
  id?: number;
  @Field({ nullable: true })
  name?: string;
  @Field({ nullable: true })
  creatorId?: number;
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
  private validateExerciseData(exerciseData: ExerciseData): Error[] {
    let errors: Error[] = [];
    const {
      name,
      options,
      description,
      difficulty,
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
    const { id, creatorId } = exerciseData;
    if (!id) {
      errors.push(new FieldError("id", "Cannot find exercise without id"));
      return { errors };
    }
    const creator = await User.findOne(creatorId);
    if (!creator || creator._id !== creatorId) {
      errors.push(new FieldError("creatorId", `You don't ahve permissions to update this exercise`));
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
    const { name, options, description, difficulty } = exerciseData;
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
  
  @UseMiddleware(isAuth)
  @Query(() => [Exercise])
  async exercises(
    @Ctx() { req }: MyContext,
    @Arg("searchName", () => String, { nullable: true })
    searchName: string | null,
    ): Promise<Exercise[]> {
      const search: string = searchName || "";
      const { userId } = req.session || {};
      const query = `
        select exercise.* from exercise
        where exercise."creatorId" = ${userId}
        and exercise.name LIKE '%${search}%'
        order by exercise.name;
        `;
      return getConnection().query(query);
      // return Exercise.find({ relations: ["steps"] });
    } 
      
  @Mutation(() => ExerciseResponse)
  @UseMiddleware(isAuth)
  async createExercise(
    @Ctx() { req }: MyContext,
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
        creatorId: req.session.userId
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
      const result = await getConnection()
        .createQueryBuilder()
        .update(Exercise)
        .set(fieldsToUpdate)
        .where("id = :id", { id })
        .returning("*")
        .execute();
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

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async updateSteps(
    @Arg("exerciseId") id: number,
    @Arg("removed") removed: UpdatedSteps,
    @Arg("added") added: UpdatedSteps
  ): Promise<Boolean> {
    try {
      await getConnection()
        .createQueryBuilder()
        .relation(Exercise, "steps")
        .of(id)
        .addAndRemove(added.ids, removed.ids);
      return true;
    } catch (error) {
      console.log(error.message);
      return false;
    }
  }
}
