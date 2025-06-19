import { Types } from "mongoose";
import {
  SocialLink,
  Certification,
  CustomSection,
} from "../../models/userProfile/userProfileModel.js";
import { ProfileAccess } from "@seenelm/train-core";

export default class UserProfile {
  private id: Types.ObjectId;
  private userId: Types.ObjectId;
  private username: string;
  private name: string;
  private bio?: string;
  private accountType: ProfileAccess;
  private profilePicture?: string;
  private role?: string;
  private location?: string;
  private socialLinks?: SocialLink[];
  private certifications?: Certification[];
  private customSections?: CustomSection[];
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
    this.location = builder.location;
    this.socialLinks = builder.socialLinks;
    this.certifications = builder.certifications;
    this.customSections = builder.customSections;
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

  public getAccountType(): ProfileAccess {
    return this.accountType;
  }

  public getProfilePicture(): string | undefined {
    return this.profilePicture;
  }

  public getRole(): string | undefined {
    return this.role;
  }

  public getLocation(): string | undefined {
    return this.location;
  }

  public getSocialLinks(): SocialLink[] | undefined {
    return this.socialLinks;
  }

  public getCertifications(): Certification[] | undefined {
    return this.certifications;
  }

  public getCustomSections(): CustomSection[] | undefined {
    return this.customSections;
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
  accountType: ProfileAccess = ProfileAccess.Public;
  profilePicture?: string;
  role?: string;
  location?: string;
  socialLinks?: SocialLink[];
  certifications?: Certification[];
  customSections?: CustomSection[];
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

  public setAccountType(accountType: ProfileAccess): this {
    this.accountType = accountType;
    return this;
  }

  public setProfilePicture(profilePicture?: string): this {
    this.profilePicture = profilePicture;
    return this;
  }

  public setRole(role?: string): this {
    this.role = role;
    return this;
  }

  public setLocation(location?: string): this {
    this.location = location;
    return this;
  }

  public setSocialLinks(socialLinks?: SocialLink[]): this {
    this.socialLinks = socialLinks;
    return this;
  }

  public setCertifications(certifications?: Certification[]): this {
    this.certifications = certifications;
    return this;
  }

  public setCustomSections(customSections?: CustomSection[]): this {
    this.customSections = customSections;
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
