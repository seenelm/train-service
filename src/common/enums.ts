export enum ProfileAccess {
  Public = 1,
  Private = 2,
}

export enum MongoServerErrorType {
  ValidationError = 'VALIDATION_ERROR',
  CastError = 'CAST_ERROR',
  DocumentNotFoundError = 'DOCUMENT_NOT_FOUND',
  DuplicateKeyError = 'DUPLICATE_KEY_ERROR',
  MongoServerError = 'MONGO_SERVER_ERROR'
}
