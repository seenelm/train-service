import { RuleSet } from "../../common/utils/requestValidation.js";
import { CustomSectionType, CustomSectionRequest } from "@seenelm/train-core";
import { Request } from "express";
import { Types } from "mongoose";
import { ValidationErrorMessage } from "../../common/enums.js";

export default class UserProfileRequestRules {
  public static createCustomSectionRules: RuleSet<
    Request<{ userId: string }, {}, CustomSectionRequest>
  > = {
    userId: {
      hasError: (req) => !req.params.userId,  
      message: ValidationErrorMessage.USER_ID_REQUIRED,
    },
    validUserId: {
      hasError: (req) => !Types.ObjectId.isValid(req.params.userId),
      message: ValidationErrorMessage.USER_ID_INVALID_FORMAT,
    },
    sectionTitle: {
      hasError: (req) =>
        !req.body.title ||
        !Object.values(CustomSectionType).includes(req.body.title),
      message: ValidationErrorMessage.CUSTOM_SECTION_TITLE_INVALID,
    },
    sectionDetails: {
      hasError: (req) =>
        !Array.isArray(req.body.details) || req.body.details.length === 0,
      message: ValidationErrorMessage.CUSTOM_SECTION_DETAILS_INVALID,
    },
    achievementItems: {
      hasError: (req) => {
        if (!Array.isArray(req.body.details) || req.body.title !== CustomSectionType.ACHIEVEMENTS) return false;
        
        return req.body.details.some(
          (item: any) =>
            !item ||
            typeof item !== "object" ||
            typeof item.title !== "string" ||
            (item.date !== undefined && typeof item.date !== "string") ||
            (item.description !== undefined &&
              typeof item.description !== "string")
        );
      },
      message: ValidationErrorMessage.ACHIEVEMENT_ITEM_INVALID_FORMAT,
    },
    genericItems: {
      hasError: (req) => {
        if (!Array.isArray(req.body.details) || req.body.title === CustomSectionType.ACHIEVEMENTS) return false;
        
        return req.body.details.some(
          (item: any) =>
            !item ||
            typeof item !== "object" ||
            !Object.values(item).every(
              (value) =>
                typeof value === "string" ||
                typeof value === "number" ||
                typeof value === "boolean" ||
                value === null
            )
        );
      },
      message: ValidationErrorMessage.GENERIC_ITEM_INVALID_FORMAT,
    },
  };

  public static updateCustomSectionRules: RuleSet<any> = {
    userId: {
      hasError: (req) => !req.params?.userId,
      message: "User ID is required",
    },
    validUserId: {
      hasError: (req) => {
        const userId = req.params?.userId;
        return userId && !/^[0-9a-fA-F]{24}$/.test(userId);
      },
      message: "Invalid user ID format",
    },
    sectionBody: {
      hasError: (req) => !req.body || typeof req.body !== "object",
      message: "Request body is required and must be an object",
    },
    sectionTitle: {
      hasError: (req) =>
        !req.body?.title ||
        !Object.values(CustomSectionType).includes(req.body.title),
      message: "Invalid custom section format",
    },
    sectionDetails: {
      hasError: (req) =>
        !Array.isArray(req.body?.details) || req.body.details.length === 0,
      message: "Invalid custom section format",
    },
    achievementItems: {
      hasError: (req) => {
        if (!Array.isArray(req.body?.details) || req.body?.title !== CustomSectionType.ACHIEVEMENTS) return false;
        
        return req.body.details?.some(
          (item: any) =>
            !item ||
            typeof item !== "object" ||
            typeof item.title !== "string" ||
            (item.date !== undefined && typeof item.date !== "string") ||
            (item.description !== undefined &&
              typeof item.description !== "string")
        );
      },
      message: "Invalid achievement item format",
    },
    genericItems: {
      hasError: (req) => {
        if (!Array.isArray(req.body?.details) || req.body?.title === CustomSectionType.ACHIEVEMENTS) return false;
        
        return req.body.details?.some(
          (item: any) =>
            !item ||
            typeof item !== "object" ||
            !Object.values(item).every(
              (value) =>
                typeof value === "string" ||
                typeof value === "number" ||
                typeof value === "boolean" ||
                value === null
            )
        );
      },
      message: "Invalid generic item format",
    },
  };
}
