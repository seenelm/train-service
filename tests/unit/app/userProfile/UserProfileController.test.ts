import { mockUserProfileService } from "../../../mocks/userProfileMocks.js";
import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  MockedObject,
  afterEach,
} from "vitest";
import { NextFunction, Request, Response } from "express";
import UserProfileController from "../../../../src/app/userProfile/UserProfileController.js";
import UserProfileTestFixture from "../../../fixtures/UserProfileTestFixture.js";
import { Types } from "mongoose";
import { StatusCodes as HttpStatusCode } from "http-status-codes";
import UserProfileControllerDataProvider from "./dataProviders/UserProfileControllerDataProvider.js";
import { CustomSectionType } from "@seenelm/train-core";

describe("UserProfileController", () => {
  let userProfileController: UserProfileController;
  let mockRequest: MockedObject<Request>;
  let mockResponse: MockedObject<Response>;
  let mockNext: MockedObject<NextFunction>;

  beforeEach(() => {
    userProfileController = new UserProfileController(mockUserProfileService);
    mockRequest = {
      body: {},
      params: {},
    } as unknown as MockedObject<Request>;

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as MockedObject<Response>;
    mockNext = vi.fn() as unknown as MockedObject<NextFunction>;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("updateUserProfile", () => {
    describe("success cases", () => {
      it.each(
        UserProfileControllerDataProvider.updateUserProfileSuccessCases()
      )("$description", async ({ request }) => {
        // Arrange
        mockRequest.body = request.body;

        vi.spyOn(
          mockUserProfileService,
          "updateUserProfile"
        ).mockResolvedValue();

        // Act
        await userProfileController.updateUserProfile(
          mockRequest as Request,
          mockResponse as Response,
          mockNext as NextFunction
        );

        // Assert
        expect(mockUserProfileService.updateUserProfile).toHaveBeenCalledWith(
          request.body
        );
        expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.OK);
        expect(mockResponse.json).toHaveBeenCalledWith({ success: true });
        expect(mockNext).not.toHaveBeenCalled();
      });
    });

    describe("error cases", () => {
      it.each(UserProfileControllerDataProvider.updateUserProfileErrorCases())(
        "$description",
        async ({ request, error }) => {
          // Arrange
          mockRequest.body = request.body;

          vi.spyOn(
            mockUserProfileService,
            "updateUserProfile"
          ).mockRejectedValue(error);

          // Act
          await userProfileController.updateUserProfile(
            mockRequest as Request,
            mockResponse as Response,
            mockNext as NextFunction
          );

          // Assert
          expect(mockUserProfileService.updateUserProfile).toHaveBeenCalledWith(
            request.body
          );
          expect(mockResponse.status).not.toHaveBeenCalled();
          expect(mockResponse.json).not.toHaveBeenCalled();
          expect(mockNext).toHaveBeenCalledWith(error);
        }
      );
    });
  });

  describe("updateBasicUserProfile", () => {
    describe("success cases", () => {
      it.each(
        UserProfileControllerDataProvider.updateBasicUserProfileSuccessCases()
      )("$description", async ({ request }) => {
        // Arrange
        mockRequest.params = request.params;
        mockRequest.body = request.body;

        vi.spyOn(
          mockUserProfileService,
          "updateBasicUserProfileInfo"
        ).mockResolvedValue();

        // Act
        await userProfileController.updateBasicUserProfile(
          mockRequest as Request,
          mockResponse as Response,
          mockNext as NextFunction
        );

        // Assert
        expect(
          mockUserProfileService.updateBasicUserProfileInfo
        ).toHaveBeenCalledWith(
          new Types.ObjectId(request.params.userId),
          request.body
        );
        expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.OK);
        expect(mockResponse.json).toHaveBeenCalledWith({ success: true });
        expect(mockNext).not.toHaveBeenCalled();
      });
    });

    describe("error cases", () => {
      it.each(
        UserProfileControllerDataProvider.updateBasicUserProfileErrorCases()
      )("$description", async ({ request, error }) => {
        // Arrange
        mockRequest.params = request.params;
        mockRequest.body = request.body;

        vi.spyOn(
          mockUserProfileService,
          "updateBasicUserProfileInfo"
        ).mockRejectedValue(error);

        // Act
        await userProfileController.updateBasicUserProfile(
          mockRequest as Request,
          mockResponse as Response,
          mockNext as NextFunction
        );

        // Assert
        expect(
          mockUserProfileService.updateBasicUserProfileInfo
        ).toHaveBeenCalledWith(
          new Types.ObjectId(request.params.userId),
          request.body
        );
        expect(mockResponse.status).not.toHaveBeenCalled();
        expect(mockResponse.json).not.toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalledWith(error);
      });
    });
  });

  describe("createCustomSection", () => {
    it("should create a custom section successfully and return 201 status", async () => {
      // Arrange
      const userId = new Types.ObjectId().toString();
      const request = UserProfileTestFixture.createCustomSectionRequest();

      mockRequest.params = { userId };
      mockRequest.body = request;

      vi.spyOn(
        mockUserProfileService,
        "createCustomSection"
      ).mockResolvedValue();

      // Act
      await userProfileController.createCustomSection(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      // Assert
      expect(mockUserProfileService.createCustomSection).toHaveBeenCalledWith(
        new Types.ObjectId(userId),
        request
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.CREATED);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: true });
      expect(mockNext).not.toHaveBeenCalled();
    });

    describe("error cases", () => {
      it.each(
        UserProfileControllerDataProvider.createCustomSectionErrorCases()
      )("$description", async ({ request, error }) => {
        // Arrange
        mockRequest.params = request.params;
        mockRequest.body = request.body;

        vi.spyOn(
          mockUserProfileService,
          "createCustomSection"
        ).mockRejectedValue(error);

        // Act
        await userProfileController.createCustomSection(
          mockRequest as Request,
          mockResponse as Response,
          mockNext as NextFunction
        );

        // Assert
        expect(mockUserProfileService.createCustomSection).toHaveBeenCalledWith(
          new Types.ObjectId(request.params.userId),
          request.body
        );
        expect(mockResponse.status).not.toHaveBeenCalled();
        expect(mockResponse.json).not.toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalledWith(error);
      });
    });
  });

  describe("updateCustomSection", () => {
    it("should update a custom section successfully and return 201 status", async () => {
      // Arrange
      const userId = new Types.ObjectId().toString();
      const request = UserProfileTestFixture.createCustomSectionRequest();

      mockRequest.params = { userId };
      mockRequest.body = request;

      vi.spyOn(
        mockUserProfileService,
        "updateCustomSection"
      ).mockResolvedValue();

      // Act
      await userProfileController.updateCustomSection(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      // Assert
      expect(mockUserProfileService.updateCustomSection).toHaveBeenCalledWith(
        new Types.ObjectId(userId),
        request
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: true });
      expect(mockNext).not.toHaveBeenCalled();
    });

    describe("error cases", () => {
      it.each(
        UserProfileControllerDataProvider.updateCustomSectionErrorCases()
      )("$description", async ({ request, error }) => {
        // Arrange
        mockRequest.params = request.params;
        mockRequest.body = request.body;

        vi.spyOn(
          mockUserProfileService,
          "updateCustomSection"
        ).mockRejectedValue(error);

        // Act
        await userProfileController.updateCustomSection(
          mockRequest as Request,
          mockResponse as Response,
          mockNext as NextFunction
        );

        // Assert
        expect(mockUserProfileService.updateCustomSection).toHaveBeenCalledWith(
          new Types.ObjectId(request.params.userId),
          request.body
        );
        expect(mockResponse.status).not.toHaveBeenCalled();
        expect(mockResponse.json).not.toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalledWith(error);
      });
    });
  });

  describe("getCustomSections", () => {
    it("should get custom sections successfully and return 200 status", async () => {
      // Arrange
      const userId = new Types.ObjectId().toString();
      const expectedResponse = [
        UserProfileTestFixture.createCustomSectionResponse({
          title: CustomSectionType.ACHIEVEMENTS,
          details: [
            {
              title: "Test Achievement",
              date: "2024-03-20",
              description: "Test description",
            },
          ],
        }),
      ];

      mockRequest.params = { userId };

      vi.spyOn(mockUserProfileService, "getCustomSections").mockResolvedValue(
        expectedResponse
      );

      // Act
      await userProfileController.getCustomSections(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      // Assert
      expect(mockUserProfileService.getCustomSections).toHaveBeenCalledWith(
        new Types.ObjectId(userId)
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResponse);
      expect(mockNext).not.toHaveBeenCalled();
    });

    describe("error cases", () => {
      it.each(UserProfileControllerDataProvider.getCustomSectionsErrorCases())(
        "$description",
        async ({ request, error }) => {
          // Arrange
          mockRequest.params = request.params;

          vi.spyOn(
            mockUserProfileService,
            "getCustomSections"
          ).mockRejectedValue(error);

          // Act
          await userProfileController.getCustomSections(
            mockRequest as Request,
            mockResponse as Response,
            mockNext as NextFunction
          );

          // Assert
          expect(mockUserProfileService.getCustomSections).toHaveBeenCalledWith(
            new Types.ObjectId(request.params.userId)
          );
          expect(mockResponse.status).not.toHaveBeenCalled();
          expect(mockResponse.json).not.toHaveBeenCalled();
          expect(mockNext).toHaveBeenCalledWith(error);
        }
      );
    });
  });

  describe("deleteCustomSection", () => {
    it("should delete a custom section successfully and return 200 status", async () => {
      // Arrange
      const userId = new Types.ObjectId().toString();
      const sectionTitle = CustomSectionType.ACHIEVEMENTS;

      mockRequest.params = { userId, sectionTitle };

      vi.spyOn(
        mockUserProfileService,
        "deleteCustomSection"
      ).mockResolvedValue();

      // Act
      await userProfileController.deleteCustomSection(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      // Assert
      expect(mockUserProfileService.deleteCustomSection).toHaveBeenCalledWith(
        new Types.ObjectId(userId),
        sectionTitle
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: true });
      expect(mockNext).not.toHaveBeenCalled();
    });

    describe("error cases", () => {
      it.each(
        UserProfileControllerDataProvider.deleteCustomSectionErrorCases()
      )("$description", async ({ request, error }) => {
        // Arrange
        mockRequest.params = request.params;

        vi.spyOn(
          mockUserProfileService,
          "deleteCustomSection"
        ).mockRejectedValue(error);

        // Act
        await userProfileController.deleteCustomSection(
          mockRequest as Request,
          mockResponse as Response,
          mockNext as NextFunction
        );

        // Assert
        expect(mockUserProfileService.deleteCustomSection).toHaveBeenCalledWith(
          new Types.ObjectId(request.params.userId),
          request.params.sectionTitle
        );
        expect(mockResponse.status).not.toHaveBeenCalled();
        expect(mockResponse.json).not.toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalledWith(error);
      });
    });
  });
});
