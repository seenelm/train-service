import { ISearchService } from "./SearchService.js";
import { Request, Response, NextFunction } from "express";
import { StatusCodes as HttpStatusCode } from "http-status-codes";
import { SearchQuery } from "./SearchSchema.js";

export default class SearchController {
  private searchService: ISearchService;

  constructor(searchService: ISearchService) {
    this.searchService = searchService;
  }

  public searchCertifications = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { searchTerm, page, limit } = (req as any)
        .validatedQuery as SearchQuery;

      const result = await this.searchService.searchCertifications(searchTerm, {
        page,
        limit,
      });

      res.status(HttpStatusCode.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  public searchProfiles = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { searchTerm, page, limit } = (req as any)
        .validatedQuery as SearchQuery;

      const result = await this.searchService.searchProfiles(searchTerm, {
        page,
        limit,
      });

      res.status(HttpStatusCode.OK).json(result);
    } catch (error) {
      next(error);
    }
  };
}
