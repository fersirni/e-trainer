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
import { Category } from "./Category";
import { Step } from "./Step";

@ObjectType()
@Entity()
export class Exercise extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  name!: string;

  @Field()
  @Column()
  creatorId!: number;

  @Field()
  @Column({ default: "easy" })
  difficulty!: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  options?: string;

  @Field({ nullable: true, defaultValue: "(No owner found)" })
  categoryName?: string;

  @Field({ nullable: true })
  @ManyToOne(() => Category, (category) => category.exercises, {
    onDelete: "CASCADE",
    nullable: true,
  })
  category: Category;

  @Field(() => [Step], { nullable: "itemsAndList" })
  @OneToMany(() => Step, (step) => step.exercise, {
    cascade: true,
    eager: true,
  })
  steps: Step[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
