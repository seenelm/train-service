import { Router } from "express";
import UserProfileController from "../app/userProfile/UserProfileController.js";
import UserProfileService from "../app/userProfile/UserProfileService.js";
import UserProfileRepository from "../infrastructure/database/repositories/user/UserProfileRepository.js";
import FollowRepository from "../infrastructure/database/repositories/user/FollowRepository.js";
import { UserProfileModel } from "../infrastructure/database/models/userProfile/userProfileModel.js";
import { FollowModel } from "../infrastructure/database/models/user/followModel.js";
import UserProfileMiddleware from "../app/userProfile/UserProfileMiddleware.js";

const router = Router();

const userProfileController = new UserProfileController(
  new UserProfileService(
    new UserProfileRepository(UserProfileModel),
    new FollowRepository(FollowModel)
  )
);

router.put("/", userProfileController.updateUserProfile);

router.post(
  "/:userId/custom-section",
  UserProfileMiddleware.validateCreateCustomSection,
  userProfileController.createCustomSection
);
router.get(
  "/:userId/custom-sections",
  UserProfileMiddleware.validateGetCustomSections,
  userProfileController.getCustomSections
);
router.delete(
  "/:userId/custom-section/:sectionTitle",
  UserProfileMiddleware.validateDeleteCustomSection,
  userProfileController.deleteCustomSection
);
router.patch(
  "/:userId/custom-section",
  UserProfileMiddleware.validateUpdateCustomSection,
  userProfileController.updateCustomSection
);

export default router;
