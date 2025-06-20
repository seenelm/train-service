import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import UserProfileService from "../../../../src/app/userProfile/UserProfileService.js";
import {
  mockUserProfileRepository,
  mockFollowRepository,
} from "../../../mocks/userMocks.js";
import UserProfileDataProvider from "../../../dataProviders/UserProfileDataProvider.js";
import { Types } from "mongoose";
import { APIError } from "../../../../src/common/errors/APIError.js";
import { MongooseError } from "mongoose";
import { MongoServerError } from "mongodb";
import UserProfileTestFixture from "../../../fixtures/UserProfileTestFixture.js";
import { DatabaseError } from "../../../../src/common/errors/DatabaseError.js";
import { CustomSectionType } from "@seenelm/train-core";

describe("UserProfileService", () => {
  let userProfileService: UserProfileService;

  beforeEach(() => {
    userProfileService = new UserProfileService(
      mockUserProfileRepository,
      mockFollowRepository
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // describe("updateUserProfile", () => {
  //   describe("success cases", () => {
  //     it.each(UserProfileDataProvider.updateUserProfileSuccessCases())(
  //       "$description",
  //       async ({ request, entity, document }) => {
  //         // Arrange
  //         vi.spyOn(mockUserProfileRepository, "findOne").mockResolvedValue(
  //           entity
  //         );
  //         vi.spyOn(mockUserProfileRepository, "toDocument").mockReturnValue(
  //           document
  //         );
  //         vi.spyOn(mockUserProfileRepository, "updateOne").mockResolvedValue();

  //         // Act
  //         await userProfileService.updateUserProfile(request);

  //         // Assert
  //         expect(mockUserProfileRepository.findOne).toHaveBeenCalledWith({
  //           userId: new Types.ObjectId(request.userId),
  //         });
  //         expect(mockUserProfileRepository.toDocument).toHaveBeenCalledWith(
  //           request
  //         );
  //         expect(mockUserProfileRepository.updateOne).toHaveBeenCalledWith(
  //           { userId: new Types.ObjectId(request.userId) },
  //           document
  //         );
  //       }
  //     );
  //   });

  //   describe("error cases", () => {
  //     it.each(UserProfileDataProvider.updateUserProfileErrorCases())(
  //       "$description",
  //       async ({ request, error, expectedErrorResponse }) => {
  //         // Arrange
  //         if (error instanceof APIError) {
  //           vi.spyOn(mockUserProfileRepository, "findOne").mockRejectedValue(
  //             error
  //           );
  //         } else if (
  //           error instanceof MongooseError ||
  //           error instanceof MongoServerError
  //         ) {
  //           vi.spyOn(mockUserProfileRepository, "findOne").mockResolvedValue(
  //             UserProfileTestFixture.createUserProfileEntity()
  //           );
  //           vi.spyOn(mockUserProfileRepository, "updateOne").mockRejectedValue(
  //             error
  //           );
  //         } else {
  //           vi.spyOn(mockUserProfileRepository, "findOne").mockRejectedValue(
  //             error
  //           );
  //         }

  //         // Act & Assert
  //         await expect(
  //           userProfileService.updateUserProfile(request)
  //         ).rejects.toThrowError(error);

  //         if (
  //           error instanceof MongoServerError ||
  //           error instanceof MongooseError
  //         ) {
  //           await expect(
  //             userProfileService.updateUserProfile(request)
  //           ).rejects.toThrowError(DatabaseError);
  //         }
  //       }
  //     );
  //   });
  // });

  describe("createCustomSection", () => {
    it("should successfully create a custom section", async () => {
      // Arrange
      const userId = new Types.ObjectId();
      const request = UserProfileTestFixture.createCustomSectionRequest({
        title: CustomSectionType.ACHIEVEMENTS,
        details: [
          {
            title: "First Place",
            date: "2024-03-20",
            description: "Won first place in competition",
          },
        ],
      });

      // Create entity with empty customSections to simulate a user profile without any custom sections
      const userProfileEntity = UserProfileTestFixture.createUserProfileEntity(
        (builder) => builder.setCustomSections([])
      );

      vi.spyOn(mockUserProfileRepository, "findOne").mockResolvedValue(
        userProfileEntity
      );
      vi.spyOn(mockUserProfileRepository, "updateOne").mockResolvedValue();

      // Act
      await userProfileService.createCustomSection(userId, request);

      // Assert
      expect(mockUserProfileRepository.findOne).toHaveBeenCalledWith({
        userId: new Types.ObjectId(userId),
      });
      expect(mockUserProfileRepository.updateOne).toHaveBeenCalledWith(
        { userId },
        {
          $push: {
            customSections: {
              title: request.title,
              details: request.details,
            },
          },
        }
      );
    });

    describe("error cases", () => {
      it.each(UserProfileDataProvider.createCustomSectionErrorCases())(
        "$description",
        async ({ request, error, expectedErrorResponse }) => {
          // Arrange
          const userId = new Types.ObjectId();

          if (error.message === "User profile not found") {
            vi.spyOn(mockUserProfileRepository, "findOne").mockResolvedValue(
              null
            );
          } else if (error.message === "Custom section already exists") {
            const entity = UserProfileTestFixture.createUserProfileEntity(
              (builder) =>
                builder.setCustomSections([
                  {
                    title: request.title,
                    details: request.details,
                  },
                ])
            );

            vi.spyOn(mockUserProfileRepository, "findOne").mockResolvedValue(
              entity
            );
          } else if (error instanceof MongooseError) {
            const entity = UserProfileTestFixture.createUserProfileEntity(
              (builder) => builder.setCustomSections([])
            );

            vi.spyOn(mockUserProfileRepository, "findOne").mockResolvedValue(
              entity
            );
            vi.spyOn(mockUserProfileRepository, "updateOne").mockRejectedValue(
              error
            );
          } else {
            const entity = UserProfileTestFixture.createUserProfileEntity(
              (builder) => builder.setCustomSections([])
            );
            vi.spyOn(mockUserProfileRepository, "findOne").mockResolvedValue(
              entity
            );
            vi.spyOn(mockUserProfileRepository, "updateOne").mockRejectedValue(
              error
            );
          }

          // Act & Assert
          if (
            error instanceof MongooseError ||
            error instanceof MongoServerError
          ) {
            await expect(
              userProfileService.createCustomSection(userId, request)
            ).rejects.toThrowError(DatabaseError);
          } else {
            await expect(
              userProfileService.createCustomSection(userId, request)
            ).rejects.toThrowError(error);
          }

          if (error.message === "User profile not found") {
            expect(mockUserProfileRepository.findOne).toHaveBeenCalledWith({
              userId: new Types.ObjectId(userId),
            });
            expect(mockUserProfileRepository.updateOne).not.toHaveBeenCalled();
          } else if (error.message === "Custom section already exists") {
            expect(mockUserProfileRepository.findOne).toHaveBeenCalledWith({
              userId: new Types.ObjectId(userId),
            });
            expect(mockUserProfileRepository.updateOne).not.toHaveBeenCalled();
          } else {
            expect(mockUserProfileRepository.updateOne).toHaveBeenCalled();
          }
        }
      );
    });
  });
});
