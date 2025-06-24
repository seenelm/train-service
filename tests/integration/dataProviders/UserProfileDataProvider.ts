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
  request: T;
  expectedCreateResponse: { success: boolean };
  expectedGetResponse: CustomSectionResponse[];
}

export default class UserProfileDataProvider {
  static createCustomSectionSuccessCases(): SuccessTestCase<CustomSectionRequest>[] {
    return [
      {
        description: "should create achievements section successfully",
        userId: new Types.ObjectId().toString(),
        request: UserProfileTestFixture.createCustomSectionRequest({
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
        expectedCreateResponse: { success: true },
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
      },
    ];
  }
}
