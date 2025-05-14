import { Types } from "mongoose";
import { UserDocument } from "../../src/infrastructure/database/models/user/userModel.js";
import User from "../../src/infrastructure/database/entity/user/User.js";
import {
  UserResponse,
  UserLoginRequest,
  UserRequest,
} from "../../src/app/user/userDto.js";
import { DecodedIdToken } from "firebase-admin/auth";
import UserProfile from "../../src/infrastructure/database/entity/user/UserProfile.js";
import { ProfileAccess } from "../../src/common/enums.js";
import { v4 as uuidv4 } from "uuid";

export default class UserTestFixture {
  public static ID: Types.ObjectId = new Types.ObjectId();
  public static USERNAME: string = "testUser";
  public static NAME: string = "testName";
  public static PASSWORD: string = "testPassword";
  public static IS_ACTIVE: boolean = true;
  public static DEVICE_TOKEN: string = "testDeviceToken";
  public static GOOGLE_ID: string = "testGoogleId";
  public static EMAIL: string = "test@gmail.com";
  public static AUTH_PROVIDER: string = "local";
  public static CREATED_AT: Date = new Date();
  public static UPDATED_AT: Date = new Date();

  public static USER_ID: string = new Types.ObjectId().toString();
  public static ACCOUNT_TYPE: number = ProfileAccess.Public;
  public static TOKEN: string = "token";
  public static REFRESH_TOKEN: string = "refreshToken";
  public static DEVICE_ID: string = uuidv4();

  public static createUserDocument(
    updatedData?: Partial<UserDocument>
  ): Partial<UserDocument> {
    return {
      username: this.USERNAME,
      password: this.PASSWORD,
      isActive: this.IS_ACTIVE,
      deviceToken: this.DEVICE_TOKEN,
      googleId: this.GOOGLE_ID,
      email: this.EMAIL,
      authProvider: this.AUTH_PROVIDER,
      createdAt: this.CREATED_AT,
      updatedAt: this.UPDATED_AT,
      ...updatedData,
    };
  }

  public static createUserEntity(): User {
    return User.builder()
      .setId(this.ID)
      .setUsername(this.USERNAME)
      .setPassword(this.PASSWORD)
      .setIsActive(this.IS_ACTIVE)
      .setDeviceToken(this.DEVICE_TOKEN)
      .setGoogleId(this.GOOGLE_ID)
      .setEmail(this.EMAIL)
      .setAuthProvider(this.AUTH_PROVIDER)
      .setCreatedAt(this.CREATED_AT)
      .setUpdatedAt(this.UPDATED_AT)
      .build();
  }

  public static updateUserEntity(updatedData: Partial<User>): Partial<User> {
    const userEntity = this.createUserEntity();
    const updatedUserEntity = { ...userEntity, ...updatedData };
    return updatedUserEntity;
  }

  public static createUserRequest(
    updatedData?: Partial<UserRequest>
  ): UserRequest {
    return {
      username: this.USERNAME,
      name: this.NAME,
      password: this.PASSWORD,
      isActive: this.IS_ACTIVE,
      email: this.EMAIL,
      authProvider: this.AUTH_PROVIDER,
      deviceId: this.DEVICE_TOKEN,
      ...updatedData,
    };
  }

  public static createUserLoginRequest(
    request?: Partial<UserLoginRequest>
  ): UserLoginRequest {
    return {
      email: this.EMAIL,
      password: this.PASSWORD,
      deviceId: this.DEVICE_TOKEN,
      ...request,
    };
  }

  public static createUserResponse(
    updatedData?: Partial<UserResponse>
  ): UserResponse {
    return {
      userId: this.USER_ID,
      token: this.TOKEN,
      refreshToken: this.TOKEN,
      username: this.USERNAME,
      name: this.NAME,
      ...updatedData,
    };
  }

  public static createUserProfile(): UserProfile {
    return UserProfile.builder()
      .setId(this.ID)
      .setUserId(this.ID)
      .setUsername(this.USERNAME)
      .setName(this.NAME)
      .setBio("")
      .setAccountType(this.ACCOUNT_TYPE)
      .setCreatedAt(this.CREATED_AT)
      .setUpdatedAt(this.UPDATED_AT)
      .build();
  }

  public static createDecodedIdToken(
    updatedData?: Partial<DecodedIdToken>
  ): DecodedIdToken {
    return {
      uid: this.GOOGLE_ID,
      email: this.EMAIL,
      name: this.NAME,
      ...updatedData,
    } as DecodedIdToken;
  }
}
