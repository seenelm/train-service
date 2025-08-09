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

/**
 * @swagger
 * tags:
 *   name: Groups
 *   description: Group management and membership operations
 */

const router = Router();

// Initialize dependencies
const userRepository = new UserRepository(UserModel);
const authMiddleware = new AuthMiddleware(userRepository);
const groupRepository = new GroupRepository(GroupModel);
const userGroupsRepository = new UserGroupsRepository(UserGroupsModel);
const groupService = new GroupService(groupRepository, userGroupsRepository);
const groupController = new GroupController(groupService);

// Group routes
/**
 * @swagger
 * /group:
 *   post:
 *     summary: Create a new group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GroupCreateRequest'
 *     responses:
 *       201:
 *         description: Group created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GroupResponse'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/",
  authMiddleware.authenticateToken,
  GroupMiddleware.validateCreateGroup,
  groupController.addGroup
);

/**
 * @swagger
 * /group/{groupId}/join:
 *   put:
 *     summary: Join a public group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the group to join
 *     responses:
 *       200:
 *         description: Successfully joined the group
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GroupMembershipResponse'
 *       400:
 *         description: Invalid request or already a member
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Cannot directly join a private group
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Group not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  "/:groupId/join",
  authMiddleware.authenticateToken,
  GroupMiddleware.validateJoinGroup,
  GroupAuthorizationMiddleware.checkGroupIsPublic(groupRepository),
  groupController.joinGroup
);

/**
 * @swagger
 * /group/{groupId}/request-join:
 *   put:
 *     summary: Request to join a private group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the private group to request to join
 *     responses:
 *       200:
 *         description: Join request sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Join request sent successfully
 *                 requestId:
 *                   type: string
 *                   description: ID of the join request
 *       400:
 *         description: Invalid request or request already sent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Cannot request to join a public group
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Group not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  "/:groupId/request-join",
  authMiddleware.authenticateToken,
  GroupMiddleware.validateRequestToJoinGroup,
  GroupAuthorizationMiddleware.checkGroupIsPrivate(groupRepository),
  groupController.requestToJoinGroup
);

/**
 * @swagger
 * /group/{groupId}/accept-request/{requesterId}:
 *   put:
 *     summary: Accept a request to join the group (owner only)
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the group
 *       - in: path
 *         name: requesterId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user who requested to join
 *     responses:
 *       200:
 *         description: Join request accepted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GroupMembershipResponse'
 *       400:
 *         description: Invalid request or no pending request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Not authorized to accept requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Group or request not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  "/:groupId/accept-request/:requesterId",
  authMiddleware.authenticateToken,
  GroupMiddleware.validateAcceptJoinRequest,
  GroupAuthorizationMiddleware.checkUserIsOwner(groupRepository),
  groupController.acceptJoinGroupRequest
);

/**
 * @swagger
 * /group/{groupId}/reject-request/{requesterId}:
 *   delete:
 *     summary: Reject a request to join the group (owner only)
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the group
 *       - in: path
 *         name: requesterId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user who requested to join
 *     responses:
 *       200:
 *         description: Join request rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Join request rejected successfully
 *       400:
 *         description: Invalid request or no pending request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Not authorized to reject requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Group or request not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  "/:groupId/reject-request/:requesterId",
  authMiddleware.authenticateToken,
  GroupMiddleware.validateRejectJoinGroupRequest,
  GroupAuthorizationMiddleware.checkUserIsOwner(groupRepository),
  groupController.rejectJoinGroupRequest
);

/**
 * @swagger
 * /group/{groupId}/leave:
 *   delete:
 *     summary: Leave a group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the group to leave
 *     responses:
 *       200:
 *         description: Successfully left the group
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Successfully left the group
 *       400:
 *         description: Invalid request or not a member
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Group owner cannot leave (must delete or transfer ownership)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Group not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  "/:groupId/leave",
  authMiddleware.authenticateToken,
  GroupMiddleware.validateLeaveGroup,
  groupController.leaveGroup
);

/**
 * @swagger
 * /group/{groupId}/members/{memberId}:
 *   delete:
 *     summary: Remove a member from the group (owner only)
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the group
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the member to remove
 *     responses:
 *       200:
 *         description: Member removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Member removed successfully
 *       400:
 *         description: Invalid request or not a member
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Not authorized to remove members
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Group or member not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  "/:groupId/members/:memberId",
  authMiddleware.authenticateToken,
  GroupMiddleware.validateRemoveMemberFromGroup,
  GroupAuthorizationMiddleware.checkUserIsOwner(groupRepository),
  groupController.removeMemberFromGroup
);

/**
 * @swagger
 * /group/{groupId}:
 *   delete:
 *     summary: Delete a group (owner only)
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the group to delete
 *     responses:
 *       200:
 *         description: Group deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Group deleted successfully
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Not authorized to delete group
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Group not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  "/:groupId",
  authMiddleware.authenticateToken,
  GroupMiddleware.validateDeleteGroup,
  GroupAuthorizationMiddleware.checkUserIsOwner(groupRepository),
  groupController.deleteGroup
);



/**
 * @swagger
 * /group/{groupId}/profile:
 *   put:
 *     summary: Update group profile (owner only)
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the group to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GroupUpdateRequest'
 *     responses:
 *       200:
 *         description: Group profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GroupResponse'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Not authorized to update group
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Group not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  "/:groupId/profile",
  authMiddleware.authenticateToken,
  GroupMiddleware.validateUpdateGroupProfile,
  GroupAuthorizationMiddleware.checkUserIsOwner(groupRepository),
  groupController.updateGroupProfile
);

export default router;
