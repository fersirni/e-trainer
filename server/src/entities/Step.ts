import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { ObjectType, Field, Int } from "type-graphql";
import { Exercise } from "./Exercise";
import { Dialog } from "./dialogTypes/Dialog";

@ObjectType()
@Entity()
export class Step extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  order!: number;

  @Field()
  @Column()
  name!: string;

  @Field()
  @Column({ default: "interactive" })
  type!: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  options?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  ttl?: number;

  @ManyToOne(() => Exercise, (exercise) => exercise.steps, {
    onDelete: "CASCADE",
  })
  exercise: Exercise;

  @Field(() => [Dialog], { nullable: "itemsAndList" })
  @OneToMany(() => Dialog, (dialog) => dialog.step, {
    cascade: true,
    eager: true,
  })
  dialogs: Dialog[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
