import { Router } from "express";
import UserProfileController from "../app/userProfile/UserProfileController.js";
import UserProfileService from "../app/userProfile/UserProfileService.js";
import UserProfileRepository from "../infrastructure/database/repositories/user/UserProfileRepository.js";
import FollowRepository from "../infrastructure/database/repositories/user/FollowRepository.js";
import { UserProfileModel } from "../infrastructure/database/models/user/userProfileModel.js";
import { FollowModel } from "../infrastructure/database/models/user/followModel.js";

const router = Router();

const userProfileController = new UserProfileController(
  new UserProfileService(
    new UserProfileRepository(UserProfileModel),
    new FollowRepository(FollowModel)
  )
);

router.put("/", userProfileController.updateUserProfile);

export default router;
