import { ISearchService } from "./SearchService.js";
import { Request, Response, NextFunction } from "express";
import { PaginationRequest } from "../userProfile/userProfileDto.js";
import { StatusCodes as HttpStatusCode } from "http-status-codes";

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
      const { searchTerm } = req.params;
      const paginationRequest: PaginationRequest = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
      };

      const result = await this.searchService.searchCertifications(
        searchTerm,
        paginationRequest
      );

      res.status(HttpStatusCode.OK).json(result);
    } catch (error) {
      next(error);
    }
  };
}
