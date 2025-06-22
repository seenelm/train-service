import UserProfileTestFixture from "../../../../fixtures/UserProfileTestFixture.js";
import { CustomSectionType, CustomSectionRequest } from "@seenelm/train-core";
import { APIError } from "../../../../../src/common/errors/APIError.js";
import { Types } from "mongoose";
import { ErrorResponse } from "../../../../../src/common/errors/types.js";
import { ValidationErrorMessage } from "../../../../../src/common/enums.js";

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
          ValidationErrorMessage.USER_ID_REQUIRED,
        ]),
        validationErrors: [ValidationErrorMessage.USER_ID_REQUIRED],
      },
      {
        description: "should throw BadRequest when userId is invalid ObjectId",
        request: {
          params: { userId: "invalid-object-id" },
          body: UserProfileTestFixture.createCustomSectionRequest(),
        },
        error: APIError.BadRequest("Validation failed", [
          ValidationErrorMessage.USER_ID_INVALID_FORMAT,
        ]),
        validationErrors: [ValidationErrorMessage.USER_ID_INVALID_FORMAT],
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
          ValidationErrorMessage.CUSTOM_SECTION_TITLE_INVALID,
        ]),
        validationErrors: [ValidationErrorMessage.CUSTOM_SECTION_TITLE_INVALID],
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
          ValidationErrorMessage.CUSTOM_SECTION_DETAILS_INVALID,
        ]),
        validationErrors: [
          ValidationErrorMessage.CUSTOM_SECTION_DETAILS_INVALID,
        ],
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
          ValidationErrorMessage.CUSTOM_SECTION_DETAILS_INVALID,
        ]),
        validationErrors: [
          ValidationErrorMessage.CUSTOM_SECTION_DETAILS_INVALID,
        ],
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
          ValidationErrorMessage.ACHIEVEMENT_ITEM_INVALID_FORMAT,
        ]),
        validationErrors: [
          ValidationErrorMessage.ACHIEVEMENT_ITEM_INVALID_FORMAT,
        ],
      },
    ];
  }
}
