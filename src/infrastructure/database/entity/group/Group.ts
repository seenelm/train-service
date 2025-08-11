import { Types } from "mongoose";
import { ProfileAccess } from "@seenelm/train-core";

export default class Group {
  private id: Types.ObjectId;
  private name: string;
  private description?: string;
  private location?: string;
  private tags?: string[];
  private owners: Types.ObjectId[];
  private members: Types.ObjectId[];
  private requests: Types.ObjectId[];
  private accountType: ProfileAccess;
  private createdAt?: Date;
  private updatedAt?: Date;

  constructor(builder: GroupBuilder) {
    this.id = builder.id;
    this.name = builder.name;
    this.description = builder.description;
    this.location = builder.location;
    this.tags = builder.tags;
    this.owners = builder.owners;
    this.members = builder.members;
    this.requests = builder.requests;
    this.accountType = builder.accountType;
    this.createdAt = builder.createdAt;
    this.updatedAt = builder.updatedAt;
  }

  static builder(): GroupBuilder {
    return new GroupBuilder();
  }

  public getId(): Types.ObjectId {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getDescription(): string | undefined {
    return this.description;
  }

  public getLocation(): string | undefined {
    return this.location;
  }

  public getTags(): string[] | undefined {
    return this.tags;
  }

  public getOwners(): Types.ObjectId[] {
    return this.owners;
  }

  public getMembers(): Types.ObjectId[] {
    return this.members;
  }

  public getRequests(): Types.ObjectId[] {
    return this.requests;
  }

  public getAccountType(): ProfileAccess {
    return this.accountType;
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

  public setName(name: string): void {
    this.name = name;
  }

  public setDescription(description?: string): void {
    this.description = description;
  }

  public setLocation(location?: string): void {
    this.location = location;
  }

  public setTags(tags?: string[]): void {
    this.tags = tags;
  }

  public setOwners(owners: Types.ObjectId[]): void {
    this.owners = owners;
  }

  public setMembers(members: Types.ObjectId[]): void {
    this.members = members;
  }

  public setRequests(requests: Types.ObjectId[]): void {
    this.requests = requests;
  }

  public setAccountType(accountType: ProfileAccess): void {
    this.accountType = accountType;
  }

  public setCreatedAt(createdAt: Date): void {
    this.createdAt = createdAt;
  }

  public setUpdatedAt(updatedAt: Date): void {
    this.updatedAt = updatedAt;
  }

  // Helper methods for managing group relationships
  public addOwner(userId: Types.ObjectId): void {
    if (!this.owners.some((id) => id.equals(userId))) {
      this.owners.push(userId);
    }
  }

  public removeOwner(userId: Types.ObjectId): void {
    this.owners = this.owners.filter((id) => !id.equals(userId));
  }

  public addMember(userId: Types.ObjectId): void {
    if (!this.members.some((id) => id.equals(userId))) {
      this.members.push(userId);
    }
  }

  public removeMember(userId: Types.ObjectId): void {
    this.members = this.members.filter((id) => !id.equals(userId));
  }

  public addRequest(userId: Types.ObjectId): void {
    if (!this.requests.some((id) => id.equals(userId))) {
      this.requests.push(userId);
    }
  }

  public removeRequest(userId: Types.ObjectId): void {
    this.requests = this.requests.filter((id) => !id.equals(userId));
  }

  public isOwner(userId: Types.ObjectId): boolean {
    return this.owners.some((id) => id.equals(userId));
  }

  public isMember(userId: Types.ObjectId): boolean {
    return this.members.some((id) => id.equals(userId));
  }

  public hasRequest(userId: Types.ObjectId): boolean {
    return this.requests.some((id) => id.equals(userId));
  }
}

export class GroupBuilder {
  id: Types.ObjectId = new Types.ObjectId();
  name: string = "";
  description?: string;
  location?: string;
  tags?: string[];
  owners: Types.ObjectId[] = [];
  members: Types.ObjectId[] = [];
  requests: Types.ObjectId[] = [];
  accountType: ProfileAccess = ProfileAccess.Public;
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

  public setDescription(description?: string): this {
    this.description = description;
    return this;
  }

  public setLocation(location?: string): this {
    this.location = location;
    return this;
  }

  public setTags(tags?: string[]): this {
    this.tags = tags;
    return this;
  }

  public setOwners(owners: Types.ObjectId[]): this {
    this.owners = owners;
    return this;
  }

  public setMembers(members: Types.ObjectId[]): this {
    this.members = members;
    return this;
  }

  public setRequests(requests: Types.ObjectId[]): this {
    this.requests = requests;
    return this;
  }

  public setAccountType(accountType: ProfileAccess): this {
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

  public build(): Group {
    return new Group(this);
  }
}
