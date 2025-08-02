import { Request, Response, NextFunction } from "express";
import { ValidationErrorMessage } from "../../../../../src/common/enums.js";

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
  expectedValidationErrors: string[];
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
        expectedValidationErrors: [ValidationErrorMessage.SEARCH_TERM_REQUIRED],
      },
      {
        description: "should fail validation with empty search term",
        request: {
          params: {},
          query: { searchTerm: "" },
        },
        expectedValidationErrors: [ValidationErrorMessage.SEARCH_TERM_REQUIRED],
      },
      {
        description: "should fail validation with whitespace-only search term",
        request: {
          params: {},
          query: { searchTerm: "   ", page: "1", limit: "20" },
        },
        expectedValidationErrors: [
          ValidationErrorMessage.SEARCH_TERM_REQUIRED,
          ValidationErrorMessage.SEARCH_TERM_TOO_SHORT,
        ],
      },
      {
        description: "should fail validation with search term too long",
        request: {
          params: {},
          query: { searchTerm: "a".repeat(101) },
        },
        expectedValidationErrors: [ValidationErrorMessage.SEARCH_TERM_TOO_LONG],
      },
      {
        description: "should fail validation with invalid characters",
        request: {
          params: {},
          query: { searchTerm: "fitness\x00training", page: "1", limit: "10" },
        },
        expectedValidationErrors: [
          ValidationErrorMessage.SEARCH_TERM_NORMALIZATION_FAILED,
        ],
      },
      {
        description: "should fail validation with excessive whitespace",
        request: {
          params: {},
          query: { searchTerm: "fitness   training" },
        },
        expectedValidationErrors: [
          ValidationErrorMessage.SEARCH_TERM_NORMALIZATION_FAILED,
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
          ValidationErrorMessage.SEARCH_TERM_INVALID_CHARACTERS,
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
          ValidationErrorMessage.SEARCH_TERM_INVALID_CHARACTERS,
        ],
      },
      {
        description: "should fail validation with NoSQL injection attempt",
        request: {
          params: {},
          query: { searchTerm: "fitness $where", page: "1", limit: "10" },
        },
        expectedValidationErrors: [
          ValidationErrorMessage.SEARCH_TERM_INVALID_CHARACTERS,
        ],
      },
      {
        description: "should fail validation with invalid page number",
        request: {
          params: {},
          query: { searchTerm: "yoga", page: "0", limit: "10" },
        },
        expectedValidationErrors: [ValidationErrorMessage.PAGE_NUMBER_INVALID],
      },
      {
        description: "should fail validation with invalid limit",
        request: {
          params: {},
          query: { searchTerm: "pilates", page: "1", limit: "0" },
        },
        expectedValidationErrors: [ValidationErrorMessage.LIMIT_INVALID],
      },
      {
        description: "should fail validation with non-numeric page",
        request: {
          params: {},
          query: { searchTerm: "strength", page: "invalid", limit: "10" },
        },
        expectedValidationErrors: [ValidationErrorMessage.PAGE_NUMBER_INVALID],
      },
      {
        description: "should fail validation with non-numeric limit",
        request: {
          params: {},
          query: { searchTerm: "cardio", page: "1", limit: "not-a-number" },
        },
        expectedValidationErrors: [ValidationErrorMessage.LIMIT_INVALID],
      },
      {
        description: "should fail validation with page number too high",
        request: {
          params: {},
          query: { searchTerm: "flexibility", page: "10001", limit: "10" },
        },
        expectedValidationErrors: [ValidationErrorMessage.PAGE_NUMBER_INVALID],
      },
      {
        description: "should fail validation with limit too high",
        request: {
          params: {},
          query: { searchTerm: "endurance", page: "1", limit: "1001" },
        },
        expectedValidationErrors: [ValidationErrorMessage.LIMIT_INVALID],
      },
    ];
  }
}
