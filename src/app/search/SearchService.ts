import { ICertificationRepository } from "../../infrastructure/database/repositories/userProfile/CertificationRepository.js";
import { ISearchRepository } from "../../infrastructure/database/repositories/search/SearchRepository.js";
import { IUserProfileRepository } from "../../infrastructure/database/repositories/user/UserProfileRepository.js";
import { IGroupRepository } from "../../infrastructure/database/repositories/group/GroupRepository.js";
import { Logger } from "../../common/logger.js";
import { MongooseError } from "mongoose";
import { MongoServerError } from "mongodb";
import { APIError } from "../../common/errors/APIError.js";
import { DatabaseError } from "../../common/errors/DatabaseError.js";
import { ErrorMessage } from "../../common/enums.js";
import {
  PaginationRequest,
  PaginationResponse,
  CertificationResponse,
  UserProfileResponse,
} from "@seenelm/train-core";
import { SearchProfilesResponse } from "./searchDto.js";
import { GroupResponse } from "@seenelm/train-core";

export interface ISearchService {
  searchCertifications(
    searchTerm: string,
    paginationRequest: PaginationRequest
  ): Promise<PaginationResponse<CertificationResponse>>;
  searchProfiles(
    searchTerm: string,
    paginationRequest: PaginationRequest
  ): Promise<PaginationResponse<SearchProfilesResponse>>;
}

export default class SearchService implements ISearchService {
  private certificationRepository: ICertificationRepository;
  private searchRepository: ISearchRepository;
  private userProfileRepository: IUserProfileRepository;
  private groupRepository: IGroupRepository;
  private logger: Logger;

  constructor(
    certificationRepository: ICertificationRepository,
    searchRepository: ISearchRepository,
    userProfileRepository: IUserProfileRepository,
    groupRepository: IGroupRepository
  ) {
    this.certificationRepository = certificationRepository;
    this.searchRepository = searchRepository;
    this.userProfileRepository = userProfileRepository;
    this.groupRepository = groupRepository;
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

  public async searchProfiles(
    searchTerm: string,
    paginationRequest: PaginationRequest
  ): Promise<PaginationResponse<SearchProfilesResponse>> {
    try {
      const result = await this.searchRepository.searchProfiles(
        searchTerm.trim(),
        paginationRequest
      );

      // Convert entities to response objects using repository methods
      const searchResult = result.data[0]; // Get the first (and only) item
      const userProfileResponses: UserProfileResponse[] =
        searchResult.userProfiles.map((profile) =>
          this.userProfileRepository.toResponse(profile)
        );

      const groupResponses: GroupResponse[] = searchResult.groups.map((group) =>
        this.groupRepository.toResponse(group)
      );

      const profileResponse: SearchProfilesResponse = {
        userProfiles: userProfileResponses,
        groups: groupResponses,
      };

      this.logger.info("Profile search completed", {
        searchTerm: searchTerm.trim(),
        totalResults: result.pagination.totalItems,
        userProfilesFound: userProfileResponses.length,
        groupsFound: groupResponses.length,
        page: result.pagination.page,
      });

      return {
        data: [profileResponse],
        pagination: result.pagination,
      };
    } catch (error) {
      this.logger.error("Profile search failed", {
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
