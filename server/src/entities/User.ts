import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BaseEntity, OneToOne, JoinColumn, OneToMany } from "typeorm";
import { ObjectType, Field, Int } from "type-graphql";
import { Routine } from "./Routine";

@ObjectType()
@Entity()
export class User extends BaseEntity{
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    _id!: number;

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
    @Column({unique: true })
    email!: string;

    @Field()
    @Column()
    password!: string;

    @Field()
    @Column()
    profile!: string;

    @Field()
    @Column({ nullable: true })
    profilePicture: string;
   
    @OneToOne(() => Routine)
    @JoinColumn()
    activeRoutine: Routine; 
    
    @OneToMany(() => Routine, routine=> routine.user)
    routines: Routine[];
}