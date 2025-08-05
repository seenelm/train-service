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

export enum ValidateGoogleAuth {
  DeviceIdRequired = "Device ID is required",
}

export enum ValidatePasswordReset {
  EmailRequired = "Email is required",
  ResetCodeRequired = "Reset code is required",
  NewPasswordRequired = "New password is required",
}

export enum ErrorCode {
  // Generic errors (1000-1999)
  VALIDATION_ERROR = "VALIDATION_ERROR",
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR",
  NOT_FOUND = "NOT_FOUND",
  CONFLICT = "CONFLICT",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",

  // Database errors (2000-2999)
  DATABASE_CONNECTION_ERROR = "DATABASE_CONNECTION_ERROR",
  DATABASE_QUERY_ERROR = "DATABASE_QUERY_ERROR",
  DATABASE_CONSTRAINT_VIOLATION = "DATABASE_CONSTRAINT_VIOLATION",

  // User-related errors (3000-3999)
  USER_NOT_FOUND = "USER_NOT_FOUND",
  USER_ALREADY_EXISTS = "USER_ALREADY_EXISTS",
  INVALID_USER_CREDENTIALS = "INVALID_USER_CREDENTIALS",
  USER_ACCOUNT_DISABLED = "USER_ACCOUNT_DISABLED",

  // User Profile errors (4000-4999)
  USER_PROFILE_NOT_FOUND = "USER_PROFILE_NOT_FOUND",
  CUSTOM_SECTION_ALREADY_EXISTS = "CUSTOM_SECTION_ALREADY_EXISTS",
  CUSTOM_SECTION_NOT_FOUND = "CUSTOM_SECTION_NOT_FOUND",
  INVALID_CUSTOM_SECTION_FORMAT = "INVALID_CUSTOM_SECTION_FORMAT",

  // Authentication errors (5000-5999)
  INVALID_TOKEN = "INVALID_TOKEN",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",

  // External service errors (6000-6999)
  EXTERNAL_SERVICE_UNAVAILABLE = "EXTERNAL_SERVICE_UNAVAILABLE",
  EXTERNAL_SERVICE_TIMEOUT = "EXTERNAL_SERVICE_TIMEOUT",
  EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR",
}

export enum ErrorMessage {
  // Generic messages
  VALIDATION_ERROR = "Validation failed",
  AUTHENTICATION_ERROR = "Authentication required",
  AUTHORIZATION_ERROR = "Insufficient permissions",
  NOT_FOUND = "Resource not found",
  CONFLICT = "Resource conflict",
  RATE_LIMIT_EXCEEDED = "Rate limit exceeded",
  INTERNAL_SERVER_ERROR = "Internal server error",
  SERVICE_UNAVAILABLE = "Service temporarily unavailable",

  // Database messages
  DATABASE_CONNECTION_ERROR = "Database connection failed",
  DATABASE_QUERY_ERROR = "Database query failed",
  DATABASE_CONSTRAINT_VIOLATION = "Database constraint violation",

  // User messages
  USER_NOT_FOUND = "User not found",
  USER_ALREADY_EXISTS = "User already exists",
  INVALID_USER_CREDENTIALS = "Invalid credentials",
  USER_ACCOUNT_DISABLED = "User account is disabled",

  // User Profile messages
  USER_PROFILE_NOT_FOUND = "User profile not found",
  CUSTOM_SECTION_ALREADY_EXISTS = "Custom section already exists",
  CUSTOM_SECTION_NOT_FOUND = "Custom section not found",
  INVALID_CUSTOM_SECTION_FORMAT = "Invalid custom section format",
  FOLLOWER_NOT_FOUND = "Follower not found",
  FOLLOWEE_NOT_FOUND = "User to follow not found",
  ALREADY_FOLLOWING = "Already following this user",
  CANNOT_FOLLOW_SELF = "Cannot follow yourself",
  PRIVATE_ACCOUNT_FOLLOW_REQUEST = "Cannot follow private account directly",
  FOLLOW_REQUEST_ALREADY_SENT = "Follow request already sent",
  FOLLOW_REQUEST_NOT_FOUND = "Follow request not found",
  NOT_CURRENTLY_FOLLOWING = "Not currently following this user",
  FOLLOWER_NOT_CURRENTLY_FOLLOWING = "Follower is not currently following this user",

  // Authentication messages
  INVALID_TOKEN = "Invalid authentication token",
  TOKEN_EXPIRED = "Authentication token expired",
  INSUFFICIENT_PERMISSIONS = "Insufficient permissions for this operation",

  // External service messages
  EXTERNAL_SERVICE_UNAVAILABLE = "External service unavailable",
  EXTERNAL_SERVICE_TIMEOUT = "External service timeout",
  EXTERNAL_SERVICE_ERROR = "External service error",

  // Search messages
  SEARCH_OPERATION_FAILED = "Search operation failed",
}

export enum ValidationErrorCode {
  // User validation (100-199)
  USER_ID_REQUIRED = "USER_ID_REQUIRED",
  USER_ID_INVALID_FORMAT = "USER_ID_INVALID_FORMAT",
  USERNAME_REQUIRED = "USERNAME_REQUIRED",
  USERNAME_INVALID_FORMAT = "USERNAME_INVALID_FORMAT",
  EMAIL_REQUIRED = "EMAIL_REQUIRED",
  EMAIL_INVALID_FORMAT = "EMAIL_INVALID_FORMAT",
  PASSWORD_REQUIRED = "PASSWORD_REQUIRED",
  PASSWORD_TOO_WEAK = "PASSWORD_TOO_WEAK",

  // User Profile validation (200-299)
  CUSTOM_SECTION_TITLE_REQUIRED = "CUSTOM_SECTION_TITLE_REQUIRED",
  CUSTOM_SECTION_TITLE_INVALID = "CUSTOM_SECTION_TITLE_INVALID",
  CUSTOM_SECTION_DETAILS_REQUIRED = "CUSTOM_SECTION_DETAILS_REQUIRED",
  CUSTOM_SECTION_DETAILS_INVALID = "CUSTOM_SECTION_DETAILS_INVALID",
  ACHIEVEMENT_ITEM_TITLE_REQUIRED = "ACHIEVEMENT_ITEM_TITLE_REQUIRED",
  ACHIEVEMENT_ITEM_DATE_INVALID = "ACHIEVEMENT_ITEM_DATE_INVALID",
  ACHIEVEMENT_ITEM_DESCRIPTION_INVALID = "ACHIEVEMENT_ITEM_DESCRIPTION_INVALID",
  GENERIC_ITEM_INVALID_FORMAT = "GENERIC_ITEM_INVALID_FORMAT",
}

export enum ValidationErrorMessage {
  USER_ID_REQUIRED = "User ID is required",
  USER_ID_INVALID_FORMAT = "Invalid user ID format",
  NAME_REQUIRED = "Name is required",
  ACCOUNT_TYPE_REQUIRED = "Account type is required",
  ACCOUNT_TYPE_INVALID = "Invalid account type. Must be 0 (Public) or 1 (Private)",
  USERNAME_REQUIRED = "Username is required",
  USERNAME_INVALID_FORMAT = "Username must be 3-20 characters and contain only letters, numbers, and underscores",
  EMAIL_REQUIRED = "Email is required",
  EMAIL_INVALID_FORMAT = "Invalid email format",
  PASSWORD_REQUIRED = "Password is required",
  PASSWORD_TOO_WEAK = "Password must be at least 8 characters with uppercase, lowercase, number, and special character",

  CUSTOM_SECTION_TITLE_REQUIRED = "Custom section title is required",
  CUSTOM_SECTION_TITLE_INVALID = "Invalid custom section title",
  CUSTOM_SECTION_DETAILS_REQUIRED = "Custom section details are required",
  CUSTOM_SECTION_DETAILS_INVALID = "Custom section details must be a non-empty array",
  ACHIEVEMENT_ITEM_TITLE_REQUIRED = "Achievement item title is required",
  ACHIEVEMENT_ITEM_DATE_INVALID = "Achievement item date must be a valid string",
  ACHIEVEMENT_ITEM_DESCRIPTION_INVALID = "Achievement item description must be a valid string",
  ACHIEVEMENT_ITEM_INVALID_FORMAT = "Achievement item must contain only string, number, boolean, or null values",
  GENERIC_ITEM_INVALID_FORMAT = "Generic item must contain only string, number, boolean, or null values",
  STATS_ITEM_INVALID_FORMAT = "Stats item has invalid format",
  STRING_ARRAY_ITEM_INVALID_FORMAT = "String array item has invalid format",

  // Search validation messages (PRODUCTION-GRADE GENERIC)
  SEARCH_TERM_REQUIRED = "Invalid search input",
  SEARCH_TERM_TOO_LONG = "Invalid search input",
  SEARCH_TERM_TOO_SHORT = "Invalid search input",
  SEARCH_TERM_INVALID_CHARACTERS = "Invalid search input",
  SEARCH_TERM_CONTAINS_INVALID_PATTERNS = "Invalid search input",
  SEARCH_TERM_CONTAINS_XSS_PATTERNS = "Invalid search input",
  SEARCH_TERM_NORMALIZATION_FAILED = "Invalid search input",
  PAGE_NUMBER_INVALID = "Invalid pagination parameter",
  LIMIT_INVALID = "Invalid pagination parameter",
}
