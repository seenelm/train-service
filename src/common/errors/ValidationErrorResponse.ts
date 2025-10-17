import { z } from "zod";

export class ValidationErrorResponse {
  constructor(public readonly field: string, public readonly message: string) {}

  toJSON() {
    return {
      field: this.field,
      message: this.message,
    };
  }

  static fromZodError(error: z.ZodError): ValidationErrorResponse[] {
    return error.issues.map(
      (issue) =>
        new ValidationErrorResponse(issue.path[0] as string, issue.message)
    );
  }
}
