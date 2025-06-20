import { UserProfileRequest } from "@seenelm/train-core";
import UserProfileTestFixture from "../fixtures/UserProfileTestFixture.js";
import { ErrorResponse } from "../../src/common/errors/types.js";
import { Types } from "mongoose";
import { APIErrorType } from "../../src/common/enums.js";
import UserProfile from "../../src/infrastructure/database/entity/user/UserProfile.js";
import { UserProfileDocument } from "../../src/infrastructure/database/models/userProfile/userProfileModel.js";
import { APIError } from "../../src/common/errors/APIError.js";
import { Error as MongooseError } from "mongoose";
import { SocialPlatform, CustomSectionType } from "@seenelm/train-core";
import { CustomSectionRequest } from "@seenelm/train-core";

interface ErrorTestCase<T> {
  description: string;
  request: T;
  error: Error;
  expectedErrorResponse: Partial<ErrorResponse>;
}

interface SuccessTestCase<T, E, D> {
  description: string;
  request: T;
  entity: E;
  document: Partial<D>;
  expectedResponse?: Partial<T>;
}

export default class UserProfileDataProvider {
  static updateUserProfileErrorCases(): ErrorTestCase<UserProfileRequest>[] {
    return [
      {
        description: "should throw NotFound error when profile not found",
        request: UserProfileTestFixture.createUserProfileRequest({
          userId: new Types.ObjectId().toString(),
        }),
        error: APIError.NotFound(APIErrorType.UserProfileNotFound),
        expectedErrorResponse: {
          message: APIErrorType.UserProfileNotFound,
          errorCode: "NOT_FOUND",
        },
      },
      {
        description: "should handle DatabaseError",
        request: UserProfileTestFixture.createUserProfileRequest(),
        error: new MongooseError("Connection failed"),
        expectedErrorResponse: {
          message: "Database error occurred",
          errorCode: "DATABASE_ERROR",
        },
      },
      {
        description: "should throw InternalServerError for unknown errors",
        request: UserProfileTestFixture.createUserProfileRequest(),
        error: APIError.InternalServerError("Failed to update user profile"),
        expectedErrorResponse: {
          message: "Failed to update user profile",
          errorCode: "INTERNAL_SERVER_ERROR",
        },
      },
    ];
  }

  static updateUserProfileSuccessCases(): SuccessTestCase<
    UserProfileRequest,
    UserProfile,
    UserProfileDocument
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
        error: APIError.NotFound("User profile not found"),
        expectedErrorResponse: {
          message: "User profile not found",
          errorCode: "NOT_FOUND",
        },
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
        error: APIError.Conflict("Custom section already exists"),
        expectedErrorResponse: {
          message: "Custom section already exists",
          errorCode: "CONFLICT",
        },
      },
      {
        description: "should handle DatabaseError for custom section creation",
        request: UserProfileTestFixture.createCustomSectionRequest({
          title: CustomSectionType.IDENTITY,
          details: [
            {
              role: "Fitness Enthusiast",
              experience: 5,
              isCertified: true,
            },
          ],
        }),
        error: new MongooseError("Connection failed"),
        expectedErrorResponse: {
          message: "Database error occurred",
          errorCode: "DATABASE_ERROR",
        },
      },
      {
        description:
          "should throw InternalServerError for unknown errors in custom section creation",
        request: UserProfileTestFixture.createCustomSectionRequest({
          title: CustomSectionType.SPECIALIZATION,
          details: [
            {
              specialization: "Weight Training",
              level: "Advanced",
            },
          ],
        }),
        error: APIError.InternalServerError("Failed to create custom section"),
        expectedErrorResponse: {
          message: "Failed to create custom section",
          errorCode: "INTERNAL_SERVER_ERROR",
        },
      },
    ];
  }
}
