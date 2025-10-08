import { UserProfileDocument } from "../../models/userProfile/userProfileModel.js";
import UserProfile from "../../entity/user/UserProfile.js";
import { IBaseRepository, BaseRepository } from "../BaseRepository.js";
import { Model, Types } from "mongoose";
import {
  UserProfileRequest,
  SocialPlatform,
  UserProfileResponse,
  ProfileAccess,
} from "@seenelm/train-core";

export interface IUserProfileRepository
  extends IBaseRepository<UserProfile, UserProfileDocument> {
  toDocument(request: UserProfileRequest): Partial<UserProfileDocument>;
  toResponse(profile: UserProfile): UserProfileResponse;
}

export default class UserProfileRepository
  extends BaseRepository<UserProfile, UserProfileDocument>
  implements IUserProfileRepository
{
  private userProfileModel: Model<UserProfileDocument>;

  constructor(userProfileModel: Model<UserProfileDocument>) {
    super(userProfileModel);
    this.userProfileModel = userProfileModel;
  }

  toEntity(doc: UserProfileDocument): UserProfile {
    return UserProfile.builder()
      .setId(doc._id as Types.ObjectId)
      .setUserId(doc.userId as Types.ObjectId)
      .setUsername(doc.username)
      .setName(doc.name)
      .setPhoneNumber(doc.phoneNumber)
      .setBirthday(doc.birthday)
      .setBio(doc.bio ?? "")
      .setAccountType(doc.accountType)
      .setLocation(doc.location)
      .setRole(doc.role)
      .setSocialLinks(doc.socialLinks)
      .setCertifications(doc.certifications)
      .setCustomSections(doc.customSections)
      .build();
  }

  toDocument(request: UserProfileRequest): Partial<UserProfileDocument> {
    return {
      userId: new Types.ObjectId(request.userId),
      username: request.username,
      name: request.name,
      phoneNumber: request.phoneNumber,
      birthday: request.birthday,
      bio: request.bio,
      accountType: ProfileAccess.Public,
      role: request.role,
      location: request.location,
      socialLinks: request.socialLinks,
      certifications: request.certifications?.map((certification) => ({
        certification: new Types.ObjectId(certification.certification),
        specializations: certification.specializations,
        receivedDate: certification.receivedDate,
      })),
      customSections: request.customSections,
    };
  }

  toResponse(profile: UserProfile): UserProfileResponse {
    return {
      userId: profile.getUserId().toString(),
      username: profile.getUsername(),
      name: profile.getName(),
      phoneNumber: profile.getPhoneNumber(),
      birthday: profile.getBirthday(),
      bio: profile.getBio(),
      accountType: profile.getAccountType(),
      role: profile.getRole(),
      location: profile.getLocation(),
      socialLinks: profile.getSocialLinks(),
      certifications: [],
      customSections: profile.getCustomSections(),
    };
  }
}
