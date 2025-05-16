import { Router } from "express";
import UserService from "../app/user/UserService.js";
import UserRepository from "../infrastructure/database/repositories/user/UserRepository.js";
import UserProfileRepository from "../infrastructure/database/repositories/user/UserProfileRepository.js";
import UserGroupsRepository from "../infrastructure/database/repositories/user/UserGroupsRepository.js";
import FollowRepository from "../infrastructure/database/repositories/user/FollowRepository.js";
import { UserModel } from "../infrastructure/database/models/user/userModel.js";
import { UserProfileModel } from "../infrastructure/database/models/user/userProfileModel.js";
import { UserGroupsModel } from "../infrastructure/database/models/user/userGroupsModel.js";
import { FollowModel } from "../infrastructure/database/models/user/followModel.js";
import UserController from "../app/user/UserController.js";
import { verifyFirebaseToken } from "../common/middleware/verifyFirebaseToken.js";
import UserMiddleware from "../app/user/UserMiddleware.js";
const router = Router();

const userMiddleware = new UserMiddleware();

const userService = new UserService(
  new UserRepository(UserModel),
  new UserProfileRepository(UserProfileModel),
  new UserGroupsRepository(UserGroupsModel),
  new FollowRepository(FollowModel)
);

const userController = new UserController(userService);

router.post(
  "/register",
  userMiddleware.validateRegisterUser,
  userController.register
);

router.post("/login", userMiddleware.validateLoginUser, userController.login);

router.post("/google-auth", verifyFirebaseToken, userController.googleAuth);

router.post("/refresh", userController.refreshTokens);

router.post("/logout", userController.logout);

export default router;
