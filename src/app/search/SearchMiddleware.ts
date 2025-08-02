import { NextFunction, Request, Response } from "express";
import { searchQuerySchema } from "./SearchSchema.js";

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
      return res.status(400).json({
        message: "Search validation failed",
        errors: result.error.issues.map((issue) => ({
          field: issue.path[0],
          message: issue.message,
        })),
      });
    }

    // Attach parsed and typed data to request for downstream use (optional)
    (req as any).validatedQuery = result.data;
    next();
  };
}
