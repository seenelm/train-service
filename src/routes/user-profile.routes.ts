import { Router } from "express";
import UserProfileController from "../app/userProfile/UserProfileController.js";
import UserProfileService from "../app/userProfile/UserProfileService.js";
import UserProfileRepository from "../infrastructure/database/repositories/user/UserProfileRepository.js";
import UserRepository from "../infrastructure/database/repositories/user/UserRepository.js";
import FollowRepository from "../infrastructure/database/repositories/user/FollowRepository.js";
import { UserProfileModel } from "../infrastructure/database/models/userProfile/userProfileModel.js";
import { UserModel } from "../infrastructure/database/models/user/userModel.js";
import { FollowModel } from "../infrastructure/database/models/user/followModel.js";
import UserProfileMiddleware from "../app/userProfile/UserProfileMiddleware.js";
import FollowMiddleware from "../app/userProfile/FollowMiddleware.js";
import { AuthMiddleware } from "../common/middleware/AuthMiddleware.js";

const router = Router();

const authMiddleware = new AuthMiddleware(new UserRepository(UserModel));

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
router.patch(
  "/:userId/basic-info",
  UserProfileMiddleware.validateBasicProfileUpdate,
  userProfileController.updateBasicUserProfile
);
router.put(
  "/:followeeId/follow",
  authMiddleware.authenticateToken,
  UserProfileMiddleware.validateFollowUser,
  FollowMiddleware.checkAccountIsPublic,
  userProfileController.followUser
);

router.post(
  "/:followeeId/follow-request",
  authMiddleware.authenticateToken,
  UserProfileMiddleware.validateRequestToFollowUser,
  FollowMiddleware.checkAccountIsPrivate,
  userProfileController.requestToFollowUser
);

router.put(
  "/:followerId/accept-follow-request",
  authMiddleware.authenticateToken,
  UserProfileMiddleware.validateAcceptFollowRequest,
  userProfileController.acceptFollowRequest
);

router.delete(
  "/:followerId/reject-follow-request",
  authMiddleware.authenticateToken,
  UserProfileMiddleware.validateRejectFollowRequest,
  userProfileController.rejectFollowRequest
);

router.delete(
  "/:followeeId/unfollow",
  authMiddleware.authenticateToken,
  UserProfileMiddleware.validateUnfollowUser,
  userProfileController.unfollowUser
);

router.delete(
  "/:followerId/remove-follower",
  authMiddleware.authenticateToken,
  UserProfileMiddleware.validateRemoveFollower,
  userProfileController.removeFollower
);

export default router;
