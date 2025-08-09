import { ErrorResponse } from "../../../src/common/errors/types.js";
import { StatusCodes as HttpStatusCode } from "http-status-codes";
import {
  CustomSectionRequest,
  CustomSectionType,
  CustomSectionResponse,
} from "@seenelm/train-core";
import UserProfileTestFixture from "../../fixtures/UserProfileTestFixture.js";
import { Types } from "mongoose";

interface ErrorTestCase<T> {
  description: string;
  request: T;
  status: number;
  expectedErrorResponse: Partial<ErrorResponse>;
}

interface SuccessTestCase<T> {
  description: string;
  createRequest: T;
  updateRequest?: T;
  expectedResponse: CustomSectionResponse[];
}

interface DeleteCustomSectionSuccessTestCase {
  description: string;
  createRequest: CustomSectionRequest;
  sectionTitleToDelete: CustomSectionType;
}

export default class UserProfileDataProvider {
  static createCustomSectionSuccessCases(): SuccessTestCase<CustomSectionRequest>[] {
    return [
      {
        description: "should create achievements section successfully",
        createRequest: UserProfileTestFixture.createCustomSectionRequest({
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
        }),
        expectedResponse: [
          UserProfileTestFixture.createCustomSectionResponse({
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
          }),
        ],
      },
      {
        description: "should create specialization section successfully",
        createRequest: UserProfileTestFixture.createCustomSectionRequest({
          title: CustomSectionType.SPECIALIZATION,
          details: ["Weight Training", "Cardio Training"],
        }),
        expectedResponse: [
          UserProfileTestFixture.createCustomSectionResponse({
            title: CustomSectionType.SPECIALIZATION,
            details: ["Weight Training", "Cardio Training"],
          }),
        ],
      },
      {
        description: "should create philosophy section successfully",
        createRequest: UserProfileTestFixture.createCustomSectionRequest({
          title: CustomSectionType.PHILOSOPHY,
          details: [
            "Consistency over perfection",
            "Progressive overload",
            "Growth-oriented",
          ],
        }),
        expectedResponse: [
          UserProfileTestFixture.createCustomSectionResponse({
            title: CustomSectionType.PHILOSOPHY,
            details: [
              "Consistency over perfection",
              "Progressive overload",
              "Growth-oriented",
            ],
          }),
        ],
      },
      {
        description: "should create identity section successfully",
        createRequest: UserProfileTestFixture.createCustomSectionRequest({
          title: CustomSectionType.IDENTITY,
          details: ["I am a personal trainer"],
        }),
        expectedResponse: [
          UserProfileTestFixture.createCustomSectionResponse({
            title: CustomSectionType.IDENTITY,
            details: ["I am a personal trainer"],
          }),
        ],
      },
      {
        description: "should create goals section successfully",
        createRequest: UserProfileTestFixture.createCustomSectionRequest({
          title: CustomSectionType.GOALS,
          details: ["To help clients achieve their fitness goals"],
        }),
        expectedResponse: [
          UserProfileTestFixture.createCustomSectionResponse({
            title: CustomSectionType.GOALS,
            details: ["To help clients achieve their fitness goals"],
          }),
        ],
      },
      {
        description: "should create stats section successfully",
        createRequest: UserProfileTestFixture.createCustomSectionRequest({
          title: CustomSectionType.STATS,
          details: ["100 clients trained"],
        }),
        expectedResponse: [
          UserProfileTestFixture.createCustomSectionResponse({
            title: CustomSectionType.STATS,
            details: ["100 clients trained"],
          }),
        ],
      },
    ];
  }

  static createCustomSectionErrorCases(): ErrorTestCase<CustomSectionRequest>[] {
    return [];
  }

  static updateCustomSectionSuccessCases(): SuccessTestCase<CustomSectionRequest>[] {
    return [
      {
        description: "should update achievements section successfully",
        createRequest: UserProfileTestFixture.createCustomSectionRequest({
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
        }),
        updateRequest: UserProfileTestFixture.createCustomSectionRequest({
          title: CustomSectionType.ACHIEVEMENTS,
          details: [
            {
              title: "High School basketball state champion",
              date: "2025-02-20",
              description: "Won state championship in high school basketball",
            },
            {
              title: "Bronze medalist in 100m freestyle",
              date: "2025-01-15",
              description: "Won bronze medal in 100m freestyle at the Olympics",
            },
          ],
        }),
        expectedResponse: [
          UserProfileTestFixture.createCustomSectionResponse({
            title: CustomSectionType.ACHIEVEMENTS,
            details: [
              {
                title: "High School basketball state champion",
                date: "2025-02-20",
                description: "Won state championship in high school basketball",
              },
              {
                title: "Bronze medalist in 100m freestyle",
                date: "2025-01-15",
                description:
                  "Won bronze medal in 100m freestyle at the Olympics",
              },
            ],
          }),
        ],
      },
      {
        description: "should update specialization section successfully",
        createRequest: UserProfileTestFixture.createCustomSectionRequest({
          title: CustomSectionType.SPECIALIZATION,
          details: ["Weight Training", "Cardio Training"],
        }),
        updateRequest: UserProfileTestFixture.createCustomSectionRequest({
          title: CustomSectionType.SPECIALIZATION,
          details: ["Weight Training", "Cardio Training", "Nutrition Coaching"],
        }),
        expectedResponse: [
          UserProfileTestFixture.createCustomSectionResponse({
            title: CustomSectionType.SPECIALIZATION,
            details: [
              "Weight Training",
              "Cardio Training",
              "Nutrition Coaching",
            ],
          }),
        ],
      },
      {
        description: "should update philosophy section successfully",
        createRequest: UserProfileTestFixture.createCustomSectionRequest({
          title: CustomSectionType.PHILOSOPHY,
          details: ["Consistency over perfection"],
        }),
        updateRequest: UserProfileTestFixture.createCustomSectionRequest({
          title: CustomSectionType.PHILOSOPHY,
          details: [
            "Consistency over perfection",
            "Bodyweight training over Bodybuilding",
          ],
        }),
        expectedResponse: [
          UserProfileTestFixture.createCustomSectionResponse({
            title: CustomSectionType.PHILOSOPHY,
            details: [
              "Consistency over perfection",
              "Bodyweight training over Bodybuilding",
            ],
          }),
        ],
      },
      {
        description: "should update identity section successfully",
        createRequest: UserProfileTestFixture.createCustomSectionRequest({
          title: CustomSectionType.IDENTITY,
          details: ["I am a personal trainer"],
        }),
        updateRequest: UserProfileTestFixture.createCustomSectionRequest({
          title: CustomSectionType.IDENTITY,
          details: ["I am a certified personal trainer"],
        }),
        expectedResponse: [
          UserProfileTestFixture.createCustomSectionResponse({
            title: CustomSectionType.IDENTITY,
            details: ["I am a certified personal trainer"],
          }),
        ],
      },
      {
        description: "should update goals section successfully",
        createRequest: UserProfileTestFixture.createCustomSectionRequest({
          title: CustomSectionType.GOALS,
          details: ["To help clients achieve their fitness goals"],
        }),
        updateRequest: UserProfileTestFixture.createCustomSectionRequest({
          title: CustomSectionType.GOALS,
          details: [
            "To help clients achieve their fitness goals",
            "To bench press 315lbs",
          ],
        }),
        expectedResponse: [
          UserProfileTestFixture.createCustomSectionResponse({
            title: CustomSectionType.GOALS,
            details: [
              "To help clients achieve their fitness goals",
              "To bench press 315lbs",
            ],
          }),
        ],
      },
      {
        description: "should create stats section successfully",
        createRequest: UserProfileTestFixture.createCustomSectionRequest({
          title: CustomSectionType.STATS,
          details: ["100 clients trained"],
        }),
        updateRequest: UserProfileTestFixture.createCustomSectionRequest({
          title: CustomSectionType.STATS,
          details: ["Bench press 315lbs"],
        }),
        expectedResponse: [
          UserProfileTestFixture.createCustomSectionResponse({
            title: CustomSectionType.STATS,
            details: ["Bench press 315lbs"],
          }),
        ],
      },
    ];
  }

  static updateCustomSectionErrorCases(): ErrorTestCase<CustomSectionRequest>[] {
    return [];
  }

  static deleteCustomSectionSuccessCases(): DeleteCustomSectionSuccessTestCase[] {
    return [
      {
        description: "should delete achievements section successfully",
        createRequest: UserProfileTestFixture.createCustomSectionRequest({
          title: CustomSectionType.ACHIEVEMENTS,
          details: [
            {
              title: "First Place in Competition",
              date: "2024-03-20",
              description: "Won first place in regional fitness competition",
            },
          ],
        }),
        sectionTitleToDelete: CustomSectionType.ACHIEVEMENTS,
      },
      {
        description: "should delete specialization section successfully",
        createRequest: UserProfileTestFixture.createCustomSectionRequest({
          title: CustomSectionType.SPECIALIZATION,
          details: ["Weight Training"],
        }),
        sectionTitleToDelete: CustomSectionType.SPECIALIZATION,
      },
      {
        description: "should delete philosophy section successfully",
        createRequest: UserProfileTestFixture.createCustomSectionRequest({
          title: CustomSectionType.PHILOSOPHY,
          details: ["Consistency over perfection"],
        }),
        sectionTitleToDelete: CustomSectionType.PHILOSOPHY,
      },
    ];
  }

  static deleteCustomSectionErrorCases(): ErrorTestCase<{
    userId: string;
    sectionTitle: string;
  }>[] {
    return [];
  }
}
