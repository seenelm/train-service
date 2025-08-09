import { ValidationErrorMessage } from "../../../../../src/common/enums.js";
import { ValidationErrorResponse } from "../../../../../src/common/errors/ValidationErrorResponse.js";

export interface SearchMiddlewareTestCase {
  description: string;
  request: {
    params: Record<string, string>;
    query: { searchTerm?: string; page?: string; limit?: string };
  };
  shouldPassValidation: boolean;
}

export interface SearchMiddlewareErrorTestCase {
  description: string;
  request: {
    params: Record<string, string>;
    query: { searchTerm?: string; page?: string; limit?: string };
  };
  expectedValidationErrors: ValidationErrorResponse[];
}

export default class SearchMiddlewareDataProvider {
  static searchCertificationsSuccessCases(): SearchMiddlewareTestCase[] {
    return [
      {
        description: "should pass validation with valid search term",
        request: {
          params: {},
          query: { searchTerm: "personal trainer", page: "1", limit: "10" },
        },
        shouldPassValidation: true,
      },
      {
        description: "should pass validation with alphanumeric characters",
        request: {
          params: {},
          query: { searchTerm: "fitness123" },
        },
        shouldPassValidation: true,
      },
      {
        description: "should pass validation with special characters",
        request: {
          params: {},
          query: { searchTerm: "nutrition & wellness", page: "2", limit: "20" },
        },
        shouldPassValidation: true,
      },
      {
        description: "should pass validation with punctuation",
        request: {
          params: {},
          query: { searchTerm: "strength training, cardio" },
        },
        shouldPassValidation: true,
      },
      {
        description: "should pass validation with maximum length search term",
        request: {
          params: {},
          query: { searchTerm: "a".repeat(100), page: "1", limit: "50" },
        },
        shouldPassValidation: true,
      },
      {
        description: "should pass validation with minimum length search term",
        request: {
          params: {},
          query: { searchTerm: "a" },
        },
        shouldPassValidation: true,
      },
      {
        description: "should pass validation with whitespace that gets trimmed",
        request: {
          params: {},
          query: { searchTerm: "  yoga  ", page: "3", limit: "15" },
        },
        shouldPassValidation: true,
      },
      {
        description: "should pass validation with optional query parameters",
        request: {
          params: {},
          query: { searchTerm: "pilates" },
        },
        shouldPassValidation: true,
      },
      {
        description:
          "should pass validation with maximum page and limit values",
        request: {
          params: {},
          query: { searchTerm: "crossfit", page: "10000", limit: "1000" },
        },
        shouldPassValidation: true,
      },
      {
        description:
          "should pass validation with excessive whitespace (normalized)",
        request: {
          params: {},
          query: { searchTerm: "fitness   training" },
        },
        shouldPassValidation: true,
      },
    ];
  }

  static searchCertificationsErrorCases(): SearchMiddlewareErrorTestCase[] {
    return [
      {
        description: "should fail validation with missing search term",
        request: {
          params: {},
          query: { page: "1", limit: "10" },
        },
        expectedValidationErrors: [
          new ValidationErrorResponse(
            "searchTerm",
            ValidationErrorMessage.SEARCH_TERM_REQUIRED
          ),
        ],
      },
      {
        description: "should fail validation with empty search term",
        request: {
          params: {},
          query: { searchTerm: "" },
        },
        expectedValidationErrors: [
          new ValidationErrorResponse(
            "searchTerm",
            ValidationErrorMessage.SEARCH_TERM_REQUIRED
          ),
        ],
      },
      {
        description: "should fail validation with whitespace-only search term",
        request: {
          params: {},
          query: { searchTerm: "   ", page: "1", limit: "20" },
        },
        expectedValidationErrors: [
          new ValidationErrorResponse(
            "searchTerm",
            ValidationErrorMessage.SEARCH_TERM_REQUIRED
          ),
        ],
      },
      {
        description: "should fail validation with search term too long",
        request: {
          params: {},
          query: { searchTerm: "a".repeat(101) },
        },
        expectedValidationErrors: [
          new ValidationErrorResponse(
            "searchTerm",
            ValidationErrorMessage.SEARCH_TERM_TOO_LONG
          ),
        ],
      },
      {
        description: "should fail validation with invalid characters",
        request: {
          params: {},
          query: { searchTerm: "fitness\x00training", page: "1", limit: "10" },
        },
        expectedValidationErrors: [
          new ValidationErrorResponse(
            "searchTerm",
            ValidationErrorMessage.SEARCH_TERM_INVALID_CHARACTERS
          ),
        ],
      },

      {
        description:
          "should fail validation with unsafe characters (whitelist approach)",
        request: {
          params: {},
          query: {
            searchTerm: "fitness<script>alert('xss')</script>",
            page: "1",
            limit: "10",
          },
        },
        expectedValidationErrors: [
          new ValidationErrorResponse(
            "searchTerm",
            ValidationErrorMessage.SEARCH_TERM_INVALID_CHARACTERS
          ),
        ],
      },
      {
        description: "should fail validation with SQL injection attempt",
        request: {
          params: {},
          query: {
            searchTerm: "fitness'; DROP TABLE users; --",
            page: "1",
            limit: "10",
          },
        },
        expectedValidationErrors: [
          new ValidationErrorResponse(
            "searchTerm",
            ValidationErrorMessage.SEARCH_TERM_INVALID_CHARACTERS
          ),
        ],
      },
      {
        description: "should fail validation with NoSQL injection attempt",
        request: {
          params: {},
          query: { searchTerm: "fitness $where", page: "1", limit: "10" },
        },
        expectedValidationErrors: [
          new ValidationErrorResponse(
            "searchTerm",
            ValidationErrorMessage.SEARCH_TERM_INVALID_CHARACTERS
          ),
        ],
      },
      {
        description: "should fail validation with invalid page number",
        request: {
          params: {},
          query: { searchTerm: "fitness", page: "0", limit: "10" },
        },
        expectedValidationErrors: [
          new ValidationErrorResponse(
            "page",
            ValidationErrorMessage.PAGE_NUMBER_INVALID
          ),
        ],
      },
      {
        description: "should fail validation with page number too high",
        request: {
          params: {},
          query: { searchTerm: "fitness", page: "10001", limit: "10" },
        },
        expectedValidationErrors: [
          new ValidationErrorResponse(
            "page",
            ValidationErrorMessage.PAGE_NUMBER_INVALID
          ),
        ],
      },
      {
        description: "should fail validation with invalid limit",
        request: {
          params: {},
          query: { searchTerm: "fitness", page: "1", limit: "0" },
        },
        expectedValidationErrors: [
          new ValidationErrorResponse(
            "limit",
            ValidationErrorMessage.LIMIT_INVALID
          ),
        ],
      },
      {
        description: "should fail validation with limit too high",
        request: {
          params: {},
          query: { searchTerm: "fitness", page: "1", limit: "1001" },
        },
        expectedValidationErrors: [
          new ValidationErrorResponse(
            "limit",
            ValidationErrorMessage.LIMIT_INVALID
          ),
        ],
      },
      {
        description: "should fail validation with non-numeric page",
        request: {
          params: {},
          query: { searchTerm: "fitness", page: "abc", limit: "10" },
        },
        expectedValidationErrors: [
          new ValidationErrorResponse(
            "page",
            ValidationErrorMessage.PAGE_NUMBER_INVALID
          ),
        ],
      },
      {
        description: "should fail validation with non-numeric limit",
        request: {
          params: {},
          query: { searchTerm: "fitness", page: "1", limit: "xyz" },
        },
        expectedValidationErrors: [
          new ValidationErrorResponse(
            "limit",
            ValidationErrorMessage.LIMIT_INVALID
          ),
        ],
      },
    ];
  }
}
