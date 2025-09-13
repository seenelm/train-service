import { Types } from "mongoose";
import { Phase } from "../../models/programs/programModel.js";
import { ProfileAccess } from "@seenelm/train-core";

export default class Program {
  private id: Types.ObjectId;
  private name: string;
  private types?: string[];
  private numWeeks: number;
  private hasNutritionProgram?: boolean;
  private phases?: Phase[];
  private accessType: ProfileAccess;
  private createdBy: Types.ObjectId;
  private createdAt?: Date;
  private updatedAt?: Date;

  constructor(builder: ProgramBuilder) {
    this.id = builder.id;
    this.name = builder.name;
    this.types = builder.types;
    this.numWeeks = builder.numWeeks;
    this.hasNutritionProgram = builder.hasNutritionProgram;
    this.phases = builder.phases;
    this.accessType = builder.accessType;
    this.createdBy = builder.createdBy;
    this.createdAt = builder.createdAt;
    this.updatedAt = builder.updatedAt;
  }

  static builder(): ProgramBuilder {
    return new ProgramBuilder();
  }

  public getId(): Types.ObjectId {
    return this.id;
  }
  public getName(): string {
    return this.name;
  }
  public getTypes(): string[] | undefined {
    return this.types;
  }
  public getNumWeeks(): number {
    return this.numWeeks;
  }
  public getHasNutritionProgram(): boolean | undefined {
    return this.hasNutritionProgram;
  }
  public getPhases(): Phase[] | undefined {
    return this.phases;
  }
  public getAccessType(): ProfileAccess {
    return this.accessType;
  }
  public getCreatedBy(): Types.ObjectId {
    return this.createdBy;
  }
  public getCreatedAt(): Date | undefined {
    return this.createdAt;
  }
  public getUpdatedAt(): Date | undefined {
    return this.updatedAt;
  }
}

class ProgramBuilder {
  id: Types.ObjectId = new Types.ObjectId();
  name: string = "";
  types?: string[];
  numWeeks: number = 0;
  hasNutritionProgram?: boolean;
  phases?: Phase[];
  accessType: ProfileAccess = ProfileAccess.Public;
  createdBy: Types.ObjectId = new Types.ObjectId();
  createdAt?: Date;
  updatedAt?: Date;

  public setId(id: Types.ObjectId): this {
    this.id = id;
    return this;
  }
  public setName(name: string): this {
    this.name = name;
    return this;
  }
  public setTypes(types?: string[]): this {
    this.types = types;
    return this;
  }
  public setNumWeeks(numWeeks: number): this {
    this.numWeeks = numWeeks;
    return this;
  }
  public setHasNutritionProgram(hasNutritionProgram?: boolean): this {
    this.hasNutritionProgram = hasNutritionProgram;
    return this;
  }
  public setPhases(phases?: Phase[]): this {
    this.phases = phases;
    return this;
  }
  public setAccessType(accessType: ProfileAccess): this {
    this.accessType = accessType;
    return this;
  }
  public setCreatedBy(createdBy: Types.ObjectId): this {
    this.createdBy = createdBy;
    return this;
  }
  public setCreatedAt(createdAt?: Date): this {
    this.createdAt = createdAt;
    return this;
  }
  public setUpdatedAt(updatedAt?: Date): this {
    this.updatedAt = updatedAt;
    return this;
  }

  public build(): Program {
    return new Program(this);
  }
}
