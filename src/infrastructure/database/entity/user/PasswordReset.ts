import { Types } from "mongoose";

export default class PasswordReset {
  private id: Types.ObjectId;
  private userId: Types.ObjectId;
  private email: string;
  private code: string;
  private expiresAt: Date;
  private createdAt: Date;

  constructor(builder: PasswordResetBuilder) {
    this.id = builder.id;
    this.userId = builder.userId;
    this.email = builder.email;
    this.code = builder.code;
    this.expiresAt = builder.expiresAt;
    this.createdAt = builder.createdAt;
  }

  public static builder(): PasswordResetBuilder {
    return new PasswordResetBuilder();
  }

  public getId(): Types.ObjectId {
    return this.id;
  }

  public getUserId(): Types.ObjectId {
    return this.userId;
  }

  public getEmail(): string {
    return this.email;
  }

  public getCode(): string {
    return this.code;
  }

  public getExpiresAt(): Date {
    return this.expiresAt;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }
}

class PasswordResetBuilder {
  id: Types.ObjectId;
  userId: Types.ObjectId;
  email: string;
  code: string;
  expiresAt: Date;
  createdAt: Date;

  constructor() {
    this.id = new Types.ObjectId();
    this.userId = new Types.ObjectId();
    this.email = "";
    this.code = "";
    this.expiresAt = new Date();
    this.createdAt = new Date();
  }

  public setId(id: Types.ObjectId): this {
    this.id = id;
    return this;
  }

  public setUserId(userId: Types.ObjectId): this {
    this.userId = userId;
    return this;
  }

  public setEmail(email: string): this {
    this.email = email;
    return this;
  }

  public setCode(code: string): this {
    this.code = code;
    return this;
  }

  public setExpiresAt(expiresAt: Date): this {
    this.expiresAt = expiresAt;
    return this;
  }

  public setCreatedAt(createdAt: Date): this {
    this.createdAt = createdAt;
    return this;
  }

  public build(): PasswordReset {
    return new PasswordReset(this);
  }
}
