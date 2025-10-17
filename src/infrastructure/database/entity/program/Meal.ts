import { Types } from "mongoose";
import {
  Macros,
  Ingredient,
  MealLog,
} from "../../models/programs/mealModel.js";

export default class Meal {
  private id: Types.ObjectId;
  private versionId: number;
  private createdBy: Types.ObjectId;
  private mealName: string;
  private macros?: Macros;
  private ingredients?: Ingredient[];
  private instructions?: string;
  private logs?: MealLog[];
  private startDate: Date;
  private endDate: Date;
  private createdAt?: Date;
  private updatedAt?: Date;

  constructor(builder: MealBuilder) {
    this.id = builder.id;
    this.versionId = builder.versionId;
    this.createdBy = builder.createdBy;
    this.mealName = builder.mealName;
    this.macros = builder.macros;
    this.ingredients = builder.ingredients;
    this.instructions = builder.instructions;
    this.logs = builder.logs;
    this.startDate = builder.startDate;
    this.endDate = builder.endDate;
    this.createdAt = builder.createdAt;
    this.updatedAt = builder.updatedAt;
  }

  static builder(): MealBuilder {
    return new MealBuilder();
  }

  public getId(): Types.ObjectId {
    return this.id;
  }

  public getVersionId(): number {
    return this.versionId;
  }

  public getCreatedBy(): Types.ObjectId {
    return this.createdBy;
  }

  public getMealName(): string {
    return this.mealName;
  }

  public getMacros(): Macros | undefined {
    return this.macros;
  }

  public getIngredients(): Ingredient[] | undefined {
    return this.ingredients;
  }

  public getInstructions(): string | undefined {
    return this.instructions;
  }

  public getLogs(): MealLog[] | undefined {
    return this.logs;
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

export class MealBuilder {
  id!: Types.ObjectId;
  versionId!: number;
  createdBy!: Types.ObjectId;
  mealName!: string;
  macros?: Macros;
  ingredients?: Ingredient[];
  instructions?: string;
  logs?: MealLog[];
  startDate!: Date;
  endDate!: Date;
  createdAt?: Date;
  updatedAt?: Date;

  setId(id: Types.ObjectId): this {
    this.id = id;
    return this;
  }

  setVersionId(versionId: number): this {
    this.versionId = versionId;
    return this;
  }

  setCreatedBy(createdBy: Types.ObjectId): this {
    this.createdBy = createdBy;
    return this;
  }

  setMealName(mealName: string): this {
    this.mealName = mealName;
    return this;
  }

  setMacros(macros?: Macros): this {
    this.macros = macros;
    return this;
  }

  setIngredients(ingredients?: Ingredient[]): this {
    this.ingredients = ingredients;
    return this;
  }

  setInstructions(instructions?: string): this {
    this.instructions = instructions;
    return this;
  }

  setLogs(logs?: MealLog[]): this {
    this.logs = logs;
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

  build(): Meal {
    return new Meal(this);
  }
}
