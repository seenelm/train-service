import UserProfileTestFixture from "../../fixtures/UserProfileTestFixture.js";
import { CustomSectionType, CustomSectionRequest } from "@seenelm/train-core";
import { APIError } from "../../../src/common/errors/APIError.js";
import { Types } from "mongoose";
import { ErrorResponse } from "../../../src/common/errors/types.js";

interface ErrorTestCase {
  description: string;
  request: {
    params: Record<string, string>;
    body: any;
  };
  error: Error;
  validationErrors: string[];
  expectedErrorResponse?: Partial<ErrorResponse>;
}

interface SuccessTestCase {
  description: string;
  request: {
    params: Record<string, string>;
    body: any;
  };
}

export default class UserProfileMiddlewareDataProvider {
  static validateCreateCustomSectionSuccessCases(): SuccessTestCase[] {
    return [
      {
        description: "should pass validation for valid achievements section",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: UserProfileTestFixture.createCustomSectionRequest({
            title: CustomSectionType.ACHIEVEMENTS,
            details: [
              {
                title: "First Place",
                date: "2024-03-20",
                description: "Won first place in competition",
              },
            ],
          }),
        },
      },
      {
        description:
          "should pass validation for achievement with optional fields",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: UserProfileTestFixture.createCustomSectionRequest({
            title: CustomSectionType.ACHIEVEMENTS,
            details: [
              {
                title: "Test Achievement",
                // date and description are optional
              },
            ],
          }),
        },
      },
      {
        description: "should pass validation for valid specialization section",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: UserProfileTestFixture.createCustomSectionRequest({
            title: CustomSectionType.SPECIALIZATION,
            details: [
              {
                specialization: "Weight Training",
                level: "Advanced",
                yearsOfExperience: 3,
              },
            ],
          }),
        },
      },
    ];
  }
  static validateCreateCustomSectionErrorCases(): ErrorTestCase[] {
    return [
      {
        description: "should throw BadRequest when userId is missing",
        request: {
          params: {},
          body: UserProfileTestFixture.createCustomSectionRequest(),
        },
        error: APIError.BadRequest("Validation failed", [
          "User ID is required",
        ]),
        validationErrors: ["User ID is required"],
        expectedErrorResponse: {
          message: "Validation failed",
          errorCode: "BAD_REQUEST",
          details: ["User ID is required"],
        },
      },
      {
        description: "should throw BadRequest when userId is invalid ObjectId",
        request: {
          params: { userId: "invalid-object-id" },
          body: UserProfileTestFixture.createCustomSectionRequest(),
        },
        error: APIError.BadRequest("Validation failed", [
          "Invalid user ID format",
        ]),
        validationErrors: ["Invalid user ID format"],
      },
      {
        description: "should throw BadRequest when section title is missing",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: UserProfileTestFixture.createCustomSectionRequest({
            title: undefined,
          }),
        },
        error: APIError.BadRequest("Validation failed", [
          "Invalid custom section title",
        ]),
        validationErrors: ["Invalid custom section title"],
      },
      {
        description: "should throw BadRequest when details is empty array",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: UserProfileTestFixture.createCustomSectionRequest({
            title: CustomSectionType.ACHIEVEMENTS,
            details: [],
          }),
        },
        error: APIError.BadRequest("Validation failed", [
          "Invalid custom section details",
        ]),
        validationErrors: ["Invalid custom section details"],
      },
      {
        description: "should throw BadRequest when details is undefined",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: UserProfileTestFixture.createCustomSectionRequest({
            title: CustomSectionType.ACHIEVEMENTS,
            details: undefined,
          }),
        },
        error: APIError.BadRequest("Validation failed", [
          "Invalid custom section details",
        ]),
        validationErrors: ["Invalid custom section details"],
      },
      {
        description:
          "should throw BadRequest when achievement item has invalid title type",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: {
            title: CustomSectionType.ACHIEVEMENTS,
            details: [
              {
                title: 123, // Should be string
                date: "2024-03-20",
                description: "Test description",
              },
            ],
          },
        },
        error: APIError.BadRequest("Validation failed", [
          "Invalid achievement item",
        ]),
        validationErrors: ["Invalid achievement item"],
      },
    ];
  }
}
