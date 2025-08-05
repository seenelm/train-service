import { Router } from "express";
import GroupController from "../app/group/GroupController.js";
import GroupService from "../app/group/GroupService.js";
import GroupRepository from "../infrastructure/database/repositories/group/GroupRepository.js";
import { GroupModel } from "../infrastructure/database/models/group/groupModel.js";
import GroupMiddleware from "../app/group/GroupMiddleware.js";
import GroupAuthorizationMiddleware from "../app/group/GroupAuthorizationMiddleware.js";
import { AuthMiddleware } from "../common/middleware/AuthMiddleware.js";
import UserRepository from "../infrastructure/database/repositories/user/UserRepository.js";
import { UserModel } from "../infrastructure/database/models/user/userModel.js";
import UserGroupsRepository from "../infrastructure/database/repositories/user/UserGroupsRepository.js";
import { UserGroupsModel } from "../infrastructure/database/models/user/userGroupsModel.js";

const router = Router();

// Initialize dependencies
const userRepository = new UserRepository(UserModel);
const authMiddleware = new AuthMiddleware(userRepository);
const groupRepository = new GroupRepository(GroupModel);
const userGroupsRepository = new UserGroupsRepository(UserGroupsModel);
const groupService = new GroupService(groupRepository, userGroupsRepository);
const groupController = new GroupController(groupService);

// Group routes
router.post(
  "/",
  authMiddleware.authenticateToken,
  GroupMiddleware.validateCreateGroup,
  groupController.addGroup
);

router.put(
  "/:groupId/join",
  authMiddleware.authenticateToken,
  GroupMiddleware.validateJoinGroup,
  GroupAuthorizationMiddleware.checkGroupIsPublic(groupRepository),
  groupController.joinGroup
);

router.put(
  "/:groupId/request-join",
  authMiddleware.authenticateToken,
  GroupMiddleware.validateRequestToJoinGroup,
  GroupAuthorizationMiddleware.checkGroupIsPrivate(groupRepository),
  groupController.requestToJoinGroup
);

router.put(
  "/:groupId/accept-request/:requesterId",
  authMiddleware.authenticateToken,
  GroupMiddleware.validateAcceptJoinRequest,
  GroupAuthorizationMiddleware.checkUserIsOwner(groupRepository),
  groupController.acceptJoinGroupRequest
);

router.delete(
  "/:groupId/reject-request/:requesterId",
  authMiddleware.authenticateToken,
  GroupMiddleware.validateRejectJoinGroupRequest,
  GroupAuthorizationMiddleware.checkUserIsOwner(groupRepository),
  groupController.rejectJoinGroupRequest
);

router.delete(
  "/:groupId/leave",
  authMiddleware.authenticateToken,
  GroupMiddleware.validateLeaveGroup,
  groupController.leaveGroup
);

router.delete(
  "/:groupId/members/:memberId",
  authMiddleware.authenticateToken,
  GroupMiddleware.validateRemoveMemberFromGroup,
  GroupAuthorizationMiddleware.checkUserIsOwner(groupRepository),
  groupController.removeMemberFromGroup
);

router.delete(
  "/:groupId",
  authMiddleware.authenticateToken,
  GroupMiddleware.validateDeleteGroup,
  GroupAuthorizationMiddleware.checkUserIsOwner(groupRepository),
  groupController.deleteGroup
);

export default router;
