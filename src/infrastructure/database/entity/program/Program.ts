import { Types } from "mongoose";
import { Phase } from "../../models/programs/programModel.js";
import { ProfileAccess } from "@seenelm/train-core";

export default class Program {
  private id: Types.ObjectId;
  private name: string;
  private description?: string;
  private types?: string[];
  private numWeeks: number;
  private hasNutritionProgram?: boolean;
  private phases?: Phase[];
  private accessType: ProfileAccess;
  private admins: Types.ObjectId[];
  private createdBy: Types.ObjectId;
  private members?: Types.ObjectId[];
  private weeks?: Types.ObjectId[];
  private createdAt?: Date;
  private updatedAt?: Date;

  constructor(builder: ProgramBuilder) {
    this.id = builder.id;
    this.name = builder.name;
    this.description = builder.description;
    this.types = builder.types;
    this.numWeeks = builder.numWeeks;
    this.hasNutritionProgram = builder.hasNutritionProgram;
    this.phases = builder.phases;
    this.accessType = builder.accessType;
    this.admins = builder.admins;
    this.members = builder.members;
    this.weeks = builder.weeks;
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
  public getDescription(): string | undefined {
    return this.description;
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
  public getAdmins(): Types.ObjectId[] {
    return this.admins;
  }
  public getMembers(): Types.ObjectId[] | undefined {
    return this.members;
  }
  public getWeeks(): Types.ObjectId[] | undefined {
    return this.weeks;
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
  description?: string;
  types?: string[];
  numWeeks: number = 0;
  hasNutritionProgram?: boolean;
  phases?: Phase[];
  accessType: ProfileAccess = ProfileAccess.Public;
  admins: Types.ObjectId[] = [];
  members?: Types.ObjectId[];
  weeks?: Types.ObjectId[];
  createdBy: Types.ObjectId = new Types.ObjectId();
  createdAt?: Date;
  updatedAt?: Date;

  public setId(id: Types.ObjectId): this {
    this.id = id;
    return this;
  }
  public setDescription(description?: string): this {
    this.description = description;
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
  public setAdmins(admins: Types.ObjectId[]): this {
    this.admins = admins;
    return this;
  }
  public setMembers(members?: Types.ObjectId[]): this {
    this.members = members;
    return this;
  }
  public setWeeks(weeks?: Types.ObjectId[]): this {
    this.weeks = weeks;
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
