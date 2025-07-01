import { CustomSectionRequest } from "@seenelm/train-core";
import { Types } from "mongoose";
import UserProfileTestFixture from "../../../../fixtures/UserProfileTestFixture.js";
import { APIError } from "../../../../../src/common/errors/APIError.js";
import { CustomSectionType } from "@seenelm/train-core";
import { DatabaseError } from "../../../../../src/common/errors/DatabaseError.js";
import { Request } from "express";
import { ErrorMessage } from "../../../../../src/common/enums.js";
import { UserProfileRequest, SocialPlatform } from "@seenelm/train-core";

interface ErrorTestCase<T> {
  description: string;
  request: {
    params: Record<string, string>;
    body?: T;
  };
  error: Error;
}

interface SuccessTestCase<T> {
  description: string;
  request: {
    params: Record<string, string>;
    body?: T;
  };
}

interface DeleteCustomSectionErrorTestCase {
  description: string;
  request: {
    params: Record<string, string>;
  };
  error: Error;
}

export default class UserProfileControllerDataProvider {
  static updateUserProfileSuccessCases(): SuccessTestCase<UserProfileRequest>[] {
    return [
      {
        description: "should update user profile successfully with all fields",
        request: {
          params: {},
          body: UserProfileTestFixture.createUserProfileRequest(),
        },
      },
      {
        description: "should update user profile with social links",
        request: {
          params: {},
          body: UserProfileTestFixture.createUserProfileRequest({
            socialLinks: [
              {
                platform: SocialPlatform.INSTAGRAM,
                url: "https://www.instagram.com/john_doe",
              },
              {
                platform: SocialPlatform.TIKTOK,
                url: "https://www.tiktok.com/@john_doe",
              },
            ],
          }),
        },
      },
      {
        description: "should update user profile with certifications",
        request: {
          params: {},
          body: UserProfileTestFixture.createUserProfileRequest({
            certifications: [
              {
                certification: new Types.ObjectId().toString(),
                specializations: ["Weight Training", "Cardio"],
                receivedDate: "2024-01-15",
              },
            ],
          }),
        },
      },
      {
        description: "should update user profile with custom sections",
        request: {
          params: {},
          body: UserProfileTestFixture.createUserProfileRequest({
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
      },
    ];
  }

  static updateUserProfileErrorCases(): ErrorTestCase<UserProfileRequest>[] {
    return [
      {
        description: "should handle NotFound error when profile not found",
        request: {
          params: {},
          body: UserProfileTestFixture.createUserProfileRequest({
            userId: new Types.ObjectId().toString(),
          }),
        },
        error: APIError.NotFound(ErrorMessage.USER_PROFILE_NOT_FOUND),
      },
      {
        description: "should handle DatabaseError",
        request: {
          params: {},
          body: UserProfileTestFixture.createUserProfileRequest(),
        },
        error: new DatabaseError("Database connection failed"),
      },
      {
        description: "should handle InternalServerError",
        request: {
          params: {},
          body: UserProfileTestFixture.createUserProfileRequest(),
        },
        error: APIError.InternalServerError("Failed to update user profile"),
      },
    ];
  }

  static createCustomSectionErrorCases(): ErrorTestCase<CustomSectionRequest>[] {
    return [
      {
        description: "should handle NotFound error",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: UserProfileTestFixture.createCustomSectionRequest({
            title: CustomSectionType.ACHIEVEMENTS,
            details: [
              {
                title: "Test Achievement",
                date: "2024-03-20",
                description: "Test description",
              },
            ],
          }),
        },
        error: APIError.NotFound(ErrorMessage.USER_PROFILE_NOT_FOUND),
      },
      {
        description: "should handle Conflict error",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: UserProfileTestFixture.createCustomSectionRequest({
            title: CustomSectionType.ACHIEVEMENTS,
            details: [
              {
                title: "Test Achievement",
                date: "2024-03-20",
                description: "Test description",
              },
            ],
          }),
        },
        error: APIError.Conflict(ErrorMessage.CUSTOM_SECTION_ALREADY_EXISTS),
      },
      {
        description: "should handle DatabaseError",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: UserProfileTestFixture.createCustomSectionRequest({
            title: CustomSectionType.IDENTITY,
            details: ["Bodybuilding Coach", "Athletic Trainer"],
          }),
        },
        error: new DatabaseError("Database connection failed"),
      },
      {
        description: "should handle InternalServerError",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: UserProfileTestFixture.createCustomSectionRequest({
            title: CustomSectionType.SPECIALIZATION,
            details: ["Weight Training", "TRX Suspension Training"],
          }),
        },
        error: APIError.InternalServerError("Internal server error"),
      },
    ];
  }

  static getCustomSectionsErrorCases(): ErrorTestCase<{ userId: string }>[] {
    return [
      {
        description: "should handle NotFound error",
        request: {
          params: { userId: new Types.ObjectId().toString() },
        },
        error: APIError.NotFound(ErrorMessage.USER_PROFILE_NOT_FOUND),
      },
      {
        description: "should handle DatabaseError",
        request: {
          params: { userId: new Types.ObjectId().toString() },
        },
        error: new DatabaseError("Database connection failed"),
      },
      {
        description: "should handle InternalServerError",
        request: {
          params: { userId: new Types.ObjectId().toString() },
        },
        error: APIError.InternalServerError("Internal server error"),
      },
    ];
  }

  static updateCustomSectionErrorCases(): ErrorTestCase<CustomSectionRequest>[] {
    return [
      {
        description: "should handle NotFound error when user profile not found",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: UserProfileTestFixture.createCustomSectionRequest({
            title: CustomSectionType.ACHIEVEMENTS,
            details: [
              {
                title: "Test Achievement",
                date: "2024-03-20",
                description: "Test description",
              },
            ],
          }),
        },
        error: APIError.NotFound(ErrorMessage.USER_PROFILE_NOT_FOUND),
      },
      {
        description:
          "should handle NotFound error when custom section not found",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: UserProfileTestFixture.createCustomSectionRequest({
            title: CustomSectionType.SPECIALIZATION,
            details: ["Weight Training", "TRX Suspension Training"],
          }),
        },
        error: APIError.NotFound(ErrorMessage.CUSTOM_SECTION_NOT_FOUND),
      },
      {
        description: "should handle DatabaseError",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: UserProfileTestFixture.createCustomSectionRequest({
            title: CustomSectionType.IDENTITY,
            details: ["Bodybuilding Coach", "Athletic Trainer"],
          }),
        },
        error: new DatabaseError("Database connection failed"),
      },
      {
        description: "should handle InternalServerError",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: UserProfileTestFixture.createCustomSectionRequest({
            title: CustomSectionType.PHILOSOPHY,
            details: ["Consistency over perfection", "Progressive overload"],
          }),
        },
        error: APIError.InternalServerError("Internal server error"),
      },
    ];
  }

  static deleteCustomSectionErrorCases(): DeleteCustomSectionErrorTestCase[] {
    return [
      {
        description: "should handle NotFound error when user profile not found",
        request: {
          params: {
            userId: new Types.ObjectId().toString(),
            sectionTitle: CustomSectionType.ACHIEVEMENTS,
          },
        },
        error: APIError.NotFound(ErrorMessage.USER_PROFILE_NOT_FOUND),
      },
      {
        description:
          "should handle NotFound error when custom section not found",
        request: {
          params: {
            userId: new Types.ObjectId().toString(),
            sectionTitle: CustomSectionType.SPECIALIZATION,
          },
        },
        error: APIError.NotFound(ErrorMessage.CUSTOM_SECTION_NOT_FOUND),
      },
      {
        description: "should handle DatabaseError",
        request: {
          params: {
            userId: new Types.ObjectId().toString(),
            sectionTitle: CustomSectionType.IDENTITY,
          },
        },
        error: new DatabaseError("Database connection failed"),
      },
      {
        description: "should handle InternalServerError",
        request: {
          params: {
            userId: new Types.ObjectId().toString(),
            sectionTitle: CustomSectionType.PHILOSOPHY,
          },
        },
        error: APIError.InternalServerError("Internal server error"),
      },
    ];
  }
}
