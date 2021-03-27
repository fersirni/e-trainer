import { Dialog } from "../entities/dialogTypes/Dialog";
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
import { AnswerData, AnswerResolver } from "./answer";


@ObjectType()
class DialogResponse {
  @Field(() => [Error], { nullable: true })
  errors?: Error[];
  @Field(() => Dialog, { nullable: true })
  dialog?: Dialog;
}

@InputType()
export class DialogData {
  @Field({ nullable: true })
  id?: number;
  @Field({ nullable: true })
  order?: number;
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
export class DialogResolver {
  private validateDialogData(dialogData: DialogData): Error[] {
    let errors: Error[] = [];
    const {
      id,
      order,
      name,
      options,
      description,
      type,
      answerType,
      data,
      drawData /* exercises */,
    } = dialogData;
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
    console.log(order);
    // console.log(exercises);
    return errors;
  }
  private async validateUpdateDialogData(
    dialogData: DialogData
  ): Promise<DialogResponse> {
    let errors: Error[] = [];
    let dialog;
    const { id } = dialogData;
    if (!id) {
      errors.push(new FieldError("id", "Cannot find dialog without id"));
      return { errors };
    }
    dialog = await Dialog.findOne(id);
    if (!dialog) {
      errors.push(new FieldError("id", `Dialog with id ${id} not found`));
      return { errors };
    }
    errors = await this.validateDialogData(dialogData);
    if (errors.length > 0) {
      return { errors };
    }
    return { dialog };
  }

  getFieldsToUpdate(dialogData: DialogData) {
    let fieldsToUpdate = {};
    const {
      order,
      name,
      options,
      description,
      type,
      answerType,
      data,
      drawData,
    } = dialogData;
    if (order) {
      fieldsToUpdate = { ...fieldsToUpdate, order };
    }
    if (name) {
      fieldsToUpdate = { ...fieldsToUpdate, name };
    }
    if (description) {
      fieldsToUpdate = { ...fieldsToUpdate, description };
    }
    if (options) {
      fieldsToUpdate = { ...fieldsToUpdate, options };
    }
    if (type) {
      fieldsToUpdate = { ...fieldsToUpdate, type };
    }
    if (answerType) {
      fieldsToUpdate = { ...fieldsToUpdate, answerType };
    }
    if (data) {
      fieldsToUpdate = { ...fieldsToUpdate, data };
    }
    if (drawData) {
      fieldsToUpdate = { ...fieldsToUpdate, drawData };
    }
    return fieldsToUpdate;
  }

  @Query(() => Dialog, { nullable: true })
  dialog(@Arg("id") id: number): Promise<Dialog | undefined> {
    return Dialog.findOne(id, { relations: ["answers"] });
  }

  @Query(() => [Dialog])
  dialogs(): Promise<Dialog[]> {
    return Dialog.find({ relations: ["answers"] });
  }

  @Mutation(() => DialogResponse)
  @UseMiddleware(isAuth)
  async createDialog(
    @Arg("stepId") stepId: number,
    @Arg("dialogData") dialogData: DialogData
  ): Promise<DialogResponse> {
    let errors = [];
    let dialog: Dialog;
    errors = this.validateDialogData(dialogData);
    if (errors.length > 0) {
      return { errors };
    }
    try {
      const step = await Step.findOne(stepId);
      if (!step) {
        errors.push(new DBError("step", `Step with id ${stepId} not found`));
        return { errors };
      }
      dialog = await Dialog.create({
        ...dialogData,
      }).save();
      await getConnection()
        .createQueryBuilder()
        .relation(Step, "dialogs")
        .of(step)
        .add(dialog);
    } catch (error) {
      errors.push(new DBError("dialog", error.message));
      console.log(error.message);
      return { errors };
    }
    return { dialog };
  }

  @Mutation(() => DialogResponse)
  @UseMiddleware(isAuth)
  async updateDialog(
    @Arg("dialogData") dialogData: DialogData
  ): Promise<DialogResponse> {
    let { dialog, errors = [] } = await this.validateUpdateDialogData(
      dialogData
    );
    if (errors.length > 0) {
      return { errors };
    }
    if (!dialog) {
      errors.push(new DBError("dialog", "Error while getting the dialog"));
      return { errors };
    }
    const { id } = dialogData;
    const fieldsToUpdate = this.getFieldsToUpdate(dialogData);
    try {
      const answers = dialogData.answers || [];
      const ar = new AnswerResolver();
      for (let i = 0; i < answers.length; i++) {
        const answer = answers[i];
        if (answer.id) {
          await ar.updateAnswer(answer);
        } else {
          await ar.createAnswer(dialog.id, answer);
        }
      } 
      const result = await getConnection()
        .createQueryBuilder()
        .update(Dialog)
        .set(fieldsToUpdate)
        .where("id = :id", { id })
        .returning("*")
        .execute();
      // const result = await Dialog.update({ id: dialog.id }, { ...fieldsToUpdate });
      dialog = result.raw[0];
    } catch (error) {
      console.log(error.message);
      errors.push(new DBError("dialog", error.message));
      return { errors };
    }
    return { dialog };
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteDialog(@Arg("id") id: number): Promise<boolean> {
    try {
      await Dialog.delete(id);
      return true;
    } catch (error) {
      console.log(error.message);
      return false;
    }
  }
}
