import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  OneToOne,
  JoinColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { ObjectType, Field, Int } from "type-graphql";
import { User } from "./User";
import { Exercise } from "./Exercise";

@ObjectType()
@Entity()
export class Activity extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  name!: string;

  @Field(() => User)
  @OneToOne(() => User)
  @JoinColumn()
  assignedBy!: User;

  @Field()
  @Column()
  startDate!: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  dueDate?: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @ManyToOne(() => User, (user) => user.activities)
  user: User;

  @Field(() => [Exercise])
  @ManyToMany(() => Exercise)
  @JoinTable()
  exercises: Exercise[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
