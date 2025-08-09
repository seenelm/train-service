import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import SearchService from "../../../../src/app/search/SearchService.js";
import SearchServiceDataProvider from "./dataProviders/SearchServiceDataProvider.js";
import { MongooseError } from "mongoose";
import { MongoServerError } from "mongodb";
import { DatabaseError } from "../../../../src/common/errors/DatabaseError.js";
import {
  mockCertificationRepository,
  mockSearchRepository,
} from "../../../mocks/searchMocks.js";
import { APIError } from "../../../../src/common/errors/APIError.js";
import { mockUserProfileRepository } from "../../../mocks/userMocks.js";
import { mockGroupRepository } from "../../../mocks/groupMocks.js";

describe("SearchService", () => {
  let searchService: SearchService;

  beforeEach(() => {
    searchService = new SearchService(
      mockCertificationRepository,
      mockSearchRepository,
      mockUserProfileRepository,
      mockGroupRepository
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("searchCertifications", () => {
    describe("success cases", () => {
      it.each(SearchServiceDataProvider.searchCertificationsSuccessCases())(
        "$description",
        async ({ searchTerm, request, entity }) => {
          // Arrange

          const certificationResponses = entity.data.map((cert) => ({
            id: cert.getId().toString(),
            name: cert.getName(),
            issuer: cert.getIssuer(),
            imageURL: cert.getImageURL(),
            certType: cert.getCertType(),
            specializations: cert.getSpecializations(),
          }));

          const expectedResponse = {
            data: certificationResponses,
            pagination: entity.pagination,
          };

          vi.spyOn(
            mockCertificationRepository,
            "searchCertifications"
          ).mockResolvedValue(entity);

          vi.spyOn(
            mockCertificationRepository,
            "toResponse"
          ).mockImplementation((cert) => ({
            id: cert.getId().toString(),
            name: cert.getName(),
            issuer: cert.getIssuer(),
            imageURL: cert.getImageURL(),
            certType: cert.getCertType(),
            specializations: cert.getSpecializations(),
          }));

          // Act
          const result = await searchService.searchCertifications(
            searchTerm,
            request
          );

          console.log(result);

          // Assert
          expect(
            mockCertificationRepository.searchCertifications
          ).toHaveBeenCalledWith(searchTerm.trim(), request);
          expect(result).toEqual(expectedResponse);
        }
      );
    });

    describe("error cases", () => {
      it.each(SearchServiceDataProvider.searchCertificationsErrorCases())(
        "$description",
        async ({ searchTerm, request, error }) => {
          // Arrange
          vi.spyOn(
            mockCertificationRepository,
            "searchCertifications"
          ).mockRejectedValue(error);

          // Act & Assert
          if (
            error instanceof MongooseError ||
            error instanceof MongoServerError
          ) {
            await expect(
              searchService.searchCertifications(searchTerm, request)
            ).rejects.toThrow(DatabaseError);
          } else {
            await expect(
              searchService.searchCertifications(searchTerm, request)
            ).rejects.toThrow(APIError);
          }

          expect(
            mockCertificationRepository.searchCertifications
          ).toHaveBeenCalledWith(searchTerm.trim(), request);
        }
      );
    });
  });
});
