import { Types } from "mongoose";
import { PaginationRequest, PaginationResponse } from "@seenelm/train-core";
import Certification, {
  CertificationBuilder,
} from "../../src/infrastructure/database/entity/userProfile/Certification.js";
import { CertificationResponse } from "../../src/app/userProfile/userProfileDto.js";

export default class SearchTestFixture {
  public static ID: Types.ObjectId = new Types.ObjectId();
  public static NAME: string = "Personal Trainer Certification";
  public static ISSUER: string = "American Council on Exercise";
  public static IMAGE_URL: string = "https://example.com/cert-image.jpg";
  public static CERT_TYPE: string = "Personal Training";
  public static SPECIALIZATIONS: string[] = [
    "Strength Training",
    "Cardio",
    "Nutrition",
  ];
  public static CREATED_AT: Date = new Date("2024-01-15T10:00:00Z");
  public static UPDATED_AT: Date = new Date("2024-01-15T10:00:00Z");

  public static createCertification(
    builderFn?: (builder: CertificationBuilder) => CertificationBuilder
  ): Certification {
    const baseBuilder = Certification.builder()
      .setId(this.ID)
      .setName(this.NAME)
      .setIssuer(this.ISSUER)
      .setImageURL(this.IMAGE_URL)
      .setCertType(this.CERT_TYPE)
      .setSpecializations(this.SPECIALIZATIONS)
      .setCreatedAt(this.CREATED_AT)
      .setUpdatedAt(this.UPDATED_AT);

    const finalBuilder = builderFn ? builderFn(baseBuilder) : baseBuilder;
    return finalBuilder.build();
  }

  public static createCertificationResponse(
    updatedData?: Partial<CertificationResponse>
  ): CertificationResponse {
    return {
      id: this.ID.toString(),
      name: this.NAME,
      issuer: this.ISSUER,
      imageURL: this.IMAGE_URL,
      certType: this.CERT_TYPE,
      specializations: this.SPECIALIZATIONS,
      createdAt: this.CREATED_AT,
      updatedAt: this.UPDATED_AT,
      ...updatedData,
    };
  }

  public static createPaginationRequest(
    updatedData?: Partial<PaginationRequest>
  ): PaginationRequest {
    return {
      page: 1,
      limit: 10,
      ...updatedData,
    };
  }

  public static createPaginationResponse<T>(
    data: T[],
    updatedData?: Partial<PaginationResponse<T>>
  ): PaginationResponse<T> {
    const basePagination = {
      page: 1,
      limit: 10,
      totalItems: data.length,
      totalPages: Math.ceil(data.length / 10),
      hasNextPage: data.length > 10,
      hasPreviousPage: false,
    };

    return {
      data,
      pagination: {
        ...basePagination,
        ...updatedData?.pagination,
      },
    };
  }

  public static createCertificationPaginationResponse(
    certifications: Certification[],
    updatedData?: Partial<PaginationResponse<CertificationResponse>>
  ): PaginationResponse<CertificationResponse> {
    const certificationResponses = certifications.map((cert) => ({
      id: cert.getId().toString(),
      name: cert.getName(),
      issuer: cert.getIssuer(),
      imageURL: cert.getImageURL(),
      certType: cert.getCertType(),
      specializations: cert.getSpecializations(),
    }));

    return this.createPaginationResponse(certificationResponses, updatedData);
  }

  public static createMultipleCertifications(count: number): Certification[] {
    const certifications: Certification[] = [];

    for (let i = 1; i <= count; i++) {
      const certification = Certification.builder()
        .setId(new Types.ObjectId())
        .setName(`Certification ${i}`)
        .setIssuer(`Issuer ${i}`)
        .setImageURL(`https://example.com/cert-${i}.jpg`)
        .setCertType(`Type ${i}`)
        .setSpecializations([`Specialization ${i}`, `Specialization ${i + 1}`])
        .build();

      certifications.push(certification);
    }

    return certifications;
  }

  public static createCertificationResponses(
    certifications: Certification[]
  ): CertificationResponse[] {
    return certifications.map((cert) => ({
      id: cert.getId().toString(),
      name: cert.getName(),
      issuer: cert.getIssuer(),
      imageURL: cert.getImageURL(),
      certType: cert.getCertType(),
      specializations: cert.getSpecializations(),
    }));
  }

  public static createSearchTerm(updatedData?: string): string {
    return updatedData || "personal trainer";
  }
}
