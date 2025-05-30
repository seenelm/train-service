import { Types } from "mongoose";

export default class UserGroups {
  private id: Types.ObjectId;
  private userId: Types.ObjectId;
  private groups: Types.ObjectId[];
  private createdAt?: Date;
  private updatedAt?: Date;

  constructor(builder: UserGroupsBuilder) {
    this.id = builder.id;
    this.userId = builder.userId;
    this.groups = builder.groups;
  }

  static builder(): UserGroupsBuilder {
    return new UserGroupsBuilder();
  }

  public getId(): Types.ObjectId {
    return this.id;
  }

  public getUserId(): Types.ObjectId {
    return this.userId;
  }

  public getGroups(): Types.ObjectId[] {
    return this.groups;
  }

  public getCreatedAt(): Date | undefined {
    return this.createdAt;
  }

  public getUpdatedAt(): Date | undefined {
    return this.updatedAt;
  }
}

export class UserGroupsBuilder {
  public id: Types.ObjectId;
  public userId: Types.ObjectId;
  public groups: Types.ObjectId[];
  public createdAt?: Date;
  public updatedAt?: Date;

  constructor() {
    this.id = new Types.ObjectId();
    this.userId = new Types.ObjectId();
    this.groups = [];
  }

  public setId(id: Types.ObjectId): this {
    this.id = id;
    return this;
  }

  public setUserId(userId: Types.ObjectId): this {
    this.userId = userId;
    return this;
  }

  public setGroups(groups: Types.ObjectId[]): this {
    this.groups = groups;
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

  public build(): UserGroups {
    return new UserGroups(this);
  }
}
