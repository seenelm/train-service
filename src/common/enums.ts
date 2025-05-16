export enum ProfileAccess {
  Public = 1,
  Private = 2,
}

export enum EventStatus {
  Pending = 1,
  Accepted = 2,
  Rejected = 3,
}

export enum ProgramDifficulty {
  Beginner = "Beginner",
  Intermediate = "Intermediate",
  Advanced = "Advanced",
}

export enum MongoServerErrorType {
  ValidationError = "ValidationError",
  CastError = "CastError",
  DocumentNotFoundError = "DocumentNotFoundError",
  DuplicateKeyError = "DuplicateKeyError",
  MongoServerError = "MongoServerError",
}

export enum ValidateRegisterUser {
  PasswordRequired = "Password is required",
  EmailRequired = "Email is required",
  NameRequired = "Name is required",
  DeviceIdRequired = "Device ID is required",
  EmailAndPasswordRequired = "Email and password are required",
}

export enum RegisterUserAPIError {
  UserAlreadyExists = "User already exists",
}

export enum ValidateLoginUser {
  PasswordRequired = "Password is required",
  EmailRequired = "Email is required",
  DeviceIdRequired = "Device ID is required",
}
export enum LoginUserAPIError {
  UserNotFound = "User not found",
  UserProfileNotFound = "User Profile not found",
  InvalidPassword = "Invalid password",
}

export enum GoogleAuthAPIError {
  UserAlreadyExists = "Account with this email/username already exists but not linked to this authentication provider",
}

export enum APIErrorType {
  UserNotFound = "User not found",
  UserProfileNotFound = "User profile not found",
}

export enum AuthErrorType {
  InvalidCredentials = "Invalid credentials",
  UserProfileNotFound = "User profile not found",
  InvalidPassword = "Invalid password",
  UserAlreadyExists = "User already exists",
  UserNotActive = "User is not active",
  InvalidRefreshToken = "Invalid refresh token",
  RefreshTokenExpired = "Refresh token expired",
  TokenNotFound = "Token not found",
  TokenAlreadyExists = "Token already exists",
}

export enum ValidateRefreshTokens {
  RefreshTokenRequired = "Refresh token is required",
  DeviceIdRequired = "Device ID is required",
}

export enum ValidateLogout {
  RefreshTokenRequired = "Refresh token is required",
  DeviceIdRequired = "Device ID is required",
}
