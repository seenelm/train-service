import { Types } from "mongoose";

export default class Follow {
  private id: Types.ObjectId;
  private userId: Types.ObjectId;
  private following: Types.ObjectId[];
  private followers: Types.ObjectId[];
  private requests: Types.ObjectId[];
  private createdAt?: Date;
  private updatedAt?: Date;

  constructor(builder: FollowBuilder) {
    this.id = builder.id;
    this.userId = builder.userId;
    this.following = builder.following;
    this.followers = builder.followers;
    this.requests = builder.requests;
    this.createdAt = builder.createdAt;
    this.updatedAt = builder.updatedAt;
  }

  static builder(): FollowBuilder {
    return new FollowBuilder();
  }

  public getId(): Types.ObjectId {
    return this.id;
  }

  public getUserId(): Types.ObjectId {
    return this.userId;
  }

  public getFollowing(): Types.ObjectId[] {
    return this.following;
  }

  public getFollowers(): Types.ObjectId[] {
    return this.followers;
  }

  public getRequests(): Types.ObjectId[] {
    return this.requests;
  }

  public getCreatedAt(): Date | undefined {
    return this.createdAt;
  }

  public getUpdatedAt(): Date | undefined {
    return this.updatedAt;
  }
}

class FollowBuilder {
  id: Types.ObjectId;
  userId: Types.ObjectId;
  following: Types.ObjectId[];
  followers: Types.ObjectId[];
  requests: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;

  constructor() {
    this.id = new Types.ObjectId();
    this.userId = new Types.ObjectId();
    this.following = [];
    this.followers = [];
    this.requests = [];
  }

  public setId(id: Types.ObjectId): this {
    this.id = id;
    return this;
  }

  public setUserId(userId: Types.ObjectId): this {
    this.userId = userId;
    return this;
  }

  public setFollowing(following: Types.ObjectId[]): this {
    this.following = following;
    return this;
  }

  public setFollowers(followers: Types.ObjectId[]): this {
    this.followers = followers;
    return this;
  }

  public setRequests(requests: Types.ObjectId[]): this {
    this.requests = requests;
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

  public build(): Follow {
    return new Follow(this);
  }
}
