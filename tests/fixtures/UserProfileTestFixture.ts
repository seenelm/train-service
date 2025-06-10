import { Types } from "mongoose";
import { ProfileAccess } from "../../src/common/enums.js";
import { UserProfileDocument } from "../../src/infrastructure/database/models/user/userProfileModel.js";
import UserProfile from "../../src/infrastructure/database/entity/user/UserProfile.js";
import {
  UserProfileRequest,
  UserProfileRole,
  SocialLinkRequest,
} from "@seenelm/train-core";
import {
  SocialLink,
  SocialPlatform,
} from "../../src/infrastructure/database/models/user/userProfileModel.js";

export default class UserProfileTestFixture {
  public static ID: Types.ObjectId = new Types.ObjectId();
  public static USER_ID: Types.ObjectId = new Types.ObjectId();
  public static USERNAME: string = "testUser";
  public static NAME: string = "testName";
  public static BIO: string = "testBio";
  public static ACCOUNT_TYPE: number = ProfileAccess.Public;
  public static PROFILE_PICTURE: string = "testProfilePicture";
  public static ROLE: UserProfileRole[] = [
    UserProfileRole.COACH,
    UserProfileRole.TRAINER,
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
      socialLinks: this.SOCIAL_LINKS,
      createdAt: this.CREATED_AT,
      updatedAt: this.UPDATED_AT,
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

  public static createUserProfileEntity(): UserProfile {
    return UserProfile.builder()
      .setUserId(this.USER_ID)
      .setUsername(this.USERNAME)
      .setName(this.NAME)
      .setBio(this.BIO)
      .setAccountType(this.ACCOUNT_TYPE)
      .setProfilePicture(this.PROFILE_PICTURE)
      .setRole(this.ROLE)
      .setSocialLinks(this.SOCIAL_LINKS)
      .build();
  }
}
