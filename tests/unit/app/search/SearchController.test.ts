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
import SearchController from "../../../../src/app/search/SearchController.js";
import { ISearchService } from "../../../../src/app/search/SearchService.js";
import SearchControllerDataProvider from "./dataProviders/SearchControllerDataProvider.js";
import { StatusCodes as HttpStatusCode } from "http-status-codes";
import { mockSearchService } from "../../../mocks/searchMocks.js";

describe("SearchController", () => {
  let searchController: SearchController;
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
      json: vi.fn(),
    } as unknown as MockedObject<Response>;

    mockNext = vi.fn() as unknown as MockedObject<NextFunction>;

    searchController = new SearchController(mockSearchService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("searchCertifications", () => {
    describe("success cases", () => {
      it.each(SearchControllerDataProvider.searchCertificationsSuccessCases())(
        "$description",
        async ({ request, expectedResponse }) => {
          // Arrange
          mockRequest.params = request.params;
          mockRequest.query = request.query;

          vi.spyOn(mockSearchService, "searchCertifications").mockResolvedValue(
            expectedResponse
          );

          // Act
          await searchController.searchCertifications(
            mockRequest as Request,
            mockResponse as Response,
            mockNext as NextFunction
          );

          // Assert
          expect(mockSearchService.searchCertifications).toHaveBeenCalledWith(
            request.query.searchTerm,
            {
              page: parseInt(request.query.page as string) || 1,
              limit: parseInt(request.query.limit as string) || 20,
            }
          );
          expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.OK);
          expect(mockResponse.json).toHaveBeenCalledWith(expectedResponse);
          expect(mockNext).not.toHaveBeenCalled();
        }
      );
    });

    describe("error cases", () => {
      it.each(SearchControllerDataProvider.searchCertificationsErrorCases())(
        "$description",
        async ({ request, error }) => {
          // Arrange
          mockRequest.params = request.params;
          mockRequest.query = request.query;

          vi.spyOn(mockSearchService, "searchCertifications").mockRejectedValue(
            error
          );

          // Act
          await searchController.searchCertifications(
            mockRequest as Request,
            mockResponse as Response,
            mockNext as NextFunction
          );

          // Assert
          expect(mockSearchService.searchCertifications).toHaveBeenCalledWith(
            request.query.searchTerm,
            {
              page: parseInt(request.query.page as string) || 1,
              limit: parseInt(request.query.limit as string) || 20,
            }
          );
          expect(mockResponse.status).not.toHaveBeenCalled();
          expect(mockResponse.json).not.toHaveBeenCalled();
          expect(mockNext).toHaveBeenCalledWith(error);
        }
      );
    });
  });
});
