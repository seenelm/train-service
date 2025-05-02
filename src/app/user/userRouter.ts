import express from "express";
const userRouter = express.Router();

import UserService from "./UserService.js";
import UserRepository from "../../infrastructure/database/repositories/user/UserRepository.js";
import UserProfileRepository from "../../infrastructure/database/repositories/user/UserProfileRepository.js";
import UserGroupsRepository from "../../infrastructure/database/repositories/user/UserGroupsRepository.js";
import FollowRepository from "../../infrastructure/database/repositories/user/FollowRepository.js";
import { UserModel } from "../../infrastructure/database/models/user/userModel.js";
import { UserProfileModel } from "../../infrastructure/database/models/user/userProfileModel.js";
import { UserGroupsModel } from "../../infrastructure/database/models/user/userGroupsModel.js";
import { FollowModel } from "../../infrastructure/database/models/user/followModel.js";
import UserController from "./UserController.js";
import { verifyFirebaseToken } from "../../common/middleware/verifyFirebaseToken";

const userService = new UserService(
  new UserRepository(UserModel),
  new UserProfileRepository(UserProfileModel),
  new UserGroupsRepository(UserGroupsModel),
  new FollowRepository(FollowModel)
);

const userController = new UserController(userService);

userRouter.post("/register", validateRegistration, userController.register);

userRouter.post("/login", validateLogin, userController.login);

userRouter.post("/google-auth", verifyFirebaseToken, userController.googleAuth);

// userRouter.get("/:userId", authenticate, userController.findUserById);

// userRouter.get("/:userId/profile-data", authenticate, userController.fetchUserData);

// userRouter.delete("/:userId", authenticate, userController.deleteUserAccount);

export default userRouter;
