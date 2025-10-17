import { Types } from "mongoose";

export default class GroupEvent {
  private id: Types.ObjectId;
  private groupId: Types.ObjectId;
  private events: Types.ObjectId[];
  private createdAt?: Date;
  private updatedAt?: Date;

  constructor(builder: GroupEventBuilder) {
    this.id = builder.id;
    this.groupId = builder.groupId;
    this.events = builder.events;
    this.createdAt = builder.createdAt;
    this.updatedAt = builder.updatedAt;
  }

  static builder(): GroupEventBuilder {
    return new GroupEventBuilder();
  }

  public getId(): Types.ObjectId {
    return this.id;
  }

  public getGroupId(): Types.ObjectId {
    return this.groupId;
  }

  public getEvents(): Types.ObjectId[] {
    return this.events;
  }

  public getCreatedAt(): Date | undefined {
    return this.createdAt;
  }

  public getUpdatedAt(): Date | undefined {
    return this.updatedAt;
  }

  public setId(id: Types.ObjectId): void {
    this.id = id;
  }

  public setGroupId(groupId: Types.ObjectId): void {
    this.groupId = groupId;
  }

  public setEvents(events: Types.ObjectId[]): void {
    this.events = events;
  }

  public setCreatedAt(createdAt: Date): void {
    this.createdAt = createdAt;
  }

  public setUpdatedAt(updatedAt: Date): void {
    this.updatedAt = updatedAt;
  }
}

class GroupEventBuilder {
  id: Types.ObjectId = new Types.ObjectId();
  groupId: Types.ObjectId = new Types.ObjectId();
  events: Types.ObjectId[] = [];
  createdAt?: Date;
  updatedAt?: Date;

  public setId(id: Types.ObjectId): this {
    this.id = id;
    return this;
  }

  public setGroupId(groupId: Types.ObjectId): this {
    this.groupId = groupId;
    return this;
  }

  public setEvents(events: Types.ObjectId[]): this {
    this.events = events;
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

  public build(): GroupEvent {
    return new GroupEvent(this);
  }
}
