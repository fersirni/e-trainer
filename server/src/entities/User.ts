import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { ObjectType, Field, Int } from "type-graphql";
import { Routine } from "./Routine";
import { Category } from "./Category";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  _id!: number;

  @Field()
  @Column()
  name!: string;

  @Field()
  @Column({ unique: true })
  email!: string;

  @Field()
  @Column()
  password!: string;

  @Field()
  @Column()
  profile: string = 'user';

  @Field({ nullable: true })
  @Column({ nullable: true })
  profilePicture?: string;

  @Field({ nullable: true })
  @OneToOne(() => Routine)
  @JoinColumn()
  activeRoutine?: Routine;

  @Field(() => [Routine], { nullable: true })
  @OneToMany(() => Routine, (routine) => routine.user)
  routines: Routine[];

  @Field(() => [Category], { nullable: true })
  @ManyToMany(() => Category, { cascade: true, eager: true })
  @JoinTable()
  categories : Category[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
