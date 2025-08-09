import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import UserProfileService from "../../../../src/app/userProfile/UserProfileService.js";
import {
  mockUserProfileRepository,
  mockFollowRepository,
} from "../../../mocks/userMocks.js";
import UserProfileServiceDataProvider from "./dataProviders/UserProfileServiceDataProvider.js";
import { Types } from "mongoose";
import { APIError } from "../../../../src/common/errors/APIError.js";
import { MongooseError } from "mongoose";
import { MongoServerError } from "mongodb";
import UserProfileTestFixture from "../../../fixtures/UserProfileTestFixture.js";
import { DatabaseError } from "../../../../src/common/errors/DatabaseError.js";
import { CustomSectionType } from "@seenelm/train-core";
import { ErrorMessage } from "../../../../src/common/enums.js";
import { mockUserGroupsRepository } from "../../../mocks/userMocks.js";
import { mockGroupRepository } from "../../../mocks/groupMocks.js";

describe("UserProfileService", () => {
  let userProfileService: UserProfileService;

  beforeEach(() => {
    userProfileService = new UserProfileService(
      mockUserProfileRepository,
      mockFollowRepository,
      mockUserGroupsRepository,
      mockGroupRepository
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("updateUserProfile", () => {
    describe("success cases", () => {
      it.each(UserProfileServiceDataProvider.updateUserProfileSuccessCases())(
        "$description",
        async ({ request, entity, document }) => {
          // Arrange
          vi.spyOn(mockUserProfileRepository, "findOne").mockResolvedValue(
            entity
          );
          vi.spyOn(mockUserProfileRepository, "toDocument").mockReturnValue(
            document!
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
          expect(mockUserProfileRepository.updateOne).toHaveBeenCalled();
        }
      );
    });

    describe("error cases", () => {
      it.each(UserProfileServiceDataProvider.updateUserProfileErrorCases())(
        "$description",
        async ({ request, error }) => {
          // Arrange
          if (
            error instanceof APIError &&
            error.message === ErrorMessage.USER_PROFILE_NOT_FOUND
          ) {
            // Profile not found case
            vi.spyOn(mockUserProfileRepository, "findOne").mockResolvedValue(
              null
            );
          } else if (error instanceof MongooseError) {
            // Database error during findOne
            vi.spyOn(mockUserProfileRepository, "findOne").mockRejectedValue(
              error
            );
          } else if (error instanceof MongoServerError) {
            // Database error during updateOne
            const entity = UserProfileTestFixture.createUserProfileEntity();
            vi.spyOn(mockUserProfileRepository, "findOne").mockResolvedValue(
              entity
            );
            vi.spyOn(mockUserProfileRepository, "toDocument").mockReturnValue(
              {}
            );
            vi.spyOn(mockUserProfileRepository, "updateOne").mockRejectedValue(
              error
            );
          } else if (
            error instanceof APIError &&
            error.message === "Failed to update user profile"
          ) {
            // InternalServerError case - simulate an unknown error during updateOne
            const entity = UserProfileTestFixture.createUserProfileEntity();
            vi.spyOn(mockUserProfileRepository, "findOne").mockResolvedValue(
              entity
            );
            vi.spyOn(mockUserProfileRepository, "toDocument").mockReturnValue(
              {}
            );
            vi.spyOn(mockUserProfileRepository, "updateOne").mockRejectedValue(
              new Error("Unknown error during update")
            );
          } else {
            // Other API errors
            vi.spyOn(mockUserProfileRepository, "findOne").mockRejectedValue(
              error
            );
          }

          // Act & Assert
          if (
            error instanceof MongooseError ||
            error instanceof MongoServerError
          ) {
            // Database errors are wrapped in DatabaseError by the service
            await expect(
              userProfileService.updateUserProfile(request)
            ).rejects.toThrow(DatabaseError);
          } else {
            // API errors are thrown as-is
            await expect(
              userProfileService.updateUserProfile(request)
            ).rejects.toThrow(error);
          }
        }
      );
    });
  });

  describe("updateBasicUserProfile", () => {
    describe("success cases", () => {
      it.each(
        UserProfileServiceDataProvider.updateBasicUserProfileSuccessCases()
      )("$description", async ({ request, entity }) => {
        const userId = new Types.ObjectId();
        // Arrange
        vi.spyOn(mockUserProfileRepository, "findOne").mockResolvedValue(
          entity
        );
        vi.spyOn(mockUserProfileRepository, "updateOne").mockResolvedValue();

        // Act
        await userProfileService.updateBasicUserProfileInfo(userId, request);

        // Assert
        expect(mockUserProfileRepository.findOne).toHaveBeenCalledWith({
          userId,
        });
        expect(mockUserProfileRepository.updateOne).toHaveBeenCalledWith(
          { userId },
          {
            username: request.username,
            name: request.name,
            bio: request.bio,
            accountType: request.accountType,
            profilePicture: request.profilePicture,
            role: request.role,
            location: request.location,
          }
        );
      });
    });

    describe("error cases", () => {
      it.each(
        UserProfileServiceDataProvider.updateBasicUserProfileErrorCases()
      )("$description", async ({ request, error }) => {
        const userId = new Types.ObjectId();
        // Arrange
        if (
          error instanceof APIError &&
          error.message === ErrorMessage.USER_PROFILE_NOT_FOUND
        ) {
          // Profile not found case
          vi.spyOn(mockUserProfileRepository, "findOne").mockResolvedValue(
            null
          );
        } else if (error instanceof MongooseError) {
          // Database error during findOne
          vi.spyOn(mockUserProfileRepository, "findOne").mockRejectedValue(
            error
          );
        } else if (error instanceof MongoServerError) {
          // Database error during updateOne
          const entity = UserProfileTestFixture.createUserProfileEntity();
          vi.spyOn(mockUserProfileRepository, "findOne").mockResolvedValue(
            entity
          );
          vi.spyOn(mockUserProfileRepository, "updateOne").mockRejectedValue(
            error
          );
        } else if (
          error instanceof APIError &&
          error.message === "Failed to update basic user profile info"
        ) {
          // InternalServerError case - simulate an unknown error during updateOne
          const entity = UserProfileTestFixture.createUserProfileEntity();
          vi.spyOn(mockUserProfileRepository, "findOne").mockResolvedValue(
            entity
          );
          vi.spyOn(mockUserProfileRepository, "updateOne").mockRejectedValue(
            new Error("Unknown error during update")
          );
        } else {
          // Other API errors
          vi.spyOn(mockUserProfileRepository, "findOne").mockRejectedValue(
            error
          );
        }

        // Act & Assert
        if (
          error instanceof MongooseError ||
          error instanceof MongoServerError
        ) {
          await expect(
            userProfileService.updateBasicUserProfileInfo(userId, request)
          ).rejects.toThrow(DatabaseError);
        } else {
          await expect(
            userProfileService.updateBasicUserProfileInfo(userId, request)
          ).rejects.toThrow(error);
        }
      });
    });
  });

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
      it.each(UserProfileServiceDataProvider.createCustomSectionErrorCases())(
        "$description",
        async ({ request, error }) => {
          // Arrange
          const userId = new Types.ObjectId();

          if (error.message === ErrorMessage.USER_PROFILE_NOT_FOUND) {
            vi.spyOn(mockUserProfileRepository, "findOne").mockResolvedValue(
              null
            );
          } else if (
            error.message === ErrorMessage.CUSTOM_SECTION_ALREADY_EXISTS
          ) {
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

          if (error.message === ErrorMessage.USER_PROFILE_NOT_FOUND) {
            expect(mockUserProfileRepository.findOne).toHaveBeenCalledWith({
              userId: new Types.ObjectId(userId),
            });
            expect(mockUserProfileRepository.updateOne).not.toHaveBeenCalled();
          } else if (
            error.message === ErrorMessage.CUSTOM_SECTION_ALREADY_EXISTS
          ) {
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

  describe("updateCustomSection", () => {
    it("should successfully update a custom section", async () => {
      // Arrange
      const userId = new Types.ObjectId();
      const request = UserProfileTestFixture.createCustomSectionRequest({
        title: CustomSectionType.ACHIEVEMENTS,
        details: [
          {
            title: "First Place",
            date: "2025-03-20",
            description: "Won first place in competition",
          },
        ],
      });

      const userProfileEntity = UserProfileTestFixture.createUserProfileEntity(
        (builder) =>
          builder.setCustomSections([
            {
              title: CustomSectionType.ACHIEVEMENTS,
              details: [
                {
                  title: "Second Place",
                  date: "2024-03-20",
                  description: "Won first place in competition",
                },
              ],
            },
          ])
      );

      vi.spyOn(mockUserProfileRepository, "findOne").mockResolvedValue(
        userProfileEntity
      );
      vi.spyOn(mockUserProfileRepository, "updateOne").mockResolvedValue();

      // Act
      await userProfileService.updateCustomSection(userId, request);

      // Assert
      expect(mockUserProfileRepository.findOne).toHaveBeenCalledWith({
        userId: new Types.ObjectId(userId),
      });
      expect(mockUserProfileRepository.updateOne).toHaveBeenCalled();
    });
    describe("error cases", () => {
      it.each(UserProfileServiceDataProvider.updateCustomSectionErrorCases())(
        "$description",
        async ({ request, error }) => {
          // Arrange
          const userId = new Types.ObjectId();

          if (error.message === ErrorMessage.USER_PROFILE_NOT_FOUND) {
            vi.spyOn(mockUserProfileRepository, "findOne").mockResolvedValue(
              null
            );
          } else if (error.message === ErrorMessage.CUSTOM_SECTION_NOT_FOUND) {
            const entity = UserProfileTestFixture.createUserProfileEntity(
              (builder) => builder.setCustomSections([]) // Empty array = no sections exist
            );

            vi.spyOn(mockUserProfileRepository, "findOne").mockResolvedValue(
              entity
            );
          } else if (error instanceof MongooseError) {
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
            vi.spyOn(mockUserProfileRepository, "updateOne").mockRejectedValue(
              error
            );
          } else {
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
              userProfileService.updateCustomSection(userId, request)
            ).rejects.toThrowError(DatabaseError);
          } else {
            await expect(
              userProfileService.updateCustomSection(userId, request)
            ).rejects.toThrowError(error);
          }

          if (error.message === ErrorMessage.USER_PROFILE_NOT_FOUND) {
            expect(mockUserProfileRepository.findOne).toHaveBeenCalledWith({
              userId: new Types.ObjectId(userId),
            });
            expect(mockUserProfileRepository.updateOne).not.toHaveBeenCalled();
          } else if (error.message === ErrorMessage.CUSTOM_SECTION_NOT_FOUND) {
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

  describe("deleteCustomSection", () => {
    it("should successfully delete a custom section", async () => {
      // Arrange
      const userId = new Types.ObjectId();
      const sectionTitle = CustomSectionType.ACHIEVEMENTS;

      const userProfileEntity = UserProfileTestFixture.createUserProfileEntity(
        (builder) =>
          builder.setCustomSections([
            {
              title: CustomSectionType.ACHIEVEMENTS,
              details: [
                {
                  title: "Test Achievement",
                  date: "2024-03-20",
                  description: "Test description",
                },
              ],
            },
          ])
      );

      vi.spyOn(mockUserProfileRepository, "findOne").mockResolvedValue(
        userProfileEntity
      );
      vi.spyOn(mockUserProfileRepository, "updateOne").mockResolvedValue();

      // Act
      await userProfileService.deleteCustomSection(userId, sectionTitle);

      // Assert
      expect(mockUserProfileRepository.findOne).toHaveBeenCalledWith({
        userId,
      });
      expect(mockUserProfileRepository.updateOne).toHaveBeenCalled();
    });

    describe("error cases", () => {
      it.each(UserProfileServiceDataProvider.deleteCustomSectionErrorCases())(
        "$description",
        async ({ request, error }) => {
          // Arrange
          const { userId, sectionTitle } = request;

          if (error.message === ErrorMessage.USER_PROFILE_NOT_FOUND) {
            vi.spyOn(mockUserProfileRepository, "findOne").mockResolvedValue(
              null
            );
          } else if (error.message === ErrorMessage.CUSTOM_SECTION_NOT_FOUND) {
            const entity = UserProfileTestFixture.createUserProfileEntity(
              (builder) => builder.setCustomSections([])
            );

            vi.spyOn(mockUserProfileRepository, "findOne").mockResolvedValue(
              entity
            );
          } else if (error instanceof MongooseError) {
            const entity = UserProfileTestFixture.createUserProfileEntity(
              (builder) =>
                builder.setCustomSections([
                  {
                    title: sectionTitle,
                    details: [],
                  },
                ])
            );

            vi.spyOn(mockUserProfileRepository, "findOne").mockResolvedValue(
              entity
            );
            vi.spyOn(mockUserProfileRepository, "updateOne").mockRejectedValue(
              error
            );
          } else {
            const entity = UserProfileTestFixture.createUserProfileEntity(
              (builder) =>
                builder.setCustomSections([
                  {
                    title: sectionTitle,
                    details: [],
                  },
                ])
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
              userProfileService.deleteCustomSection(userId, sectionTitle)
            ).rejects.toThrowError(DatabaseError);
          } else {
            await expect(
              userProfileService.deleteCustomSection(userId, sectionTitle)
            ).rejects.toThrowError(error);
          }

          if (
            error.message === ErrorMessage.USER_PROFILE_NOT_FOUND ||
            error.message === ErrorMessage.CUSTOM_SECTION_NOT_FOUND
          ) {
            expect(mockUserProfileRepository.findOne).toHaveBeenCalledWith({
              userId,
            });
            expect(mockUserProfileRepository.updateOne).not.toHaveBeenCalled();
          } else {
            expect(mockUserProfileRepository.findOne).toHaveBeenCalledWith({
              userId,
            });
            expect(mockUserProfileRepository.updateOne).toHaveBeenCalled();
          }
        }
      );
    });
  });

  describe("getCustomSections", () => {
    describe("success cases", () => {
      it.each(UserProfileServiceDataProvider.getCustomSectionsSuccessCases())(
        "$description",
        async ({ request, entity, expectedResponse }) => {
          const { userId } = request;

          // Arrange
          vi.spyOn(mockUserProfileRepository, "findOne").mockResolvedValue(
            entity
          );

          // Act
          const result = await userProfileService.getCustomSections(userId);

          // Assert
          expect(mockUserProfileRepository.findOne).toHaveBeenCalledWith({
            userId,
          });
          expect(result).toEqual(expectedResponse);
        }
      );
    });

    describe("error cases", () => {
      it.each(UserProfileServiceDataProvider.getCustomSectionsErrorCases())(
        "$description",
        async ({ request, error }) => {
          // Arrange
          const { userId } = request;

          if (error.message === ErrorMessage.USER_PROFILE_NOT_FOUND) {
            vi.spyOn(mockUserProfileRepository, "findOne").mockResolvedValue(
              null
            );
          } else if (error instanceof MongooseError) {
            vi.spyOn(mockUserProfileRepository, "findOne").mockRejectedValue(
              error
            );
          } else {
            vi.spyOn(mockUserProfileRepository, "findOne").mockRejectedValue(
              error
            );
          }

          // Act & Assert
          if (
            error instanceof MongooseError ||
            error instanceof MongoServerError
          ) {
            await expect(
              userProfileService.getCustomSections(userId)
            ).rejects.toThrowError(DatabaseError);
          } else {
            await expect(
              userProfileService.getCustomSections(userId)
            ).rejects.toThrowError(error);
          }

          expect(mockUserProfileRepository.findOne).toHaveBeenCalledWith({
            userId,
          });
        }
      );
    });

    describe("edge cases", () => {
      it("should return empty array when customSections is undefined", async () => {
        // Arrange
        const userId = new Types.ObjectId();
        const entity = UserProfileTestFixture.createUserProfileEntity(
          (builder) => builder.setCustomSections(undefined as any)
        );

        vi.spyOn(mockUserProfileRepository, "findOne").mockResolvedValue(
          entity
        );

        // Act
        const result = await userProfileService.getCustomSections(userId);

        // Assert
        expect(result).toEqual([]);
        expect(mockUserProfileRepository.findOne).toHaveBeenCalledWith({
          userId,
        });
      });

      it("should handle null customSections gracefully", async () => {
        // Arrange
        const userId = new Types.ObjectId();
        const entity = UserProfileTestFixture.createUserProfileEntity(
          (builder) => builder.setCustomSections(null as any)
        );

        vi.spyOn(mockUserProfileRepository, "findOne").mockResolvedValue(
          entity
        );

        // Act
        const result = await userProfileService.getCustomSections(userId);

        // Assert
        expect(result).toEqual([]);
        expect(mockUserProfileRepository.findOne).toHaveBeenCalledWith({
          userId,
        });
      });
    });
  });
});
