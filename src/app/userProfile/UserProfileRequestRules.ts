import { RuleSet } from "../../common/utils/requestValidation.js";
import { CustomSectionType, CustomSectionRequest } from "@seenelm/train-core";
import { Request } from "express";
import { Types } from "mongoose";
import { ValidationErrorMessage } from "../../common/enums.js";

export default class UserProfileRequestRules {
  public static getCustomSectionsRules: RuleSet<Request<{ userId: string }>> = {
    userId: {
      hasError: (req) => !req.params?.userId,
      message: ValidationErrorMessage.USER_ID_REQUIRED,
    },
    validUserId: {
      hasError: (req) => !Types.ObjectId.isValid(req.params?.userId),
      message: ValidationErrorMessage.USER_ID_INVALID_FORMAT,
    },
  };

  public static customSectionRules: RuleSet<
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
    statsItems: {
      hasError: (req) => {
        if (
          !Array.isArray(req.body.details) ||
          req.body.title !== CustomSectionType.STATS
        )
          return false;

        return req.body.details.some(
          (item: any) =>
            !item ||
            typeof item !== "object" ||
            typeof item.category !== "string" ||
            typeof item.value !== "string"
        );
      },
      message: ValidationErrorMessage.STATS_ITEM_INVALID_FORMAT,
    },
    sectionTitle: {
      hasError: (req) =>
        !req.body.title ||
        !Object.values(CustomSectionType).includes(req.body.title),
      message: ValidationErrorMessage.CUSTOM_SECTION_TITLE_INVALID,
    },
    sectionDetails: {
      hasError: (req) =>
        !req.body.details ||
        !Array.isArray(req.body.details) ||
        req.body.details.length === 0,
      message: ValidationErrorMessage.CUSTOM_SECTION_DETAILS_INVALID,
    },
    stringArrayItems: {
      hasError: (req) => {
        if (
          !Array.isArray(req.body.details) ||
          req.body.title === CustomSectionType.ACHIEVEMENTS ||
          req.body.title === CustomSectionType.STATS
        )
          return false;

        return req.body.details.some((item: any) => typeof item !== "string");
      },
      message: ValidationErrorMessage.STRING_ARRAY_ITEM_INVALID_FORMAT,
    },
    achievementItems: {
      hasError: (req) => {
        if (
          !Array.isArray(req.body.details) ||
          req.body.title !== CustomSectionType.ACHIEVEMENTS
        )
          return false;

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
  };

  public static deleteCustomSectionRules: RuleSet<
    Request<{ userId: string; sectionTitle: string }>
  > = {
    userId: {
      hasError: (req) => !req.params?.userId,
      message: ValidationErrorMessage.USER_ID_REQUIRED,
    },
    validUserId: {
      hasError: (req) => !Types.ObjectId.isValid(req.params?.userId),
      message: ValidationErrorMessage.USER_ID_INVALID_FORMAT,
    },
    sectionTitle: {
      hasError: (req) => !req.params?.sectionTitle,
      message: ValidationErrorMessage.CUSTOM_SECTION_TITLE_REQUIRED,
    },
    validSectionTitle: {
      hasError: (req) =>
        !req.params?.sectionTitle ||
        !Object.values(CustomSectionType).includes(
          req.params.sectionTitle as CustomSectionType
        ),
      message: ValidationErrorMessage.CUSTOM_SECTION_TITLE_INVALID,
    },
  };
}
