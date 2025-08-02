import { NextFunction, Request, Response } from "express";
import { searchQuerySchema } from "./SearchSchema.js";
import { ValidationErrorResponse } from "../../common/errors/ValidationErrorResponse.js";

export default class SearchMiddleware {
  public static validateSearchCertifications = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    // Normalize the search term before validation
    if (req.query.searchTerm) {
      req.query.searchTerm = (req.query.searchTerm as string).trim();
    }

    const result = searchQuerySchema.safeParse(req.query);
    if (!result.success) {
      const validationErrors = ValidationErrorResponse.fromZodError(
        result.error
      );

      return res.status(400).json({
        message: "Search validation failed",
        errors: validationErrors.map((error) => error.toJSON()),
      });
    }

    // Attach parsed and typed data to request for downstream use (optional)
    req.validatedQuery = result.data;
    next();
  };
}
