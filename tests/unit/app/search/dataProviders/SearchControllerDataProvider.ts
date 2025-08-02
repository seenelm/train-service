import SearchTestFixture from "../../../../fixtures/SearchTestFixture.js";
import { APIError } from "../../../../../src/common/errors/APIError.js";
import { DatabaseError } from "../../../../../src/common/errors/DatabaseError.js";
import { ErrorMessage } from "../../../../../src/common/enums.js";
import { MongooseError } from "mongoose";
import { MongoServerError } from "mongodb";
import { PaginationResponse, CertificationResponse } from "@seenelm/train-core";
import Certification from "../../../../../src/infrastructure/database/entity/userProfile/Certification.js";

interface SuccessTestCase {
  description: string;
  request: {
    params: Record<string, string>;
    query: Record<string, string>;
  };
  expectedResponse: PaginationResponse<CertificationResponse>;
}

interface ErrorTestCase {
  description: string;
  request: {
    params: Record<string, string>;
    query: Record<string, string>;
  };
  error: Error;
}

export default class SearchControllerDataProvider {
  static searchCertificationsSuccessCases(): SuccessTestCase[] {
    const createTestData = (count: number, paginationOverrides?: any) => {
      const certifications =
        SearchTestFixture.createMultipleCertifications(count);
      return SearchTestFixture.createCertificationPaginationResponse(
        certifications,
        paginationOverrides
      );
    };

    return [
      {
        description:
          "should search certifications successfully with valid search term",
        request: {
          params: {},
          query: { searchTerm: SearchTestFixture.createSearchTerm() },
        },
        expectedResponse: createTestData(5),
      },
      {
        description: "should search certifications with custom pagination",
        request: {
          params: {},
          query: { searchTerm: "fitness", page: "2", limit: "5" },
        },
        expectedResponse: createTestData(5, {
          pagination: {
            page: 2,
            limit: 5,
            totalItems: 15,
            totalPages: 3,
            hasNextPage: true,
            hasPreviousPage: true,
          },
        }),
      },
    ];
  }

  static searchCertificationsErrorCases(): ErrorTestCase[] {
    return [
      {
        description: "should handle DatabaseError",
        request: {
          params: {},
          query: { searchTerm: "personal trainer" },
        },
        error: new DatabaseError("Database connection failed"),
      },
      {
        description: "should handle unknown error",
        request: {
          params: {},
          query: { searchTerm: "nutrition", page: "2", limit: "5" },
        },
        error: APIError.InternalServerError(
          ErrorMessage.SEARCH_OPERATION_FAILED
        ),
      },
    ];
  }
}
