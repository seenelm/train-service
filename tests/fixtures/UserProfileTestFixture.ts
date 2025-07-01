import { Types } from "mongoose";
import { CertificationRequest, ProfileAccess } from "@seenelm/train-core";
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
  CustomSectionResponse,
} from "@seenelm/train-core";
import {
  SocialLink,
  Certification,
  StatsItem,
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
      receivedDate: "2024-03-20",
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

  public static createStringArrayItem(updatedData?: string[]): string[] {
    return ["testString1", "testString2", "testString3"];
  }

  public static createStatsItem(updatedData?: Partial<StatsItem>): StatsItem {
    return {
      category: "testCategory",
      value: "testValue",
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

  public static createCertificationRequest(
    updatedData?: Partial<CertificationRequest>
  ): CertificationRequest {
    return {
      certification: "testCertification",
      specializations: ["testSpecialization"],
      receivedDate: "2024-03-20",
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
      certifications: [this.createCertificationRequest()],
      customSections: [this.createCustomSectionRequest()],
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

  public static createCustomSectionResponse(
    updatedData?: Partial<CustomSectionResponse>
  ): CustomSectionResponse {
    return {
      title: CustomSectionType.ACHIEVEMENTS,
      details: [this.createAchievementItem()],
      ...updatedData,
    };
  }

  public static createDeleteCustomSectionRequest(
    updatedData?: Partial<{ userId: string; sectionTitle: CustomSectionType }>
  ): { userId: string; sectionTitle: CustomSectionType } {
    return {
      userId: this.USER_ID.toString(),
      sectionTitle: CustomSectionType.ACHIEVEMENTS,
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
