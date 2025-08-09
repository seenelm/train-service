import { Types } from "mongoose";

export default class Certification {
  private id: Types.ObjectId;
  private name: string;
  private issuer: string;
  private imageURL: string;
  private certType: string;
  private specializations: string[];
  private createdAt?: Date;
  private updatedAt?: Date;

  constructor(builder: CertificationBuilder) {
    this.id = builder.id;
    this.name = builder.name;
    this.issuer = builder.issuer;
    this.imageURL = builder.imageURL;
    this.certType = builder.certType;
    this.specializations = builder.specializations;
    this.createdAt = builder.createdAt;
    this.updatedAt = builder.updatedAt;
  }

  // Getters
  public getId(): Types.ObjectId {
    return this.id;
  }
  public getName(): string {
    return this.name;
  }
  public getIssuer(): string {
    return this.issuer;
  }
  public getImageURL(): string {
    return this.imageURL;
  }
  public getCertType(): string {
    return this.certType;
  }
  public getSpecializations(): string[] {
    return this.specializations;
  }
  public getCreatedAt(): Date | undefined {
    return this.createdAt;
  }
  public getUpdatedAt(): Date | undefined {
    return this.updatedAt;
  }

  static builder(): CertificationBuilder {
    return new CertificationBuilder();
  }
}

export class CertificationBuilder {
  id: Types.ObjectId = new Types.ObjectId();
  name: string = "";
  issuer: string = "";
  imageURL: string = "";
  certType: string = "";
  specializations: string[] = [];
  createdAt?: Date;
  updatedAt?: Date;

  public setId(id: Types.ObjectId): this {
    this.id = id;
    return this;
  }

  public setName(name: string): this {
    this.name = name;
    return this;
  }

  public setIssuer(issuer: string): this {
    this.issuer = issuer;
    return this;
  }

  public setImageURL(imageURL: string): this {
    this.imageURL = imageURL;
    return this;
  }

  public setCertType(certType: string): this {
    this.certType = certType;
    return this;
  }

  public setSpecializations(specializations: string[]): this {
    this.specializations = specializations;
    return this;
  }

  public setCreatedAt(createdAt?: Date): this {
    this.createdAt = createdAt;
    return this;
  }

  public setUpdatedAt(updatedAt?: Date): this {
    this.updatedAt = updatedAt;
    return this;
  }

  public build(): Certification {
    return new Certification(this);
  }
}
