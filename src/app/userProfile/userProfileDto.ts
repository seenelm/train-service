export interface PaginationRequest {
  page: number;
  limit: number;
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface CertificationResponse {
  id: string;
  name: string;
  issuer: string;
  imageURL: string;
  certType: string;
  specializations: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CertificationRequest {
  name: string;
  issuer: string;
  imageURL: string;
  certType: string;
  specializations: string[];
}
