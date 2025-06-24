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
});
