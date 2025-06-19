import { CustomSectionRequest, CustomSectionType } from "@seenelm/train-core";
import { NextFunction, Request, Response } from "express";
import { APIError } from "../../common/errors/APIError.js";

export default class UserProfileMiddleware {
  private static validateAchievementItem(item: any): boolean {
    return (
      typeof item === "object" &&
      typeof item.title === "string" &&
      (!item.date || typeof item.date === "string") &&
      (!item.description || typeof item.description === "string")
    );
  }

  private static validateGenericItem(item: any): boolean {
    return (
      typeof item === "object" &&
      Object.values(item).every(
        (value) =>
          typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "boolean" ||
          value === null
      )
    );
  }

  private static validateCustomSection(section: CustomSectionRequest): boolean {
    if (!section.title || !Array.isArray(section.details)) {
      return false;
    }

    switch (section.title) {
      case CustomSectionType.ACHIEVEMENTS:
        return section.details.every(this.validateAchievementItem);

      case CustomSectionType.IDENTITY:
      case CustomSectionType.SPECIALIZATION:
      case CustomSectionType.PHILOSOPHY:
      case CustomSectionType.GOALS:
      case CustomSectionType.STATS:
        return section.details.every(this.validateGenericItem);

      default:
        return false;
    }
  }

  public static validateUpdateRequest = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { customSections } = req.body;

      if (customSections) {
        if (!Array.isArray(customSections)) {
          throw APIError.BadRequest("Custom sections must be an array");
        }

        const invalidSections = customSections.filter(
          (section) => !this.validateCustomSection(section)
        );

        if (invalidSections.length > 0) {
          throw APIError.BadRequest(
            `Invalid custom section format: ${JSON.stringify(
              invalidSections[0]
            )}`
          );
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
