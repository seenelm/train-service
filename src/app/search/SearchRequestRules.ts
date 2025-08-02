import { RuleSet } from "../../common/utils/requestValidation.js";
import { Request } from "express";
import { ValidationErrorMessage } from "../../common/enums.js";

export default class SearchRequestRules {
  public static searchCertificationsRules: RuleSet<
    Request<{}, {}, {}, { searchTerm?: string; page?: string; limit?: string }>
  > = {
    searchTerm: {
      hasError: (req) => !req.query?.searchTerm,
      message: ValidationErrorMessage.SEARCH_TERM_REQUIRED,
    },
    searchTermLength: {
      hasError: (req) => {
        const searchTerm = req.query?.searchTerm;
        return searchTerm ? (searchTerm as string).length > 100 : false;
      },
      message: ValidationErrorMessage.SEARCH_TERM_TOO_LONG,
    },
    searchTermMinLength: {
      hasError: (req) => {
        const searchTerm = req.query?.searchTerm;
        return searchTerm ? (searchTerm as string).trim().length < 1 : false;
      },
      message: ValidationErrorMessage.SEARCH_TERM_TOO_SHORT,
    },
    searchTermWhitelist: {
      hasError: (req) => {
        const searchTerm = req.query?.searchTerm;
        if (!searchTerm) return false;

        // Whitelist approach: Only allow safe characters for search terms
        // Letters, numbers, spaces, hyphens, and basic punctuation only
        const safePattern = /^[a-zA-Z0-9\s\-.,!?()&@#$%*+=:;]+$/;
        return !safePattern.test(searchTerm as string);
      },
      message: ValidationErrorMessage.SEARCH_TERM_INVALID_CHARACTERS,
    },
    searchTermNormalization: {
      hasError: (req) => {
        const searchTerm = req.query?.searchTerm;
        if (!searchTerm) return false;

        // Check for control characters and excessive whitespace
        const hasControlChars = /[\x00-\x1F\x7F]/.test(searchTerm as string);
        const hasExcessiveWhitespace = /\s{3,}/.test(searchTerm as string);
        const normalized = (searchTerm as string).trim();

        return (
          hasControlChars || hasExcessiveWhitespace || normalized.length === 0
        );
      },
      message: ValidationErrorMessage.SEARCH_TERM_NORMALIZATION_FAILED,
    },
    pageValidation: {
      hasError: (req) => {
        const page = req.query?.page;
        if (!page) return false; // page is optional

        const pageNum = parseInt(page);
        return isNaN(pageNum) || pageNum < 1 || pageNum > 10000;
      },
      message: ValidationErrorMessage.PAGE_NUMBER_INVALID,
    },
    limitValidation: {
      hasError: (req) => {
        const limit = req.query?.limit;
        if (!limit) return false; // limit is optional

        const limitNum = parseInt(limit);
        return isNaN(limitNum) || limitNum < 1 || limitNum > 1000;
      },
      message: ValidationErrorMessage.LIMIT_INVALID,
    },
  };
}
