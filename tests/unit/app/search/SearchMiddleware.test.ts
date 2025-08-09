import { describe, it, expect, beforeEach, vi, MockedObject } from "vitest";
import { Request, Response, NextFunction } from "express";
import SearchMiddleware from "../../../../src/app/search/SearchMiddleware.js";
import SearchMiddlewareDataProvider from "./dataProviders/SearchMiddlewareDataProvider.js";

describe("SearchMiddleware", () => {
  let mockRequest: MockedObject<Request>;
  let mockResponse: MockedObject<Response>;
  let mockNext: MockedObject<NextFunction>;

  beforeEach(() => {
    mockRequest = {
      params: {},
      query: {},
    } as unknown as MockedObject<Request>;

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as MockedObject<Response>;

    mockNext = vi.fn() as MockedObject<NextFunction>;
  });

  describe("validateSearchCertifications", () => {
    describe("success cases", () => {
      it.each(SearchMiddlewareDataProvider.searchCertificationsSuccessCases())(
        "$description",
        async (testCase) => {
          // Arrange
          mockRequest.params = testCase.request.params;
          mockRequest.query = testCase.request.query;

          // Act
          SearchMiddleware.validateSearchCertifications(
            mockRequest as any,
            mockResponse as Response,
            mockNext as NextFunction
          );

          // Assert
          expect(mockNext).toHaveBeenCalledWith();
        }
      );
    });

    describe("error cases", () => {
      it.each(SearchMiddlewareDataProvider.searchCertificationsErrorCases())(
        "$description",
        async (testCase) => {
          // Arrange
          mockRequest.params = testCase.request.params;
          mockRequest.query = testCase.request.query;

          // Act
          SearchMiddleware.validateSearchCertifications(
            mockRequest as any,
            mockResponse as Response,
            mockNext as NextFunction
          );

          // Assert
          expect(mockResponse.status).toHaveBeenCalledWith(400);
          expect(mockResponse.json).toHaveBeenCalledWith({
            message: "Search validation failed",
            errors: testCase.expectedValidationErrors.map((error) =>
              error.toJSON()
            ),
          });
          expect(mockNext).not.toHaveBeenCalled();
        }
      );
    });
  });
});
