import { describe, it, expect, beforeEach, vi } from "vitest";
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

describe("UserProfileService", () => {
  let userProfileService: UserProfileService;

  beforeEach(() => {
    userProfileService = new UserProfileService(
      mockUserProfileRepository,
      mockFollowRepository
    );
  });

  describe("updateUserProfile", () => {
    describe("success cases", () => {
      it.each(UserProfileDataProvider.updateUserProfileSuccessCases())(
        "$description",
        async ({ request, entity, document }) => {
          // Arrange
          vi.spyOn(mockUserProfileRepository, "findOne").mockResolvedValue(
            entity
          );
          vi.spyOn(mockUserProfileRepository, "toDocument").mockReturnValue(
            document
          );
          vi.spyOn(mockUserProfileRepository, "updateOne").mockResolvedValue();

          // Act
          await userProfileService.updateUserProfile(request);

          // Assert
          expect(mockUserProfileRepository.findOne).toHaveBeenCalledWith({
            userId: new Types.ObjectId(request.userId),
          });
          expect(mockUserProfileRepository.toDocument).toHaveBeenCalledWith(
            request
          );
          expect(mockUserProfileRepository.updateOne).toHaveBeenCalledWith(
            { userId: new Types.ObjectId(request.userId) },
            document
          );
        }
      );
    });

    describe("error cases", () => {
      it.each(UserProfileDataProvider.updateUserProfileErrorCases())(
        "$description",
        async ({ request, error, expectedErrorResponse }) => {
          // Arrange
          if (error instanceof APIError) {
            vi.spyOn(mockUserProfileRepository, "findOne").mockRejectedValue(
              error
            );
          } else if (
            error instanceof MongooseError ||
            error instanceof MongoServerError
          ) {
            vi.spyOn(mockUserProfileRepository, "findOne").mockResolvedValue(
              UserProfileTestFixture.createUserProfileEntity()
            );
            vi.spyOn(mockUserProfileRepository, "updateOne").mockRejectedValue(
              error
            );
          } else {
            vi.spyOn(mockUserProfileRepository, "findOne").mockRejectedValue(
              error
            );
          }

          // Act & Assert
          await expect(
            userProfileService.updateUserProfile(request)
          ).rejects.toThrowError(error);

          if (
            error instanceof MongoServerError ||
            error instanceof MongooseError
          ) {
            await expect(
              userProfileService.updateUserProfile(request)
            ).rejects.toThrowError(DatabaseError);
          }
        }
      );
    });
  });
});
