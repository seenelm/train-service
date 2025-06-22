import { Types } from "mongoose";
import { ProfileAccess } from "@seenelm/train-core";
import { UserProfileDocument } from "../../src/infrastructure/database/models/userProfile/userProfileModel.js";
import UserProfile, {
  UserProfileBuilder,
} from "../../src/infrastructure/database/entity/user/UserProfile.js";
import {
  UserProfileRequest,
  SocialLinkRequest,
  SocialPlatform,
  CustomSectionType,
  CustomSectionRequest,
} from "@seenelm/train-core";
import {
  SocialLink,
  Certification,
  GenericItem,
  CustomSection,
  AchievementItem,
} from "../../src/infrastructure/database/models/userProfile/userProfileModel.js";

export default class UserProfileTestFixture {
  public static ID: Types.ObjectId = new Types.ObjectId();
  public static USER_ID: Types.ObjectId = new Types.ObjectId();
  public static USERNAME: string = "testUser";
  public static NAME: string = "testName";
  public static BIO: string = "testBio";
  public static ACCOUNT_TYPE: ProfileAccess = ProfileAccess.Public;
  public static PROFILE_PICTURE: string = "testProfilePicture";
  public static ROLE: string = "Coach";
  public static LOCATION: string = "testLocation";

  public static CERTIFICATIONS: Certification[] = [
    {
      certification: new Types.ObjectId(),
      specializations: ["testSpecialization"],
    },
  ];
  public static SOCIAL_LINKS: SocialLink[] = [
    {
      platform: SocialPlatform.INSTAGRAM,
      url: "https://www.instagram.com/test",
    },
  ];
  public static SOCIAL_LINKS_REQUEST: SocialLinkRequest[] = [
    {
      platform: SocialPlatform.INSTAGRAM,
      url: "https://www.instagram.com/test",
    },
  ];
  public static CREATED_AT: Date = new Date();
  public static UPDATED_AT: Date = new Date();

  public static createUserProfileDocument(
    updatedData?: Partial<UserProfileDocument>
  ): Partial<UserProfileDocument> {
    return {
      userId: this.USER_ID,
      username: this.USERNAME,
      name: this.NAME,
      bio: this.BIO,
      accountType: this.ACCOUNT_TYPE,
      profilePicture: this.PROFILE_PICTURE,
      role: this.ROLE,
      location: this.LOCATION,
      socialLinks: this.SOCIAL_LINKS,
      certifications: this.CERTIFICATIONS,
      customSections: [this.createCustomSection()],
      createdAt: this.CREATED_AT,
      updatedAt: this.UPDATED_AT,
      ...updatedData,
    };
  }

  public static createCustomSection(
    updatedData?: Partial<CustomSection>
  ): CustomSection {
    return {
      title: CustomSectionType.ACHIEVEMENTS,
      details: [this.createAchievementItem()],
      ...updatedData,
    };
  }

  public static createGenericItem(
    updatedData?: Partial<GenericItem>
  ): GenericItem {
    return {
      philosophy: "testPhilosophy",
      ...updatedData,
    };
  }

  public static createAchievementItem(
    updatedData?: Partial<AchievementItem>
  ): AchievementItem {
    return {
      title: "testTitle",
      date: "2024-03-20",
      description: "testDescription",
      ...updatedData,
    };
  }

  public static createUserProfileRequest(
    updatedData?: Partial<UserProfileRequest>
  ): UserProfileRequest {
    return {
      userId: this.USER_ID.toString(),
      username: this.USERNAME,
      name: this.NAME,
      bio: this.BIO,
      accountType: this.ACCOUNT_TYPE,
      profilePicture: this.PROFILE_PICTURE,
      role: this.ROLE,
      socialLinks: this.SOCIAL_LINKS_REQUEST,
      ...updatedData,
    };
  }

  public static createCustomSectionRequest(
    updatedData?: Partial<CustomSectionRequest>
  ): CustomSectionRequest {
    return {
      title: CustomSectionType.ACHIEVEMENTS,
      details: [this.createAchievementItem()],
      ...updatedData,
    };
  }

  public static createUserProfileEntity(
    builderFn?: (builder: UserProfileBuilder) => UserProfileBuilder
  ): UserProfile {
    const baseBuilder = UserProfile.builder()
      .setUserId(this.USER_ID)
      .setUsername(this.USERNAME)
      .setName(this.NAME)
      .setBio(this.BIO)
      .setAccountType(this.ACCOUNT_TYPE)
      .setProfilePicture(this.PROFILE_PICTURE)
      .setRole(this.ROLE)
      .setLocation(this.LOCATION)
      .setSocialLinks(this.SOCIAL_LINKS)
      .setCertifications(this.CERTIFICATIONS)
      .setCustomSections([this.createCustomSection()]);

    const finalBuilder = builderFn ? builderFn(baseBuilder) : baseBuilder;
    return finalBuilder.build();
  }
}
