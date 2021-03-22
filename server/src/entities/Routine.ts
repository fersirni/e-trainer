import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BaseEntity, OneToOne, JoinColumn, ManyToOne } from "typeorm";
import { ObjectType, Field, Int } from "type-graphql";
import { User } from "./User";

@ObjectType()
@Entity()
export class Routine extends BaseEntity{
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;

    @Field()
    @Column()
    name!: string;

    @Field()
    @Column()
    description: string;
   
    @OneToOne(() => User)
    @JoinColumn()
    assignedBy: User; 

    @Column()
    startDate: Date;

    @Column()
    dueDate: Date;

    @ManyToOne(() => User, user => user.routines)
    user: User;
    
    //@OneToMany(() => Exercise, exercise => exercise.routine)
    //exercises: Exercise[];
}