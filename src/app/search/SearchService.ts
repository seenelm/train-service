import {
  PaginationRequest,
  PaginationResponse,
  CertificationResponse,
} from "../userProfile/userProfileDto.js";
import { ICertificationRepository } from "../../infrastructure/database/repositories/userProfile/CertificationRepository.js";
import { Logger } from "../../common/logger.js";
import { MongooseError } from "mongoose";
import { MongoServerError } from "mongodb";
import { APIError } from "../../common/errors/APIError.js";
import { DatabaseError } from "../../common/errors/DatabaseError.js";
import { ErrorMessage } from "../../common/enums.js";

export interface ISearchService {
  searchCertifications(
    searchTerm: string,
    paginationRequest: PaginationRequest
  ): Promise<PaginationResponse<CertificationResponse>>;
}

export default class SearchService implements ISearchService {
  private certificationRepository: ICertificationRepository;
  private logger: Logger;

  constructor(certificationRepository: ICertificationRepository) {
    this.certificationRepository = certificationRepository;
    this.logger = Logger.getInstance();
  }

  public async searchCertifications(
    searchTerm: string,
    paginationRequest: PaginationRequest
  ): Promise<PaginationResponse<CertificationResponse>> {
    try {
      const result = await this.certificationRepository.searchCertifications(
        searchTerm.trim(),
        paginationRequest
      );

      this.logger.info("Certification search completed", {
        searchTerm: searchTerm.trim(),
        totalResults: result.pagination.totalItems,
        page: result.pagination.page,
      });

      return {
        data: result.data.map((cert) =>
          this.certificationRepository.toResponse(cert)
        ),
        pagination: result.pagination,
      };
    } catch (error) {
      this.logger.error("Certification search failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        searchTerm,
        pagination: paginationRequest,
      });

      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else {
        throw APIError.InternalServerError(
          ErrorMessage.SEARCH_OPERATION_FAILED
        );
      }
    }
  }
}
