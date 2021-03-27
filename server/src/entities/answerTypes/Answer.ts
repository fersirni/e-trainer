import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
} from "typeorm";
import { ObjectType, Field, Int } from "type-graphql";
import { Dialog } from "../dialogTypes/Dialog";

@ObjectType()
@Entity()
export class Answer extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  data!: string;

  @Field()
  @Column({default: true})
  isCorrect!: boolean;

  @Field()
  @Column()
  type!: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  drawData?: string;

  @ManyToOne(() => Dialog, (dialog) => dialog.answers, {
    onDelete: "CASCADE",
  })
  dialog: Dialog;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
