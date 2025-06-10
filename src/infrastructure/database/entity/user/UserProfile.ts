import { Types } from "mongoose";
import { ProfileAccess } from "../../../../common/enums.js";
import { UserProfileRole } from "@seenelm/train-core";
import { SocialLink } from "../../models/user/userProfileModel.js";

export default class UserProfile {
  private id: Types.ObjectId;
  private userId: Types.ObjectId;
  private username: string;
  private name: string;
  private bio?: string;
  private accountType: number;
  private profilePicture?: string;
  private role?: UserProfileRole[];
  private socialLinks?: SocialLink[];
  private createdAt?: Date;
  private updatedAt?: Date;

  constructor(builder: UserProfileBuilder) {
    this.id = builder.id;
    this.userId = builder.userId;
    this.username = builder.username;
    this.name = builder.name;
    this.bio = builder.bio;
    this.accountType = builder.accountType;
    this.profilePicture = builder.profilePicture;
    this.role = builder.role;
    this.socialLinks = builder.socialLinks;
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

  public getBio(): string | undefined {
    return this.bio;
  }

  public getAccountType(): number {
    return this.accountType;
  }

  public getProfilePicture(): string | undefined {
    return this.profilePicture;
  }

  public getRole(): UserProfileRole[] | undefined {
    return this.role;
  }

  public getSocialLinks(): SocialLink[] | undefined {
    return this.socialLinks;
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

  public setUserId(userId: Types.ObjectId): void {
    this.userId = userId;
  }

  public setUsername(username: string): void {
    this.username = username;
  }

  public setName(name: string): void {
    this.name = name;
  }

  public setBio(bio: string): void {
    this.bio = bio;
  }

  public setAccountType(accountType: number): void {
    this.accountType = accountType;
  }
}

class UserProfileBuilder {
  id: Types.ObjectId = new Types.ObjectId();
  userId: Types.ObjectId = new Types.ObjectId();
  username: string = "";
  name: string = "";
  bio?: string;
  accountType: number = ProfileAccess.Public;
  profilePicture?: string;
  role?: UserProfileRole[];
  socialLinks?: SocialLink[];
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

  public setBio(bio?: string): this {
    this.bio = bio;
    return this;
  }

  public setAccountType(accountType: number): this {
    this.accountType = accountType;
    return this;
  }

  public setProfilePicture(profilePicture?: string): this {
    this.profilePicture = profilePicture;
    return this;
  }

  public setRole(role?: UserProfileRole[]): this {
    this.role = role;
    return this;
  }

  public setSocialLinks(socialLinks?: SocialLink[]): this {
    this.socialLinks = socialLinks;
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
