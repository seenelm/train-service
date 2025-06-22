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
import UserProfileMiddleware from "../../../../src/app/userProfile/UserProfileMiddleware.js";
import UserProfileMiddlewareDataProvider from "../../dataProviders/UserProfileMiddlewareDataProvider.js";
import { CustomSectionRequest } from "@seenelm/train-core";
import { CreateValidator } from "../../../../src/common/utils/requestValidation.js";
import UserProfileRequestRules from "../../../../src/app/userProfile/UserProfileRequestRules.js";
import { CustomSectionType } from "@seenelm/train-core";

type CustomSectionRequestType = Request<
  { userId: string },
  {},
  CustomSectionRequest
>;
type UpdateUserProfileRequestType = Request<
  {},
  {},
  { customSections?: CustomSectionRequest[] }
>;
type MockRequestType = CustomSectionRequestType | UpdateUserProfileRequestType;

describe("UserProfileMiddleware", () => {
  let mockRequest: MockedObject<MockRequestType>;
  let mockResponse: MockedObject<Response>;
  let mockNext: MockedObject<NextFunction>;

  beforeEach(() => {
    mockRequest = {
      body: {},
    } as unknown as MockedObject<MockRequestType>;
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as MockedObject<Response>;
    mockNext = vi.fn() as unknown as MockedObject<NextFunction>;

    vi.spyOn(CreateValidator, "validate");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("validateCreateCustomSection", () => {
    describe("success cases", () => {
      it.each(
        UserProfileMiddlewareDataProvider.validateCreateCustomSectionSuccessCases()
      )("$description", async ({ request }) => {
        // Arrange
        mockRequest.params = request.params;
        mockRequest.body = request.body;

        // Act
        UserProfileMiddleware.validateCreateCustomSection(
          mockRequest as CustomSectionRequestType,
          mockResponse as Response,
          mockNext as NextFunction
        );

        // Assert
        expect(CreateValidator.validate).toHaveBeenCalledWith(
          request,
          UserProfileRequestRules.createCustomSectionRules
        );
        expect(mockNext).toHaveBeenCalled();
      });
    });

    describe("error cases", () => {
      it.each(
        UserProfileMiddlewareDataProvider.validateCreateCustomSectionErrorCases()
      )(
        "$description",
        async ({ request, error, validationErrors, expectedErrorResponse }) => {
          // Arrange
          mockRequest.params = request.params;
          mockRequest.body = request.body;

          vi.mocked(CreateValidator.validate).mockReturnValueOnce(
            validationErrors
          );

          // Act
          UserProfileMiddleware.validateCreateCustomSection(
            mockRequest as CustomSectionRequestType,
            mockResponse as Response,
            mockNext as NextFunction
          );

          // Assert
          expect(CreateValidator.validate).toHaveBeenCalledWith(
            request,
            UserProfileRequestRules.createCustomSectionRules
          );
          expect(mockNext).toHaveBeenCalledWith(error);
        }
      );
    });
  });
});
