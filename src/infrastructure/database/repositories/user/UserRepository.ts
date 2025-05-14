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
    token: string,
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
    token: string,
    name: string,
    refreshToken: string
  ): UserResponse {
    return {
      userId: user.getId().toString(),
      token,
      refreshToken,
      username: user.getUsername(),
      name,
    };
  }

  // public async findUserById(
  //     userId: Types.ObjectId,
  //     field: string,
  // ): Promise<IUser | null> {
  //     return await this.userModel.findById(userId).select(field).exec();
  // }

  // public async fetchUserData(
  //     userId: Types.ObjectId,
  // ): Promise<(IUser & IUserProfile & IUserGroups)[] | null> {
  //     const userData = await this.userModel.aggregate([
  //         {
  //             $match: {
  //                 _id: userId,
  //             },
  //         },
  //         {
  //             $lookup: {
  //                 from: "userprofiles",
  //                 localField: "_id",
  //                 foreignField: "userId",
  //                 as: "userProfile",
  //             },
  //         },
  //         {
  //             $lookup: {
  //                 from: "usergroups",
  //                 localField: "_id",
  //                 foreignField: "userId",
  //                 as: "userGroups",
  //             },
  //         },
  //         {
  //             $project: {
  //                 username: 1,
  //                 userProfile: 1,
  //                 userGroups: 1,
  //             },
  //         },
  //     ]);

  //     return userData;
  // }

  // public async deleteUserAccount(userId: Types.ObjectId): Promise<void> {
  //     const user = await this.userModel.findByIdAndDelete(userId).exec();

  //     if (!user) {
  //         throw new ResourceNotFoundError("User not found");
  //     }
  //     this.logger.logInfo(`User "${user.username}" was deleted`, {
  //         userId,
  //         username: user.username,
  //     });

  //     await UserProfileModel.deleteOne({ userId }).exec();
  //     this.logger.logInfo(`User "${user.username}" Profile was deleted`, {
  //         userId,
  //         username: user.username,
  //     });

  //     // Get the document first
  //     const userGroupsDoc = await UserGroupsModel.findOne({ userId }).exec();

  //     // Store the groups before deletion if they exist
  //     const groups = userGroupsDoc?.groups || [];

  //     // Then delete the document
  //     await UserGroupsModel.deleteOne({ userId }).exec();

  //     this.logger.logInfo(
  //         `User Groups for User ${user.username} was deleted`,
  //     );

  //     if (groups.length > 0) {
  //         await GroupModel.deleteMany({ _id: { $in: groups } }).exec();
  //     }
  // }
}
