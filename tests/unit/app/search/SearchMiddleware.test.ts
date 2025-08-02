import { describe, it, expect, beforeEach, vi, MockedObject } from "vitest";
import { Request, Response, NextFunction } from "express";
import SearchMiddleware from "../../../../src/app/search/SearchMiddleware.js";
import SearchMiddlewareDataProvider from "./dataProviders/SearchMiddlewareDataProvider.js";
import { APIError } from "../../../../src/common/errors/APIError.js";
import { Logger } from "../../../../src/common/logger.js";

// Mock the Logger
// vi.mock("../../../../src/common/logger.js", () => ({
//   Logger: {
//     getInstance: vi.fn(() => ({
//       info: vi.fn(),
//       warn: vi.fn(),
//       error: vi.fn(),
//     })),
//   },
// }));

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
          expect(mockNext).toHaveBeenCalledWith(
            expect.objectContaining({
              message: "Search validation failed",
              errors: testCase.expectedValidationErrors,
            })
          );
        }
      );
    });

    describe("edge cases", () => {
      it("should handle missing search term parameter", async () => {
        // Arrange
        mockRequest.params = {};
        mockRequest.query = { page: "1", limit: "10" };

        // Act
        SearchMiddleware.validateSearchCertifications(
          mockRequest as any,
          mockResponse as Response,
          mockNext as NextFunction
        );

        // Assert
        expect(mockNext).toHaveBeenCalledWith(
          expect.objectContaining({
            message: "Search validation failed",
            errors: ["Search term is required"],
          })
        );
      });

      it("should handle empty query parameters", async () => {
        // Arrange
        mockRequest.params = {};
        mockRequest.query = { searchTerm: "test" };

        // Act
        SearchMiddleware.validateSearchCertifications(
          mockRequest as any,
          mockResponse as Response,
          mockNext as NextFunction
        );

        // Assert
        expect(mockNext).toHaveBeenCalledWith();
      });

      it("should handle whitespace trimming", async () => {
        // Arrange
        mockRequest.params = {};
        mockRequest.query = { searchTerm: "  test  " };

        // Act
        SearchMiddleware.validateSearchCertifications(
          mockRequest as any,
          mockResponse as Response,
          mockNext as NextFunction
        );

        // Assert
        expect(mockNext).toHaveBeenCalledWith();
        expect(mockRequest.query.searchTerm).toBe("test");
      });

      it("should handle control characters in search term", async () => {
        // Arrange
        mockRequest.params = {};
        mockRequest.query = { searchTerm: "test\x00term" };

        // Act
        SearchMiddleware.validateSearchCertifications(
          mockRequest as any,
          mockResponse as Response,
          mockNext as NextFunction
        );

        // Assert
        expect(mockNext).toHaveBeenCalledWith(
          expect.objectContaining({
            message: "Search validation failed",
            errors: ["Search term normalization failed"],
          })
        );
      });

      it("should handle excessive whitespace", async () => {
        // Arrange
        mockRequest.params = {};
        mockRequest.query = { searchTerm: "test   term" };

        // Act
        SearchMiddleware.validateSearchCertifications(
          mockRequest as any,
          mockResponse as Response,
          mockNext as NextFunction
        );

        // Assert
        expect(mockNext).toHaveBeenCalledWith(
          expect.objectContaining({
            message: "Search validation failed",
            errors: ["Search term normalization failed"],
          })
        );
      });

      it("should handle validation errors and pass them to next", async () => {
        // Arrange
        mockRequest.params = {};
        mockRequest.query = { searchTerm: "a".repeat(101) };

        // Act
        SearchMiddleware.validateSearchCertifications(
          mockRequest as any,
          mockResponse as Response,
          mockNext as NextFunction
        );

        // Assert
        expect(mockNext).toHaveBeenCalledWith(
          expect.objectContaining({
            message: "Search validation failed",
            errors: ["Search term must be 100 characters or less"],
          })
        );
      });
    });
  });
});
