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
import { Step } from "../Step";
import { Answer } from "../answerTypes/Answer";

@ObjectType()
@Entity()
export class Question extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  name!: string;

  @Field()
  @Column()
  data!: string;

  @Field()
  @Column()
  type!: string;

  @Field()
  @Column()
  answerType!: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  options?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  drawData?: string;

  @ManyToOne(() => Step, (step) => step.questions)
  step: Step;

  @OneToMany(() => Answer, (answer) => answer.question)
  answers: Answer[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
