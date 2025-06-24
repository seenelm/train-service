import { CustomSectionRequest } from "@seenelm/train-core";
import { Types } from "mongoose";
import UserProfileTestFixture from "../../../../fixtures/UserProfileTestFixture.js";
import { APIError } from "../../../../../src/common/errors/APIError.js";
import { CustomSectionType } from "@seenelm/train-core";
import { DatabaseError } from "../../../../../src/common/errors/DatabaseError.js";
import { Request } from "express";
import { ErrorMessage } from "../../../../../src/common/enums.js";

interface ErrorTestCase<T> {
  description: string;
  request: {
    params: Record<string, string>;
    body?: T;
  };
  error: Error;
}

export default class UserProfileControllerDataProvider {
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
        error: APIError.NotFound("User profile not found"),
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
        error: APIError.Conflict("Custom section already exists"),
      },
      {
        description: "should handle DatabaseError",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: UserProfileTestFixture.createCustomSectionRequest({
            title: CustomSectionType.IDENTITY,
            details: [
              {
                role: "Fitness Enthusiast",
                experience: 5,
                isCertified: true,
              },
            ],
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
            details: [
              {
                specialization: "Weight Training",
                level: "Advanced",
              },
            ],
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
}
