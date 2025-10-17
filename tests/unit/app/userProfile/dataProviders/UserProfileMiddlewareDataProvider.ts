import UserProfileTestFixture from "../../../../fixtures/UserProfileTestFixture.js";
import { CustomSectionType } from "@seenelm/train-core";
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
        description: "should pass validation for valid stats section",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: {
            title: CustomSectionType.STATS,
            details: [
              {
                category: "Clients Trained",
                value: "150",
              },
              {
                category: "Years Experience",
                value: "5",
              },
            ],
          },
        },
      },
      {
        description: "should pass validation for valid goals section",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: {
            title: CustomSectionType.GOALS,
            details: [
              "Help clients achieve their fitness goals",
              "Become a certified nutritionist",
            ],
          },
        },
      },
      {
        description: "should pass validation for valid identity section",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: {
            title: CustomSectionType.IDENTITY,
            details: [
              "I am a certified personal trainer",
              "I specialize in strength training",
            ],
          },
        },
      },
      {
        description: "should pass validation for valid specialization section",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: UserProfileTestFixture.createCustomSectionRequest({
            title: CustomSectionType.SPECIALIZATION,
            details: ["Weight Training", "TRX Suspension Training"],
          }),
        },
      },
      {
        description: "should pass validation for valid philosophy section",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: {
            title: CustomSectionType.PHILOSOPHY,
            details: ["Philosophy", "Philosophy description"],
          },
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
          "should throw BadRequest when achievement item has invalid custom section type",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: {
            title: CustomSectionType.SPECIALIZATION,
            details: [
              {
                specialization: "Weight Training",
                level: "Advanced",
                yearsOfExperience: 3,
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
          "should throw BadRequest when stats item has invalid format",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: {
            title: CustomSectionType.STATS,
            details: [
              {
                category: "Test Category",
                value: 123, // Should be string
              },
            ],
          },
        },
        error: APIError.BadRequest("Validation failed", [
          ValidationErrorMessage.STATS_ITEM_INVALID_FORMAT,
        ]),
        validationErrors: [ValidationErrorMessage.STATS_ITEM_INVALID_FORMAT],
      },
      {
        description:
          "should throw BadRequest when stats item has invalid custom section type",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: {
            title: CustomSectionType.GOALS,
            details: [
              {
                category: "Test Category",
                value: "Test Value",
              },
            ],
          },
        },
        error: APIError.BadRequest("Validation failed", [
          ValidationErrorMessage.STATS_ITEM_INVALID_FORMAT,
        ]),
        validationErrors: [ValidationErrorMessage.STATS_ITEM_INVALID_FORMAT],
      },
      {
        description:
          "should throw BadRequest when string array item has invalid format",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: {
            title: CustomSectionType.GOALS,
            details: [
              "Valid goal",
              123, // Should be string
            ],
          },
        },
        error: APIError.BadRequest("Validation failed", [
          ValidationErrorMessage.STRING_ARRAY_ITEM_INVALID_FORMAT,
        ]),
        validationErrors: [
          ValidationErrorMessage.STRING_ARRAY_ITEM_INVALID_FORMAT,
        ],
      },
      {
        description:
          "should throw BadRequest when string array item has invalid custom section type",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: {
            title: CustomSectionType.ACHIEVEMENTS,
            details: ["Bodybuilding", "TRX Suspension Training"],
          },
        },
        error: APIError.BadRequest("Validation failed", [
          ValidationErrorMessage.STRING_ARRAY_ITEM_INVALID_FORMAT,
        ]),
        validationErrors: [
          ValidationErrorMessage.STRING_ARRAY_ITEM_INVALID_FORMAT,
        ],
      },
      {
        description:
          "should throw BadRequest when string array item has invalid custom section type",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: {
            title: CustomSectionType.STATS,
            details: ["Bodybuilding", "TRX Suspension Training"],
          },
        },
        error: APIError.BadRequest("Validation failed", [
          ValidationErrorMessage.STRING_ARRAY_ITEM_INVALID_FORMAT,
        ]),
        validationErrors: [
          ValidationErrorMessage.STRING_ARRAY_ITEM_INVALID_FORMAT,
        ],
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
        description: "should pass validation for valid stats section",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: {
            title: CustomSectionType.STATS,
            details: [
              {
                category: "Clients Trained",
                value: "150",
              },
              {
                category: "Years Experience",
                value: "5",
              },
            ],
          },
        },
      },
      {
        description:
          "should pass validation for valid goals section with string array",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: {
            title: CustomSectionType.GOALS,
            details: [
              "Help clients achieve their fitness goals",
              "Become a certified nutritionist",
            ],
          },
        },
      },
      {
        description:
          "should pass validation for valid identity section with string array",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: {
            title: CustomSectionType.IDENTITY,
            details: [
              "I am a certified personal trainer",
              "I specialize in strength training",
            ],
          },
        },
      },
      {
        description: "should pass validation for valid specialization section",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: UserProfileTestFixture.createCustomSectionRequest({
            title: CustomSectionType.SPECIALIZATION,
            details: ["Weight Training", "TRX Suspension Training"],
          }),
        },
      },
      {
        description: "should pass validation for valid philosophy section",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: {
            title: CustomSectionType.PHILOSOPHY,
            details: ["Philosophy", "Philosophy description"],
          },
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
          "should throw BadRequest when achievement item has invalid custom section type",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: {
            title: CustomSectionType.SPECIALIZATION,
            details: [
              {
                specialization: "Weight Training",
                level: "Advanced",
                yearsOfExperience: 3,
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
          "should throw BadRequest when stats item has invalid format",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: {
            title: CustomSectionType.STATS,
            details: [
              {
                category: "Test Category",
                value: 123, // Should be string
              },
            ],
          },
        },
        error: APIError.BadRequest("Validation failed", [
          ValidationErrorMessage.STATS_ITEM_INVALID_FORMAT,
        ]),
        validationErrors: [ValidationErrorMessage.STATS_ITEM_INVALID_FORMAT],
      },
      {
        description:
          "should throw BadRequest when stats item has invalid custom section type",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: {
            title: CustomSectionType.GOALS,
            details: [
              {
                category: "Test Category",
                value: "Test Value",
              },
            ],
          },
        },
        error: APIError.BadRequest("Validation failed", [
          ValidationErrorMessage.STATS_ITEM_INVALID_FORMAT,
        ]),
        validationErrors: [ValidationErrorMessage.STATS_ITEM_INVALID_FORMAT],
      },
      {
        description:
          "should throw BadRequest when string array item has invalid format",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: {
            title: CustomSectionType.GOALS,
            details: [
              "Valid goal",
              123, // Should be string
            ],
          },
        },
        error: APIError.BadRequest("Validation failed", [
          ValidationErrorMessage.STRING_ARRAY_ITEM_INVALID_FORMAT,
        ]),
        validationErrors: [
          ValidationErrorMessage.STRING_ARRAY_ITEM_INVALID_FORMAT,
        ],
      },
      {
        description:
          "should throw BadRequest when string array item has invalid custom section type",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: {
            title: CustomSectionType.ACHIEVEMENTS,
            details: ["Bodybuilding", "TRX Suspension Training"],
          },
        },
        error: APIError.BadRequest("Validation failed", [
          ValidationErrorMessage.STRING_ARRAY_ITEM_INVALID_FORMAT,
        ]),
        validationErrors: [
          ValidationErrorMessage.STRING_ARRAY_ITEM_INVALID_FORMAT,
        ],
      },
      {
        description:
          "should throw BadRequest when string array item has invalid custom section type",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: {
            title: CustomSectionType.STATS,
            details: ["Bodybuilding", "TRX Suspension Training"],
          },
        },
        error: APIError.BadRequest("Validation failed", [
          ValidationErrorMessage.STRING_ARRAY_ITEM_INVALID_FORMAT,
        ]),
        validationErrors: [
          ValidationErrorMessage.STRING_ARRAY_ITEM_INVALID_FORMAT,
        ],
      },
    ];
  }

  static validateBasicProfileUpdateSuccessCases(): SuccessTestCase[] {
    return [
      {
        description:
          "should pass validation for valid basic profile update with all fields",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: UserProfileTestFixture.createBasicUserProfileInfoRequest(),
        },
      },
      {
        description:
          "should pass validation for valid basic profile update with minimal fields",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: UserProfileTestFixture.createBasicUserProfileInfoRequest({
            bio: undefined,
            location: undefined,
            role: undefined,
            profilePicture: undefined,
          }),
        },
      },
    ];
  }

  static validateBasicProfileUpdateErrorCases(): ErrorTestCase[] {
    return [
      {
        description: "should throw BadRequest when userId is missing",
        request: {
          params: {},
          body: UserProfileTestFixture.createBasicUserProfileInfoRequest(),
        },
        error: APIError.BadRequest("Validation failed", [
          ValidationErrorMessage.USER_ID_REQUIRED,
        ]),
        validationErrors: [ValidationErrorMessage.USER_ID_REQUIRED],
      },
      {
        description: "should throw BadRequest when userId is invalid format",
        request: {
          params: { userId: "invalid-user-id" },
          body: UserProfileTestFixture.createBasicUserProfileInfoRequest(),
        },
        error: APIError.BadRequest("Validation failed", [
          ValidationErrorMessage.USER_ID_INVALID_FORMAT,
        ]),
        validationErrors: [ValidationErrorMessage.USER_ID_INVALID_FORMAT],
      },
      {
        description: "should throw BadRequest when username is missing",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: UserProfileTestFixture.createBasicUserProfileInfoRequest({
            username: undefined,
          }),
        },
        error: APIError.BadRequest("Validation failed", [
          ValidationErrorMessage.USERNAME_REQUIRED,
        ]),
        validationErrors: [ValidationErrorMessage.USERNAME_REQUIRED],
      },
      {
        description: "should throw BadRequest when name is missing",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: UserProfileTestFixture.createBasicUserProfileInfoRequest({
            name: undefined,
          }),
        },
        error: APIError.BadRequest("Validation failed", [
          ValidationErrorMessage.NAME_REQUIRED,
        ]),
        validationErrors: [ValidationErrorMessage.NAME_REQUIRED],
      },
      {
        description: "should throw BadRequest when accountType is missing",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: UserProfileTestFixture.createBasicUserProfileInfoRequest({
            accountType: undefined,
          }),
        },
        error: APIError.BadRequest("Validation failed", [
          ValidationErrorMessage.ACCOUNT_TYPE_REQUIRED,
        ]),
        validationErrors: [ValidationErrorMessage.ACCOUNT_TYPE_REQUIRED],
      },
      {
        description: "should throw BadRequest when accountType is null",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: UserProfileTestFixture.createBasicUserProfileInfoRequest({
            accountType: null as any,
          }),
        },
        error: APIError.BadRequest("Validation failed", [
          ValidationErrorMessage.ACCOUNT_TYPE_REQUIRED,
        ]),
        validationErrors: [ValidationErrorMessage.ACCOUNT_TYPE_REQUIRED],
      },
      {
        description: "should throw BadRequest when accountType is invalid",
        request: {
          params: { userId: new Types.ObjectId().toString() },
          body: UserProfileTestFixture.createBasicUserProfileInfoRequest({
            accountType: 2 as any, // Invalid value
          }),
        },
        error: APIError.BadRequest("Validation failed", [
          ValidationErrorMessage.ACCOUNT_TYPE_INVALID,
        ]),
        validationErrors: [ValidationErrorMessage.ACCOUNT_TYPE_INVALID],
      },
      {
        description: "should throw BadRequest when multiple fields are invalid",
        request: {
          params: { userId: "invalid-id" },
          body: UserProfileTestFixture.createBasicUserProfileInfoRequest({
            username: undefined,
            name: undefined,
            accountType: 2 as any,
          }),
        },
        error: APIError.BadRequest("Validation failed", [
          ValidationErrorMessage.USER_ID_INVALID_FORMAT,
          ValidationErrorMessage.USERNAME_REQUIRED,
          ValidationErrorMessage.NAME_REQUIRED,
          ValidationErrorMessage.ACCOUNT_TYPE_INVALID,
        ]),
        validationErrors: [
          ValidationErrorMessage.USER_ID_INVALID_FORMAT,
          ValidationErrorMessage.USERNAME_REQUIRED,
          ValidationErrorMessage.NAME_REQUIRED,
          ValidationErrorMessage.ACCOUNT_TYPE_INVALID,
        ],
      },
    ];
  }
}
