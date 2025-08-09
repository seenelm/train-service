import { CertificationDocument } from "../../models/userProfile/certificationModel.js";
import Certification from "../../entity/userProfile/Certification.js";
import { IBaseRepository, BaseRepository } from "../BaseRepository.js";
import { Model, Types, SortOrder } from "mongoose";
import {
  PaginationRequest,
  PaginationResponse,
  CertificationResponse,
} from "@seenelm/train-core";

export interface ICertificationRepository
  extends IBaseRepository<Certification, CertificationDocument> {
  searchCertifications(
    searchTerm: string,
    paginationRequest: PaginationRequest
  ): Promise<PaginationResponse<Certification>>;

  toResponse(certification: Certification): CertificationResponse;
}

export default class CertificationRepository
  extends BaseRepository<Certification, CertificationDocument>
  implements ICertificationRepository
{
  private certificationModel: Model<CertificationDocument>;

  constructor(certificationModel: Model<CertificationDocument>) {
    super(certificationModel);
    this.certificationModel = certificationModel;
  }

  toEntity(doc: CertificationDocument): Certification {
    return Certification.builder()
      .setId(doc._id as Types.ObjectId)
      .setName(doc.name)
      .setIssuer(doc.issuer)
      .setImageURL(doc.imageURL)
      .setCertType(doc.certType)
      .setSpecializations(doc.specializations)
      .setCreatedAt(doc.createdAt)
      .setUpdatedAt(doc.updatedAt)
      .build();
  }

  toResponse(certification: Certification): CertificationResponse {
    return {
      id: certification.getId().toString(),
      name: certification.getName(),
      issuer: certification.getIssuer(),
      imageURL: certification.getImageURL(),
      certType: certification.getCertType(),
      specializations: certification.getSpecializations(),
    };
  }

  async searchCertifications(
    searchTerm: string,
    paginationRequest: PaginationRequest
  ): Promise<PaginationResponse<Certification>> {
    const { page, limit } = paginationRequest;

    // Build filter query
    const filter: any = {};

    if (searchTerm) {
      filter.$or = [
        { name: { $regex: searchTerm, $options: "i" } },
        { issuer: { $regex: searchTerm, $options: "i" } },
        { certType: { $regex: searchTerm, $options: "i" } },
        { specializations: { $in: [new RegExp(searchTerm, "i")] } },
      ];
    }

    // Always sort alphabetically by name
    const sort: { [key: string]: SortOrder } = { name: 1 };

    // Calculate skip value
    const skip = (page - 1) * limit;

    // Execute queries
    const [certifications, totalItems] = await Promise.all([
      this.certificationModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.certificationModel.countDocuments(filter).exec(),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      data: certifications.map((doc) => this.toEntity(doc)),
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    };
  }
}
