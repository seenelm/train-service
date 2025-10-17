import { Types } from "mongoose";

export default class UserProgram {
  private id: Types.ObjectId;
  private userId: Types.ObjectId;
  private programs: Types.ObjectId[];
  private createdAt: Date;
  private updatedAt: Date;

  constructor(builder: UserProgramBuilder) {
    this.id = builder.id;
    this.userId = builder.userId;
    this.programs = builder.programs;
    this.createdAt = builder.createdAt;
    this.updatedAt = builder.updatedAt;
  }

  static builder(): UserProgramBuilder {
    return new UserProgramBuilder();
  }

  public getId(): Types.ObjectId {
    return this.id;
  }

  public getUserId(): Types.ObjectId {
    return this.userId;
  }

  public getPrograms(): Types.ObjectId[] {
    return this.programs;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }
}

export class UserProgramBuilder {
  id: Types.ObjectId;
  userId: Types.ObjectId;
  programs: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;

  constructor() {
    this.id = new Types.ObjectId();
    this.userId = new Types.ObjectId();
    this.programs = [];
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  setId(id: Types.ObjectId): this {
    this.id = id;
    return this;
  }

  setUserId(userId: Types.ObjectId): this {
    this.userId = userId;
    return this;
  }

  setPrograms(programs: Types.ObjectId[]): this {
    this.programs = programs;
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

  build(): UserProgram {
    return new UserProgram(this);
  }
}
