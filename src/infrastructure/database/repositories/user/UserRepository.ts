import { UserDocument, IRefreshToken } from "../../models/user/userModel.js";
import User from "../../entity/user/User.js";
import { IBaseRepository } from "../BaseRepository.js";
import BaseRepository from "../BaseRepository.js";
import { Model, Types } from "mongoose";
import { UserResponse, UserRequest } from "../../../../app/user/userDto.js";

export interface IUserRepository extends IBaseRepository<User, UserDocument> {
  toDocument(
    request: UserRequest,
    refreshToken?: IRefreshToken,
    googleId?: string,
    deviceToken?: string
  ): Partial<UserDocument>;

  toDocumentFromEntity(
    user: User,
    refreshToken: IRefreshToken
  ): Partial<UserDocument>;

  toResponse(
    user: User,
    accessToken: string,
    name: string,
    refreshToken: string
  ): UserResponse;
}

export default class UserRepository
  extends BaseRepository<User, UserDocument>
  implements IUserRepository
{
  private userModel: Model<UserDocument>;

  constructor(userModel: Model<UserDocument>) {
    super(userModel);
    this.userModel = userModel;
  }

  toDocument(
    request: UserRequest,
    refreshToken?: IRefreshToken,
    googleId?: string,
    deviceToken?: string
  ): Partial<UserDocument> {
    return {
      username: request.username,
      password: request.password,
      isActive: request.isActive,
      deviceToken,
      googleId,
      email: request.email,
      authProvider: request.authProvider,
      refreshTokens: refreshToken ? [refreshToken] : [],
    };
  }

  toDocumentFromEntity(
    user: User,
    refreshToken: IRefreshToken
  ): Partial<UserDocument> {
    return {
      username: user.getUsername(),
      password: user.getPassword(),
      isActive: user.getIsActive(),
      deviceToken: user.getDeviceToken(),
      googleId: user.getGoogleId(),
      email: user.getEmail(),
      authProvider: user.getAuthProvider(),
      refreshTokens: [refreshToken],
    };
  }

  toEntity(doc: UserDocument): User {
    return User.builder()
      .setId(doc._id as Types.ObjectId)
      .setUsername(doc.username)
      .setPassword(doc.password)
      .setDeviceToken(doc.deviceToken)
      .setGoogleId(doc.googleId)
      .setIsActive(doc.isActive)
      .setEmail(doc.email)
      .setAuthProvider(doc.authProvider)
      .setRefreshTokens(doc.refreshTokens)
      .setCreatedAt(doc.createdAt)
      .setUpdatedAt(doc.updatedAt)
      .build();
  }

  toResponse(
    user: User,
    accessToken: string,
    name: string,
    refreshToken: string
  ): UserResponse {
    return {
      userId: user.getId().toString(),
      accessToken: accessToken,
      refreshToken,
      username: user.getUsername(),
      name,
    };
  }
}
