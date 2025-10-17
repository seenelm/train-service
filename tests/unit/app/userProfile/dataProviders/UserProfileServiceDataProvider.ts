import { UserProfileRequest } from "@seenelm/train-core";
import UserProfileTestFixture from "../../../../fixtures/UserProfileTestFixture.js";
import { ErrorResponse } from "../../../../../src/common/errors/types.js";
import { Types } from "mongoose";
import { APIErrorType } from "../../../../../src/common/enums.js";
import UserProfile from "../../../../../src/infrastructure/database/entity/user/UserProfile.js";
import { UserProfileDocument } from "../../../../../src/infrastructure/database/models/userProfile/userProfileModel.js";
import { APIError } from "../../../../../src/common/errors/APIError.js";
import { Error as MongooseError } from "mongoose";
import {
  SocialPlatform,
  CustomSectionType,
  CustomSectionResponse,
  BasicUserProfileInfoRequest,
} from "@seenelm/train-core";
import { CustomSectionRequest } from "@seenelm/train-core";
import { ErrorMessage } from "../../../../../src/common/enums.js";
import { MongoServerError } from "mongodb";

interface ErrorTestCase<T> {
  description: string;
  request: T;
  error: Error;
}

interface SuccessTestCase<T, E, D, R> {
  description: string;
  request: T;
  entity: E;
  document?: Partial<D>;
  expectedResponse?: R;
}

interface GetCustomSectionsSuccessTestCase {
  description: string;
  userId: Types.ObjectId;
  entity: UserProfile;
  expectedResponse: CustomSectionResponse[];
}

export default class UserProfileServiceDataProvider {
  static updateUserProfileErrorCases(): ErrorTestCase<UserProfileRequest>[] {
    return [
      {
        description: "should throw NotFound error when profile not found",
        request: UserProfileTestFixture.createUserProfileRequest({
          userId: new Types.ObjectId().toString(),
        }),
        error: APIError.NotFound(ErrorMessage.USER_PROFILE_NOT_FOUND),
      },
      {
        description: "should handle DatabaseError when finding user profile",
        request: UserProfileTestFixture.createUserProfileRequest(),
        error: new MongooseError("Connection failed"),
      },
      {
        description: "should handle DatabaseError during updateOne",
        request: UserProfileTestFixture.createUserProfileRequest(),
        error: new MongoServerError({
          code: 11000,
          message: "Duplicate key error",
        }),
      },
      {
        description: "should throw InternalServerError for unknown errors",
        request: UserProfileTestFixture.createUserProfileRequest(),
        error: APIError.InternalServerError("Failed to update user profile"),
      },
    ];
  }

  static updateUserProfileSuccessCases(): SuccessTestCase<
    UserProfileRequest,
    UserProfile,
    UserProfileDocument,
    void
  >[] {
    return [
      {
        description: "should update user profile successfully with all fields",
        request: UserProfileTestFixture.createUserProfileRequest(),
        entity: UserProfileTestFixture.createUserProfileEntity(),
        document: UserProfileTestFixture.createUserProfileDocument(),
      },
      {
        description: "should update social links successfully",
        request: UserProfileTestFixture.createUserProfileRequest({
          socialLinks: [
            {
              platform: SocialPlatform.TIKTOK,
              url: "https://www.tiktok.com/@john_doe",
            },
          ],
        }),
        entity: UserProfileTestFixture.createUserProfileEntity(),
        document: UserProfileTestFixture.createUserProfileDocument({
          socialLinks: [
            {
              platform: SocialPlatform.TIKTOK,
              url: "https://www.tiktok.com/@john_doe",
            },
          ],
        }),
      },
      {
        description: "should update certifications successfully",
        request: UserProfileTestFixture.createUserProfileRequest({
          certifications: [
            {
              certification: new Types.ObjectId().toString(),
              specializations: ["Weight Training", "Cardio"],
              receivedDate: "2024-01-15",
            },
          ],
        }),
        entity: UserProfileTestFixture.createUserProfileEntity(),
        document: UserProfileTestFixture.createUserProfileDocument({
          certifications: [
            {
              certification: new Types.ObjectId(),
              specializations: ["Weight Training", "Cardio"],
              receivedDate: "2024-01-15",
            },
          ],
        }),
      },
      {
        description: "should update custom sections successfully",
        request: UserProfileTestFixture.createUserProfileRequest({
          customSections: [
            {
              title: CustomSectionType.ACHIEVEMENTS,
              details: [
                {
                  title: "First Place in Competition",
                  date: "2024-03-20",
                  description:
                    "Won first place in regional fitness competition",
                },
              ],
            },
            {
              title: CustomSectionType.STATS,
              details: [
                {
                  category: "Clients Trained",
                  value: "150",
                },
              ],
            },
          ],
        }),
        entity: UserProfileTestFixture.createUserProfileEntity(),
        document: UserProfileTestFixture.createUserProfileDocument({
          customSections: [
            {
              title: CustomSectionType.ACHIEVEMENTS,
              details: [
                {
                  title: "First Place in Competition",
                  date: "2024-03-20",
                  description:
                    "Won first place in regional fitness competition",
                },
              ],
            },
            {
              title: CustomSectionType.STATS,
              details: [
                {
                  category: "Clients Trained",
                  value: "150",
                },
              ],
            },
          ],
        }),
      },
    ];
  }

  static updateBasicUserProfileErrorCases(): ErrorTestCase<BasicUserProfileInfoRequest>[] {
    return [
      {
        description: "should throw NotFound error when user profile not found",
        request: UserProfileTestFixture.createBasicUserProfileInfoRequest({
          username: "user_011",
          role: "Bodybuilding Coach",
        }),
        error: APIError.NotFound(ErrorMessage.USER_PROFILE_NOT_FOUND),
      },
      {
        description: "should handle DatabaseError when finding user profile",
        request: UserProfileTestFixture.createBasicUserProfileInfoRequest(),
        error: new MongooseError("Connection failed"),
      },
      {
        description: "should handle DatabaseError during updateOne",
        request: UserProfileTestFixture.createBasicUserProfileInfoRequest(),
        error: new MongoServerError({
          code: 11000,
          message: "Duplicate key error",
        }),
      },
      {
        description: "should throw InternalServerError for unknown errors",
        request: UserProfileTestFixture.createBasicUserProfileInfoRequest(),
        error: APIError.InternalServerError(
          "Failed to update basic user profile info"
        ),
      },
    ];
  }

  static updateBasicUserProfileSuccessCases(): SuccessTestCase<
    BasicUserProfileInfoRequest,
    UserProfile,
    UserProfileDocument,
    void
  >[] {
    return [
      {
        description:
          "should update basic user profile successfully with all fields",
        request: UserProfileTestFixture.createBasicUserProfileInfoRequest(),
        entity: UserProfileTestFixture.createUserProfileEntity(),
      },
      {
        description: "should update basic user profile with minimal fields",
        request: {
          username: "test_user",
          name: "John Doe",
          accountType: 1,
        },
        entity: UserProfileTestFixture.createUserProfileEntity(),
      },
    ];
  }

  static createCustomSectionErrorCases(): ErrorTestCase<CustomSectionRequest>[] {
    return [
      {
        description: "should throw NotFound error when user profile not found",
        request: UserProfileTestFixture.createCustomSectionRequest({
          title: CustomSectionType.ACHIEVEMENTS,
          details: [
            {
              title: "Test Achievement",
              date: "2024-03-20",
              description: "Test description",
            },
          ],
        }),
        error: APIError.NotFound(ErrorMessage.USER_PROFILE_NOT_FOUND),
      },
      {
        description:
          "should throw Conflict error when custom section already exists",
        request: UserProfileTestFixture.createCustomSectionRequest({
          title: CustomSectionType.ACHIEVEMENTS,
          details: [
            {
              title: "Test Achievement",
              date: "2024-03-20",
              description: "Test description",
            },
          ],
        }),
        error: APIError.Conflict(ErrorMessage.CUSTOM_SECTION_ALREADY_EXISTS),
      },
      {
        description: "should handle DatabaseError for custom section creation",
        request: UserProfileTestFixture.createCustomSectionRequest({
          title: CustomSectionType.IDENTITY,
          details: ["Bodybuilding Coach", "Athletic Trainer"],
        }),
        error: new MongooseError("Connection failed"),
      },
      {
        description:
          "should throw InternalServerError for unknown errors in custom section creation",
        request: UserProfileTestFixture.createCustomSectionRequest({
          title: CustomSectionType.SPECIALIZATION,
          details: ["Weight Training", "TRX Suspension Training"],
        }),
        error: APIError.InternalServerError("Failed to create custom section"),
      },
    ];
  }

  static updateCustomSectionErrorCases(): ErrorTestCase<CustomSectionRequest>[] {
    return [
      {
        description: "should throw NotFound error when user profile not found",
        request: UserProfileTestFixture.createCustomSectionRequest({
          title: CustomSectionType.ACHIEVEMENTS,
          details: [
            {
              title: "Test Achievement",
              date: "2024-03-20",
              description: "Test description",
            },
          ],
        }),
        error: APIError.NotFound(ErrorMessage.USER_PROFILE_NOT_FOUND),
      },
      {
        description:
          "should throw NotFound error when custom section not found",
        request: UserProfileTestFixture.createCustomSectionRequest({
          title: CustomSectionType.SPECIALIZATION,
          details: ["Weight Training", "TRX Suspension Training"],
        }),
        error: APIError.NotFound(ErrorMessage.CUSTOM_SECTION_NOT_FOUND),
      },
      {
        description: "should handle DatabaseError for custom section update",
        request: UserProfileTestFixture.createCustomSectionRequest({
          title: CustomSectionType.IDENTITY,
          details: ["Bodybuilding Coach", "Athletic Trainer"],
        }),
        error: new MongooseError("Connection failed"),
      },
      {
        description:
          "should throw InternalServerError for unknown errors in custom section update",
        request: UserProfileTestFixture.createCustomSectionRequest({
          title: CustomSectionType.PHILOSOPHY,
          details: ["Consistency over perfection"],
        }),
        error: APIError.InternalServerError("Failed to update custom section"),
      },
    ];
  }

  static deleteCustomSectionErrorCases(): ErrorTestCase<{
    userId: Types.ObjectId;
    sectionTitle: CustomSectionType;
  }>[] {
    return [
      {
        description: "should throw NotFound error when user profile not found",
        request: {
          userId: new Types.ObjectId(),
          sectionTitle: CustomSectionType.ACHIEVEMENTS,
        },
        error: APIError.NotFound(ErrorMessage.USER_PROFILE_NOT_FOUND),
      },
      {
        description:
          "should throw NotFound error when custom section not found",
        request: {
          userId: new Types.ObjectId(),
          sectionTitle: CustomSectionType.SPECIALIZATION,
        },
        error: APIError.NotFound(ErrorMessage.CUSTOM_SECTION_NOT_FOUND),
      },
      {
        description: "should handle DatabaseError for custom section deletion",
        request: {
          userId: new Types.ObjectId(),
          sectionTitle: CustomSectionType.IDENTITY,
        },
        error: new MongooseError("Connection failed"),
      },
      {
        description:
          "should throw InternalServerError for unknown errors in custom section deletion",
        request: {
          userId: new Types.ObjectId(),
          sectionTitle: CustomSectionType.PHILOSOPHY,
        },
        error: APIError.InternalServerError("Failed to delete custom section"),
      },
    ];
  }

  static getCustomSectionsSuccessCases(): SuccessTestCase<
    { userId: Types.ObjectId },
    UserProfile,
    UserProfileDocument,
    CustomSectionResponse[]
  >[] {
    return [
      {
        description:
          "should get custom sections successfully when user has multiple sections",
        request: {
          userId: new Types.ObjectId(),
        },
        entity: UserProfileTestFixture.createUserProfileEntity((builder) =>
          builder.setCustomSections([
            {
              title: CustomSectionType.ACHIEVEMENTS,
              details: [
                {
                  title: "First Place in Competition",
                  date: "2024-03-20",
                  description:
                    "Won first place in regional fitness competition",
                },
                {
                  title: "Certified Personal Trainer",
                  date: "2024-01-15",
                  description: "Obtained NASM certification",
                },
              ],
            },
            {
              title: CustomSectionType.SPECIALIZATION,
              details: ["Weight Training", "TRX Suspension Training"],
            },
            {
              title: CustomSectionType.IDENTITY,
              details: ["Bodybuilding Coach", "Athletic Trainer"],
            },
          ])
        ),
        expectedResponse: [
          {
            title: CustomSectionType.ACHIEVEMENTS,
            details: [
              {
                title: "First Place in Competition",
                date: "2024-03-20",
                description: "Won first place in regional fitness competition",
              },
              {
                title: "Certified Personal Trainer",
                date: "2024-01-15",
                description: "Obtained NASM certification",
              },
            ],
          },
          {
            title: CustomSectionType.SPECIALIZATION,
            details: ["Weight Training", "TRX Suspension Training"],
          },
          {
            title: CustomSectionType.IDENTITY,
            details: ["Bodybuilding Coach", "Athletic Trainer"],
          },
        ],
      },
      {
        description: "should get empty array when user has no custom sections",
        request: {
          userId: new Types.ObjectId(),
        },
        entity: UserProfileTestFixture.createUserProfileEntity((builder) =>
          builder.setCustomSections([])
        ),
        expectedResponse: [],
      },
      {
        description: "should get single achievement section successfully",
        request: {
          userId: new Types.ObjectId(),
        },
        entity: UserProfileTestFixture.createUserProfileEntity((builder) =>
          builder.setCustomSections([
            {
              title: CustomSectionType.ACHIEVEMENTS,
              details: [
                {
                  title: "Test Achievement",
                  date: "2024-03-20",
                  description: "Test description",
                },
              ],
            },
          ])
        ),
        expectedResponse: [
          {
            title: CustomSectionType.ACHIEVEMENTS,
            details: [
              {
                title: "Test Achievement",
                date: "2024-03-20",
                description: "Test description",
              },
            ],
          },
        ],
      },
    ];
  }

  static getCustomSectionsErrorCases(): ErrorTestCase<{
    userId: Types.ObjectId;
  }>[] {
    return [
      {
        description: "should throw NotFound error when user profile not found",
        request: {
          userId: new Types.ObjectId(),
        },
        error: APIError.NotFound(ErrorMessage.USER_PROFILE_NOT_FOUND),
      },
      {
        description: "should handle DatabaseError for get custom sections",
        request: {
          userId: new Types.ObjectId(),
        },
        error: new MongooseError("Connection failed"),
      },
      {
        description:
          "should throw InternalServerError for unknown errors in get custom sections",
        request: {
          userId: new Types.ObjectId(),
        },
        error: APIError.InternalServerError("Failed to get custom sections"),
      },
    ];
  }
}
