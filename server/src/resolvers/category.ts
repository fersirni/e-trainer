import { Category } from "../entities/Category";
import { CacheError, DBError, Error, FieldError } from "../utils/Error";
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
import { getConnection, Not } from "typeorm";
import { MyContext } from "../types";
import { User } from "../entities/User";
import { isAuth } from "../middleware/isAuth";
import { ExerciseData } from "./exercise";

@ObjectType()
class CategoryResponse {
  @Field(() => [Error], { nullable: true })
  errors?: Error[];
  @Field(() => Category, { nullable: true })
  category?: Category;
}

@InputType()
class UpdatedExercises {
  @Field(() => [Int], {defaultValue: []})
  ids: number[]
}

@InputType()
class CategoryData {
  @Field({ nullable: true })
  id?: number;
  @Field({ nullable: true })
  name?: string;
  @Field({ nullable: true })
  options?: string;
  @Field({ nullable: true })
  description?: string;
  @Field({ nullable: true, defaultValue: false })
  isPublic?: boolean;
  @Field(() => [ExerciseData], { nullable: true })
  exercises?: ExerciseData[];
}

@Resolver()
export class CategoryResolver {
  private async validateCategoryData(
    categoryData: CategoryData
  ): Promise<Error[]> {
    let errors: Error[] = [];
    const { id, name, options, description } = categoryData;
    if (name && name.length < 5) {
      errors.push(
        new FieldError("name", "The name length has to be grater than 5")
      );
      return errors;
    }
    const condition = { where: id ? { name, id: Not(id) } : { name } };
    const existingCategory = await Category.findOne(condition);
    if (existingCategory) {
      errors.push(new FieldError("name", "The name is already taken"));
      return errors;
    }
    // TODO: validate this fields. TBD
    console.log(description);
    console.log(options);
    // console.log(exercises);
    return errors;
  }
  private async validateUpdateCategoryData(
    categoryData: CategoryData
  ): Promise<CategoryResponse> {
    let errors: Error[] = [];
    let category;
    const { id } = categoryData;
    if (!id) {
      errors.push(new FieldError("id", "Cannot find category without id"));
      return { errors };
    }
    category = await Category.findOne(id);
    if (!category) {
      errors.push(new FieldError("id", `Category with id ${id} not found`));
      return { errors };
    }
    errors = await this.validateCategoryData(categoryData);
    if (errors.length > 0) {
      return { errors };
    }
    return { category };
  }
  private getFieldsToUpdate(category: Category, categoryData: CategoryData) {
    let fieldsToUpdate = {};
    const { name, options, description, isPublic } = categoryData;
    if (name && category.name !== name) {
      fieldsToUpdate = { ...fieldsToUpdate, name };
    }
    if (description && category.description !== description) {
      fieldsToUpdate = { ...fieldsToUpdate, description };
    }
    if (options && category.options !== options) {
      fieldsToUpdate = { ...fieldsToUpdate, options };
    }
    if (typeof isPublic === "boolean" && category.isPublic !== isPublic) {
      fieldsToUpdate = { ...fieldsToUpdate, isPublic };
    }
    return fieldsToUpdate;
  }

  @Query(() => Category, { nullable: true })
  category(@Arg("id") id: number): Promise<Category | undefined> {
    return Category.findOne(id, { relations: ["exercises"] });
  }

  @Query(() => [Category])
  async categories(): Promise<Category[]> {
    return Category.find({ relations: ["exercises"], order: { name: "ASC"} });
  }

  @Mutation(() => CategoryResponse)
  @UseMiddleware(isAuth)
  async createCategory(
    @Ctx() { req }: MyContext,
    @Arg("categoryData") categoryData: CategoryData
  ): Promise<CategoryResponse> {
    let errors = [];
    let category: Category;
    errors = await this.validateCategoryData(categoryData);
    if (errors.length > 0) {
      return { errors };
    }
    try {
      const _id = req.session.userId;
      const user = await User.findOne({ where: { _id } });
      if (!user) {
        errors.push(new DBError("user", `User with id ${_id} not found`));
        return { errors };
      }
      category = await Category.create({
        ...categoryData,
        creatorId: req.session.userId,
      }).save();
      await getConnection()
        .createQueryBuilder()
        .relation(User, "categories")
        .of(user)
        .add(category);
    } catch (error) {
      errors.push(new DBError("category", error.message));
      console.log(error.message);
      return { errors };
    }
    return { category };
  }

  @Mutation(() => CategoryResponse)
  @UseMiddleware(isAuth)
  async updateCategory(
    @Arg("categoryData") categoryData: CategoryData,
    @Ctx() { req }: MyContext
  ): Promise<CategoryResponse> {
    let { category, errors = [] } = await this.validateUpdateCategoryData(
      categoryData
    );
    if (errors.length > 0) {
      return { errors };
    }
    if (!category) {
      errors.push(new DBError("category", "Error while getting the category"));
      return { errors };
    }
    if (category.creatorId !== req.session.userId) {
      errors.push(
        new CacheError(
          "token",
          "You don't have permissions to update this category"
        )
      );
      return { errors };
    }
    let fieldsToUpdate = this.getFieldsToUpdate(category, categoryData);
    const { id } = categoryData;
    try {
      const result = await getConnection()
        .createQueryBuilder()
        .update(Category)
        .set(fieldsToUpdate)
        .where("id = :id", { id })
        .returning("*")
        .execute();
      // const result = await Category.update({ id: category.id }, { ...fieldsToUpdate });
      category = result.raw[0];
    } catch (error) {
      console.log(error.message);
      errors.push(new DBError("category", error.message));
      return { errors };
    }
    return { category };
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteCategory(@Arg("id") id: number): Promise<boolean> {
    try {
      await Category.delete(id);
      return true;
    } catch (error) {
      console.log(error.message);
      return false;
    }
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async updateExercises(
    @Arg("categoryId") id: number,
    @Arg("removed") removed: UpdatedExercises,
    @Arg("added") added: UpdatedExercises
  ): Promise<Boolean> {
    try {
      await getConnection()
        .createQueryBuilder()
        .relation(Category, "exercises")
        .of(id)
        .addAndRemove(added.ids, removed.ids);
      return true;
    } catch (error) {
      console.log(error.message);
      return false;
    }
  }
}
