import { Types } from "mongoose";
import { ProfileAccess } from "../../../../common/enums.js";

export default class UserProfile {
  private id: Types.ObjectId;
  private userId: Types.ObjectId;
  private username: string;
  private name: string;
  private bio: string;
  private accountType: number;
  private createdAt?: Date;
  private updatedAt?: Date;

  constructor(builder: UserProfileBuilder) {
    this.id = builder.id;
    this.userId = builder.userId;
    this.username = builder.username;
    this.name = builder.name;
    this.bio = builder.bio;
    this.accountType = builder.accountType;
    this.createdAt = builder.createdAt;
    this.updatedAt = builder.updatedAt;
  }

  static builder(): UserProfileBuilder {
    return new UserProfileBuilder();
  }

  public getId(): Types.ObjectId {
    return this.id;
  }

  public getUserId(): Types.ObjectId {
    return this.userId;
  }

  public getUsername(): string {
    return this.username;
  }

  public getName(): string {
    return this.name;
  }

  public getBio(): string {
    return this.bio;
  }

  public getAccountType(): number {
    return this.accountType;
  }

  public getCreatedAt(): Date | undefined {
    return this.createdAt;
  }

  public getUpdatedAt(): Date | undefined {
    return this.updatedAt;
  }
}

class UserProfileBuilder {
  id: Types.ObjectId = new Types.ObjectId();
  userId: Types.ObjectId = new Types.ObjectId();
  username: string = "";
  name: string = "";
  bio: string = "";
  accountType: number = ProfileAccess.Public;
  createdAt?: Date;
  updatedAt?: Date;

  public setId(id: Types.ObjectId): this {
    this.id = id;
    return this;
  }

  public setUserId(userId: Types.ObjectId): this {
    this.userId = userId;
    return this;
  }

  public setUsername(username: string): this {
    this.username = username;
    return this;
  }

  public setName(name: string): this {
    this.name = name;
    return this;
  }

  public setBio(bio: string): this {
    this.bio = bio;
    return this;
  }

  public setAccountType(accountType: number): this {
    this.accountType = accountType;
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

  public build(): UserProfile {
    return new UserProfile(this);
  }
}
