/**
 * @swagger
 * components:
 *   schemas:
 *     Group:
 *       type: object
 *       required:
 *         - groupName
 *         - description
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the group
 *         groupName:
 *           type: string
 *           description: Group name
 *         description:
 *           type: string
 *           description: Group description
 *         profilePicture:
 *           type: string
 *           description: URL to group's profile picture
 *         isPrivate:
 *           type: boolean
 *           description: Whether the group is private
 *           default: false
 *         ownerId:
 *           type: string
 *           description: ID of the group owner
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the group was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the group was last updated
 *
 *     GroupCreateRequest:
 *       type: object
 *       required:
 *         - groupName
 *         - description
 *       properties:
 *         groupName:
 *           type: string
 *           description: Group name
 *         description:
 *           type: string
 *           description: Group description
 *         profilePicture:
 *           type: string
 *           description: URL to group's profile picture
 *         isPrivate:
 *           type: boolean
 *           description: Whether the group is private
 *           default: false
 *
 *     GroupUpdateRequest:
 *       type: object
 *       properties:
 *         groupName:
 *           type: string
 *           description: Group name
 *         description:
 *           type: string
 *           description: Group description
 *         profilePicture:
 *           type: string
 *           description: URL to group's profile picture
 *         isPrivate:
 *           type: boolean
 *           description: Whether the group is private
 *
 *     GroupResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *         group:
 *           $ref: '#/components/schemas/Group'
 *
 *     GroupMembershipResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *         groupId:
 *           type: string
 *           description: ID of the group
 *         userId:
 *           type: string
 *           description: ID of the user
 *         role:
 *           type: string
 *           enum: [owner, member]
 *           description: Role of the user in the group
 */
