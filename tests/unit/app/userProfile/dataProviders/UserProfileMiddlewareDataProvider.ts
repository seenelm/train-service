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
    body?: any;
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
  static validateGetCustomSectionsSuccessCases(): SuccessTestCase[] {
    return [
      {
        description: "should pass validation for valid userId",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: {},
        },
      },
      {
        description: "should pass validation for valid ObjectId format",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: {},
        },
      },
    ];
  }

  static validateGetCustomSectionsErrorCases(): ErrorTestCase[] {
    return [
      {
        description: "should throw BadRequest when userId is missing",
        request: {
          params: {},
          body: {},
        },
        error: APIError.BadRequest("Validation failed", [
          ValidationErrorMessage.USER_ID_REQUIRED,
        ]),
        validationErrors: [ValidationErrorMessage.USER_ID_REQUIRED],
        expectedErrorResponse: {
          message: "Validation failed",
          errorCode: "BAD_REQUEST",
          details: [ValidationErrorMessage.USER_ID_REQUIRED],
        },
      },
      {
        description: "should throw BadRequest when userId is invalid format",
        request: {
          params: { userId: "invalid-user-id" },
          body: {},
        },
        error: APIError.BadRequest("Validation failed", [
          ValidationErrorMessage.USER_ID_INVALID_FORMAT,
        ]),
        validationErrors: [ValidationErrorMessage.USER_ID_INVALID_FORMAT],
        expectedErrorResponse: {
          message: "Validation failed",
          errorCode: "BAD_REQUEST",
          details: [ValidationErrorMessage.USER_ID_INVALID_FORMAT],
        },
      },
      {
        description: "should throw BadRequest when userId is empty string",
        request: {
          params: { userId: "" },
          body: {},
        },
        error: APIError.BadRequest("Validation failed", [
          ValidationErrorMessage.USER_ID_REQUIRED,
        ]),
        validationErrors: [ValidationErrorMessage.USER_ID_REQUIRED],
        expectedErrorResponse: {
          message: "Validation failed",
          errorCode: "BAD_REQUEST",
          details: [ValidationErrorMessage.USER_ID_REQUIRED],
        },
      },
    ];
  }

  static validateDeleteCustomSectionSuccessCases(): SuccessTestCase[] {
    return [
      {
        description:
          "should pass validation for custom section type achievements",
        request: {
          params: {
            userId: new Types.ObjectId().toString(),
            sectionTitle: CustomSectionType.ACHIEVEMENTS,
          },
          body: {},
        },
      },
      {
        description:
          "should pass validation for custom section type specialization",
        request: {
          params: {
            userId: new Types.ObjectId().toString(),
            sectionTitle: CustomSectionType.SPECIALIZATION,
          },
          body: {},
        },
      },
      {
        description: "should pass validation for custom section type identity",
        request: {
          params: {
            userId: new Types.ObjectId().toString(),
            sectionTitle: CustomSectionType.IDENTITY,
          },
          body: {},
        },
      },
      {
        description:
          "should pass validation for custom section type philosophy",
        request: {
          params: {
            userId: new Types.ObjectId().toString(),
            sectionTitle: CustomSectionType.PHILOSOPHY,
          },
          body: {},
        },
      },
      {
        description: "should pass validation for custom section type goals",
        request: {
          params: {
            userId: new Types.ObjectId().toString(),
            sectionTitle: CustomSectionType.GOALS,
          },
          body: {},
        },
      },
      {
        description: "should pass validation for custom section type stats",
        request: {
          params: {
            userId: new Types.ObjectId().toString(),
            sectionTitle: CustomSectionType.STATS,
          },
          body: {},
        },
      },
    ];
  }

  static validateDeleteCustomSectionErrorCases(): ErrorTestCase[] {
    return [
      {
        description: "should throw BadRequest when userId is missing",
        request: {
          params: { sectionTitle: CustomSectionType.ACHIEVEMENTS },
        },
        error: APIError.BadRequest("Validation failed", [
          ValidationErrorMessage.USER_ID_REQUIRED,
        ]),
        validationErrors: [ValidationErrorMessage.USER_ID_REQUIRED],
        expectedErrorResponse: {
          message: "Validation failed",
          errorCode: "BAD_REQUEST",
          details: [ValidationErrorMessage.USER_ID_REQUIRED],
        },
      },
      {
        description: "should throw BadRequest when userId is invalid format",
        request: {
          params: {
            userId: "invalid-user-id",
            sectionTitle: CustomSectionType.ACHIEVEMENTS,
          },
        },
        error: APIError.BadRequest("Validation failed", [
          ValidationErrorMessage.USER_ID_INVALID_FORMAT,
        ]),
        validationErrors: [ValidationErrorMessage.USER_ID_INVALID_FORMAT],
        expectedErrorResponse: {
          message: "Validation failed",
          errorCode: "BAD_REQUEST",
          details: [ValidationErrorMessage.USER_ID_INVALID_FORMAT],
        },
      },
      {
        description: "should throw BadRequest when sectionTitle is missing",
        request: {
          params: { userId: new Types.ObjectId().toString() },
        },
        error: APIError.BadRequest("Validation failed", [
          ValidationErrorMessage.CUSTOM_SECTION_TITLE_REQUIRED,
        ]),
        validationErrors: [
          ValidationErrorMessage.CUSTOM_SECTION_TITLE_REQUIRED,
        ],
        expectedErrorResponse: {
          message: "Validation failed",
          errorCode: "BAD_REQUEST",
          details: [ValidationErrorMessage.CUSTOM_SECTION_TITLE_REQUIRED],
        },
      },
      {
        description: "should throw BadRequest when sectionTitle is invalid",
        request: {
          params: {
            userId: new Types.ObjectId().toString(),
            sectionTitle: "InvalidSection",
          },
        },
        error: APIError.BadRequest("Validation failed", [
          ValidationErrorMessage.CUSTOM_SECTION_TITLE_INVALID,
        ]),
        validationErrors: [ValidationErrorMessage.CUSTOM_SECTION_TITLE_INVALID],
        expectedErrorResponse: {
          message: "Validation failed",
          errorCode: "BAD_REQUEST",
          details: [ValidationErrorMessage.CUSTOM_SECTION_TITLE_INVALID],
        },
      },
      {
        description:
          "should throw BadRequest when both userId and sectionTitle are missing",
        request: {
          params: {},
        },
        error: APIError.BadRequest("Validation failed", [
          ValidationErrorMessage.USER_ID_REQUIRED,
          ValidationErrorMessage.CUSTOM_SECTION_TITLE_REQUIRED,
        ]),
        validationErrors: [
          ValidationErrorMessage.USER_ID_REQUIRED,
          ValidationErrorMessage.CUSTOM_SECTION_TITLE_REQUIRED,
        ],
        expectedErrorResponse: {
          message: "Validation failed",
          errorCode: "BAD_REQUEST",
          details: [
            ValidationErrorMessage.USER_ID_REQUIRED,
            ValidationErrorMessage.CUSTOM_SECTION_TITLE_REQUIRED,
          ],
        },
      },
    ];
  }

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
        description: "should throw BadRequest when section title is invalid",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: {
            title: "InvalidSection",
            details: [
              {
                title: "Test Achievement",
                date: "2024-03-20",
                description: "Test description",
              },
            ],
          },
        },
        error: APIError.BadRequest("Validation failed", [
          ValidationErrorMessage.CUSTOM_SECTION_TITLE_INVALID,
        ]),
        validationErrors: [ValidationErrorMessage.CUSTOM_SECTION_TITLE_INVALID],
        expectedErrorResponse: {
          message: "Validation failed",
          errorCode: "BAD_REQUEST",
          details: [ValidationErrorMessage.CUSTOM_SECTION_TITLE_INVALID],
        },
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
      {
        description:
          "should throw BadRequest when generic item has invalid format",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: {
            title: CustomSectionType.IDENTITY,
            details: [
              {
                role: "Fitness Coach",
                experience: ["5 years"],
                isCertified: true,
              },
            ],
          },
        },
        error: APIError.BadRequest("Validation failed", [
          ValidationErrorMessage.GENERIC_ITEM_INVALID_FORMAT,
        ]),
        validationErrors: [ValidationErrorMessage.GENERIC_ITEM_INVALID_FORMAT],
        expectedErrorResponse: {
          message: "Validation failed",
          errorCode: "BAD_REQUEST",
          details: [ValidationErrorMessage.GENERIC_ITEM_INVALID_FORMAT],
        },
      },
    ];
  }

  static validateUpdateCustomSectionSuccessCases(): SuccessTestCase[] {
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
        description: "should pass validation for valid specialization section",
        request: {
          params: { userId: "507f1f77bcf86cd799439011" },
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
      {
        description: "should pass validation for valid identity section",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: UserProfileTestFixture.createCustomSectionRequest({
            title: CustomSectionType.IDENTITY,
            details: [
              {
                role: "Fitness Coach",
                experience: 5,
                isCertified: true,
              },
            ],
          }),
        },
      },
      {
        description: "should pass validation for valid philosophy section",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: UserProfileTestFixture.createCustomSectionRequest({
            title: CustomSectionType.PHILOSOPHY,
            details: [
              {
                title: "Philosophy",
                description: "Philosophy description",
              },
            ],
          }),
        },
      },
      {
        description: "should pass validation for valid goals section",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: UserProfileTestFixture.createCustomSectionRequest({
            title: CustomSectionType.GOALS,
            details: [
              {
                title: "Goals",
                description: "Goals description",
              },
            ],
          }),
        },
      },
      {
        description: "should pass validation for valid stats section",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: UserProfileTestFixture.createCustomSectionRequest({
            title: CustomSectionType.STATS,
            details: [
              {
                title: "Stats",
                description: "Stats description",
              },
            ],
          }),
        },
      },
    ];
  }

  static validateUpdateCustomSectionErrorCases(): ErrorTestCase[] {
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
        description: "should throw BadRequest when section title is invalid",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: {
            title: "InvalidSection",
            details: [
              {
                title: "Test Achievement",
                date: "2024-03-20",
                description: "Test description",
              },
            ],
          },
        },
        error: APIError.BadRequest("Validation failed", [
          ValidationErrorMessage.CUSTOM_SECTION_TITLE_INVALID,
        ]),
        validationErrors: [ValidationErrorMessage.CUSTOM_SECTION_TITLE_INVALID],
        expectedErrorResponse: {
          message: "Validation failed",
          errorCode: "BAD_REQUEST",
          details: [ValidationErrorMessage.CUSTOM_SECTION_TITLE_INVALID],
        },
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
      {
        description:
          "should throw BadRequest when generic item has invalid format",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: {
            title: CustomSectionType.IDENTITY,
            details: [
              {
                role: "Fitness Coach",
                experience: ["5 years"],
                isCertified: true,
              },
            ],
          },
        },
        error: APIError.BadRequest("Validation failed", [
          ValidationErrorMessage.GENERIC_ITEM_INVALID_FORMAT,
        ]),
        validationErrors: [ValidationErrorMessage.GENERIC_ITEM_INVALID_FORMAT],
        expectedErrorResponse: {
          message: "Validation failed",
          errorCode: "BAD_REQUEST",
          details: [ValidationErrorMessage.GENERIC_ITEM_INVALID_FORMAT],
        },
      },
    ];
  }
}
