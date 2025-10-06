import { Types } from "mongoose";
import { Workout, Notes } from "../../models/programs/weekModel.js";

export default class Week {
  private id: Types.ObjectId;
  private name?: string;
  private description?: string;
  private weekNumber: number;
  private workouts: Workout[];
  private meals?: Types.ObjectId[];
  private notes?: Notes[];
  private startDate: Date;
  private endDate: Date;
  private isActive: boolean;
  private createdAt?: Date;
  private updatedAt?: Date;

  constructor(builder: WeekBuilder) {
    this.id = builder.id;
    this.name = builder.name;
    this.description = builder.description;
    this.weekNumber = builder.weekNumber;
    this.workouts = builder.workouts;
    this.meals = builder.meals;
    this.notes = builder.notes;
    this.startDate = builder.startDate;
    this.endDate = builder.endDate;
    this.isActive = builder.isActive;
    this.createdAt = builder.createdAt;
    this.updatedAt = builder.updatedAt;
  }

  static builder(): WeekBuilder {
    return new WeekBuilder();
  }

  public getId(): Types.ObjectId {
    return this.id;
  }

  public getIsActive(): boolean {
    return this.isActive;
  }

  public getName(): string | undefined {
    return this.name;
  }

  public getDescription(): string | undefined {
    return this.description;
  }

  public getWeekNumber(): number {
    return this.weekNumber;
  }

  public getWorkouts(): Workout[] {
    return this.workouts;
  }

  public getMeals(): Types.ObjectId[] | undefined {
    return this.meals;
  }

  public getNotes(): Notes[] | undefined {
    return this.notes;
  }

  public getStartDate(): Date {
    return this.startDate;
  }

  public getEndDate(): Date {
    return this.endDate;
  }

  public getCreatedAt(): Date | undefined {
    return this.createdAt;
  }

  public getUpdatedAt(): Date | undefined {
    return this.updatedAt;
  }
}

export class WeekBuilder {
  public id!: Types.ObjectId;
  public name?: string;
  public description?: string;
  public weekNumber!: number;
  public workouts!: Workout[];
  public meals?: Types.ObjectId[];
  public notes?: Notes[];
  public startDate!: Date;
  public endDate!: Date;
  public isActive!: boolean;
  public createdAt?: Date;
  public updatedAt?: Date;

  setId(id: Types.ObjectId): this {
    this.id = id;
    return this;
  }
  setName(name: string): this {
    this.name = name;
    return this;
  }
  setDescription(description: string): this {
    this.description = description;
    return this;
  }

  setWeekNumber(weekNumber: number): this {
    this.weekNumber = weekNumber;
    return this;
  }

  setWorkouts(workouts: Workout[]): this {
    this.workouts = workouts;
    return this;
  }

  setMeals(meals: Types.ObjectId[]): this {
    this.meals = meals;
    return this;
  }

  setNotes(notes: Notes[]): this {
    this.notes = notes;
    return this;
  }

  setStartDate(startDate: Date): this {
    this.startDate = startDate;
    return this;
  }

  setEndDate(endDate: Date): this {
    this.endDate = endDate;
    return this;
  }

  setCreatedAt(createdAt: Date): this {
    this.createdAt = createdAt;
    return this;
  }

  setUpdatedAt(updatedAt: Date): this {
    this.updatedAt = updatedAt;
    return this;
  }

  setIsActive(isActive: boolean): this {
    this.isActive = isActive;
    return this;
  }

  build(): Week {
    return new Week(this);
  }
}
