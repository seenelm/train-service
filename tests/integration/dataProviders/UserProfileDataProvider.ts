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
  userId: string;
  createRequest: T;
  updateRequest: T;
  expectedGetResponse: CustomSectionResponse[];
  expectedUpdatedGetResponse: CustomSectionResponse[];
}

export default class UserProfileDataProvider {
  static createCustomSectionSuccessCases(): SuccessTestCase<CustomSectionRequest>[] {
    return [
      {
        description: "should create achievements section successfully",
        userId: new Types.ObjectId().toString(),
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
        expectedGetResponse: [
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
        expectedUpdatedGetResponse: [
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
    ];
  }
}
