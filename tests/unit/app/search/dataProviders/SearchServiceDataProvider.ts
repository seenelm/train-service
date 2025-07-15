import SearchTestFixture from "../../../../fixtures/SearchTestFixture.js";
import { APIError } from "../../../../../src/common/errors/APIError.js";
import { DatabaseError } from "../../../../../src/common/errors/DatabaseError.js";
import { ErrorMessage } from "../../../../../src/common/enums.js";
import { MongooseError } from "mongoose";
import { MongoServerError } from "mongodb";
import {
  PaginationRequest,
  PaginationResponse,
  CertificationResponse,
} from "@seenelm/train-core";
import Certification from "../../../../../src/infrastructure/database/entity/userProfile/Certification.js";

interface SuccessTestCase {
  description: string;
  searchTerm: string;
  request: PaginationRequest;
  entity: PaginationResponse<Certification>;
  expectedResponse?: PaginationResponse<CertificationResponse>;
}

interface ErrorTestCase {
  description: string;
  searchTerm: string;
  request: PaginationRequest;
  error: Error;
}

export default class SearchServiceDataProvider {
  static searchCertificationsSuccessCases(): SuccessTestCase[] {
    return [
      {
        description:
          "should search certifications successfully with valid search term",
        searchTerm: SearchTestFixture.createSearchTerm(),
        request: SearchTestFixture.createPaginationRequest(),
        entity: SearchTestFixture.createPaginationResponse(
          SearchTestFixture.createMultipleCertifications(5)
        ),
      },
      {
        description: "should search certifications with custom pagination",
        searchTerm: "fitness",
        request: SearchTestFixture.createPaginationRequest({
          page: 2,
          limit: 5,
        }),
        entity: SearchTestFixture.createPaginationResponse(
          SearchTestFixture.createMultipleCertifications(5),
          {
            pagination: {
              page: 2,
              limit: 5,
              totalItems: 15,
              totalPages: 3,
              hasNextPage: true,
              hasPreviousPage: true,
            },
          }
        ),
      },
    ];
  }

  static searchCertificationsErrorCases(): ErrorTestCase[] {
    return [
      {
        description: "should handle MongooseError",
        searchTerm: SearchTestFixture.createSearchTerm(),
        request: SearchTestFixture.createPaginationRequest(),
        error: new MongooseError("Mongoose connection error"),
      },
      {
        description: "should handle MongoServerError",
        searchTerm: SearchTestFixture.createSearchTerm(),
        request: SearchTestFixture.createPaginationRequest(),
        error: new MongoServerError({
          code: 11000,
          message: "Duplicate key error",
        }),
      },
      {
        description: "should handle DatabaseError",
        searchTerm: SearchTestFixture.createSearchTerm(),
        request: SearchTestFixture.createPaginationRequest(),
        error: new DatabaseError("Database connection failed"),
      },
      {
        description: "should handle unknown error",
        searchTerm: SearchTestFixture.createSearchTerm(),
        request: SearchTestFixture.createPaginationRequest(),
        error: APIError.InternalServerError(
          ErrorMessage.SEARCH_OPERATION_FAILED
        ),
      },
      {
        description: "should handle error with empty search term",
        searchTerm: SearchTestFixture.createSearchTerm(""),
        request: SearchTestFixture.createPaginationRequest(),
        error: new MongooseError("Query execution failed"),
      },
      {
        description: "should handle error with custom pagination",
        searchTerm: "fitness",
        request: SearchTestFixture.createPaginationRequest({
          page: 5,
          limit: 20,
        }),
        error: new MongoServerError({
          code: 121,
          message: "Document validation failed",
        }),
      },
    ];
  }
}
