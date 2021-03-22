import { Category } from "../entities/Category";
import { DBError, Error, FieldError } from "../utils/Error";
import {
  Arg,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { getConnection, Not } from "typeorm";

@ObjectType()
class CategoryResponse {
  @Field(() => [Error], { nullable: true })
  errors?: Error[];
  @Field(() => Category, { nullable: true })
  category?: Category;
}

@Resolver()
export class CategoryResolver {
  private async validateCategoryData(
    name: string, 
    description?: string, 
    options?: string, 
    id?: number) {
    let errors: Error[] = [];
    if (!name || name.length < 5 ) {
      errors.push(new FieldError("name", "The name length has to be grater than 5"))
      return errors;
    }
    const condition = { where: id? { name, id: Not(id) } : { name }};
    const existingCategory = await Category.findOne(condition);
    if (existingCategory) {
      errors.push(new FieldError("name", "The name is already taken"))
      return errors;
    }

    // TODO: validate this fields. TBD
    console.log(description);
    console.log(options);
    return errors;
  }

  @Query(() => Category, { nullable: true })
  category(@Arg("id") id: number): Promise<Category | undefined> {
    return Category.findOne(id);
  }

  @Query(() => [Category])
  categories(): Promise<Category[]> {
    return Category.find();
  }

  @Mutation(() => CategoryResponse)
  async createCategory(
    @Arg("name", () => String) name: string,
    @Arg("description", () => String, { nullable: true }) description?: string,
    @Arg("options", () => String, { nullable: true }) options?: string
  ): Promise<CategoryResponse> {
    let errors = [];
    let category: Category;
    errors = await this.validateCategoryData(name, description, options);
    if (errors.length > 0) {
      return { errors };
    }
    try {
      category = await Category.create({ name, description, options }).save();
    } catch (error) {
      errors.push(new DBError("user", error.message));
      console.log(error.message);
      return { errors };
    }
    return { category };
  }

  @Mutation(() => CategoryResponse)
  async updateCategory(
    @Arg("id") id: number,
    @Arg("name", () => String) name: string,
    @Arg("description", () => String, { nullable: true }) description?: string,
    @Arg("options", () => String,  { nullable: true }) options?: string
  ): Promise<CategoryResponse> {
    let errors = [];
    let category = await Category.findOne(id);
    if (!category) {
      errors.push(new FieldError("id", `Category with id ${id} not found`));
      return { errors };
    }
    errors = await this.validateCategoryData(name, description, options, id);

    if (errors.length > 0) {
      return { errors };
    }
    let fieldsToUpdate = {};
    if (category.name !== name) {
      fieldsToUpdate = { ...fieldsToUpdate, name };
    }
    if (category.description !== description) {
      fieldsToUpdate = { ...fieldsToUpdate, description };
    }
    if (category.options !== options) {
      fieldsToUpdate = { ...fieldsToUpdate, options };
    }
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
      errors.push(new DBError("user", error.message));
      return { errors };
    }
    return { category };
  }


  @Mutation(() => Boolean)
  async deleteCategory(@Arg("id") id: number): Promise<boolean> {
    try {
      await Category.delete(id);
      return true;
    } catch (error) {
      console.log(error.message);
      return false;
    }
  }
}
