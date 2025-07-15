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
import UserProfileMiddlewareDataProvider from "./dataProviders/UserProfileMiddlewareDataProvider.js";
import {
  CustomSectionRequest,
  BasicUserProfileInfoRequest,
} from "@seenelm/train-core";
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
type DeleteCustomSectionRequestType = Request<{
  userId: string;
  sectionTitle: string;
}>;
type GetCustomSectionsRequestType = Request<{ userId: string }>;
type BasicProfileUpdateRequestType = Request<
  { userId: string },
  {},
  BasicUserProfileInfoRequest
>;
type MockRequestType =
  | CustomSectionRequestType
  | UpdateUserProfileRequestType
  | DeleteCustomSectionRequestType
  | GetCustomSectionsRequestType
  | BasicProfileUpdateRequestType;

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

  describe("validateBasicProfileUpdate", () => {
    describe("success cases", () => {
      it.each(
        UserProfileMiddlewareDataProvider.validateBasicProfileUpdateSuccessCases()
      )("$description", async ({ request }) => {
        // Arrange
        mockRequest.params = request.params;
        mockRequest.body = request.body;

        // Act
        UserProfileMiddleware.validateBasicProfileUpdate(
          mockRequest as BasicProfileUpdateRequestType,
          mockResponse as Response,
          mockNext as NextFunction
        );

        // Assert
        expect(CreateValidator.validate).toHaveBeenCalledWith(
          request,
          UserProfileRequestRules.basicProfileUpdateRules
        );
        expect(mockNext).toHaveBeenCalledWith();
        expect(mockNext).toHaveBeenCalledTimes(1);
      });
    });

    describe("error cases", () => {
      it.each(
        UserProfileMiddlewareDataProvider.validateBasicProfileUpdateErrorCases()
      )("$description", async ({ request, validationErrors, error }) => {
        // Arrange
        mockRequest.params = request.params;
        mockRequest.body = request.body;

        vi.mocked(CreateValidator.validate).mockReturnValueOnce(
          validationErrors
        );

        // Act
        UserProfileMiddleware.validateBasicProfileUpdate(
          mockRequest as BasicProfileUpdateRequestType,
          mockResponse as Response,
          mockNext as NextFunction
        );

        // Assert
        expect(CreateValidator.validate).toHaveBeenCalledWith(
          request,
          UserProfileRequestRules.basicProfileUpdateRules
        );
        expect(mockNext).toHaveBeenCalledWith(error);
        expect(mockNext).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("validateGetCustomSections", () => {
    describe("success cases", () => {
      it.each(
        UserProfileMiddlewareDataProvider.validateGetCustomSectionsSuccessCases()
      )("$description", async ({ request }) => {
        // Arrange
        mockRequest.params = request.params;
        mockRequest.body = request.body;

        // Act
        UserProfileMiddleware.validateGetCustomSections(
          mockRequest as GetCustomSectionsRequestType,
          mockResponse as Response,
          mockNext as NextFunction
        );

        // Assert
        expect(CreateValidator.validate).toHaveBeenCalledWith(
          request,
          UserProfileRequestRules.getCustomSectionsRules
        );
        expect(mockNext).toHaveBeenCalledWith();
        expect(mockNext).toHaveBeenCalledTimes(1);
      });
    });

    describe("error cases", () => {
      it.each(
        UserProfileMiddlewareDataProvider.validateGetCustomSectionsErrorCases()
      )("$description", async ({ request, validationErrors, error }) => {
        // Arrange
        mockRequest.params = request.params;
        mockRequest.body = request.body;

        vi.mocked(CreateValidator.validate).mockReturnValueOnce(
          validationErrors
        );

        // Act
        UserProfileMiddleware.validateGetCustomSections(
          mockRequest as GetCustomSectionsRequestType,
          mockResponse as Response,
          mockNext as NextFunction
        );

        // Assert
        expect(CreateValidator.validate).toHaveBeenCalledWith(
          request,
          UserProfileRequestRules.getCustomSectionsRules
        );
        expect(mockNext).toHaveBeenCalledWith(error);
        expect(mockNext).toHaveBeenCalledTimes(1);
      });
    });
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
          UserProfileRequestRules.customSectionRules
        );
        expect(mockNext).toHaveBeenCalled();
      });
    });

    describe("error cases", () => {
      it.each(
        UserProfileMiddlewareDataProvider.validateCreateCustomSectionErrorCases()
      )("$description", async ({ request, error, validationErrors }) => {
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
          UserProfileRequestRules.customSectionRules
        );
        expect(mockNext).toHaveBeenCalledWith(error);
      });
    });
  });

  describe("validateUpdateCustomSection", () => {
    describe("success cases", () => {
      it.each(
        UserProfileMiddlewareDataProvider.validateUpdateCustomSectionSuccessCases()
      )("$description", async ({ request }) => {
        // Arrange
        mockRequest.params = request.params;
        mockRequest.body = request.body;

        // Act
        UserProfileMiddleware.validateUpdateCustomSection(
          mockRequest as CustomSectionRequestType,
          mockResponse as Response,
          mockNext as NextFunction
        );

        // Assert
        expect(CreateValidator.validate).toHaveBeenCalledWith(
          request,
          UserProfileRequestRules.customSectionRules
        );
        expect(mockNext).toHaveBeenCalledWith();
        expect(mockNext).toHaveBeenCalledTimes(1);
      });
    });

    describe("error cases", () => {
      it.each(
        UserProfileMiddlewareDataProvider.validateUpdateCustomSectionErrorCases()
      )("$description", async ({ request, validationErrors, error }) => {
        // Arrange
        mockRequest.params = request.params;
        mockRequest.body = request.body;

        vi.mocked(CreateValidator.validate).mockReturnValueOnce(
          validationErrors
        );

        // Act
        UserProfileMiddleware.validateUpdateCustomSection(
          mockRequest as CustomSectionRequestType,
          mockResponse as Response,
          mockNext as NextFunction
        );

        // Assert
        expect(CreateValidator.validate).toHaveBeenCalledWith(
          request,
          UserProfileRequestRules.customSectionRules
        );
        expect(mockNext).toHaveBeenCalledWith(error);
        expect(mockNext).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("validateDeleteCustomSection", () => {
    describe("success cases", () => {
      it.each(
        UserProfileMiddlewareDataProvider.validateDeleteCustomSectionSuccessCases()
      )("$description", async ({ request }) => {
        // Arrange
        mockRequest.params = request.params;
        mockRequest.body = request.body;

        // Act
        UserProfileMiddleware.validateDeleteCustomSection(
          mockRequest as DeleteCustomSectionRequestType,
          mockResponse as Response,
          mockNext as NextFunction
        );

        // Assert
        expect(CreateValidator.validate).toHaveBeenCalledWith(
          request,
          UserProfileRequestRules.deleteCustomSectionRules
        );
        expect(mockNext).toHaveBeenCalledWith();
        expect(mockNext).toHaveBeenCalledTimes(1);
      });
    });

    describe("error cases", () => {
      it.each(
        UserProfileMiddlewareDataProvider.validateDeleteCustomSectionErrorCases()
      )("$description", async ({ request, validationErrors, error }) => {
        // Arrange
        mockRequest.params = request.params;
        mockRequest.body = request.body;

        vi.mocked(CreateValidator.validate).mockReturnValueOnce(
          validationErrors
        );

        // Act
        UserProfileMiddleware.validateDeleteCustomSection(
          mockRequest as DeleteCustomSectionRequestType,
          mockResponse as Response,
          mockNext as NextFunction
        );

        // Assert
        expect(CreateValidator.validate).toHaveBeenCalledWith(
          request,
          UserProfileRequestRules.deleteCustomSectionRules
        );
        expect(mockNext).toHaveBeenCalledWith(error);
        expect(mockNext).toHaveBeenCalledTimes(1);
      });
    });
  });
});
