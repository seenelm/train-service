/**
 * @swagger
 * components:
 *   schemas:
 *     Group:
 *       type: object
 *       required:
 *         - name
 *         - accountType
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the group
 *         name:
 *           type: string
 *           description: Group name
 *         description:
 *           type: string
 *           description: Group description
 *         location:
 *           type: string
 *           description: Group location
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of group tags
 *         accountType:
 *           type: number
 *           enum: [0, 1]
 *           description: Whether the group is public (0) or private (1)
 *           default: 0
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
 *     GroupRequest:
 *       type: object
 *       required:
 *         - name
 *         - accountType
 *       properties:
 *         name:
 *           type: string
 *           description: Group name
 *           example: "Fitness Enthusiasts"
 *         description:
 *           type: string
 *           description: Group description
 *           example: "A group for fitness enthusiasts to share tips and motivate each other"
 *         location:
 *           type: string
 *           description: Group location
 *           example: "New York, NY"
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of group tags
 *           example: ["fitness", "motivation", "health"]
 *         accountType:
 *           type: number
 *           enum: [1, 2]
 *           description: Whether the group is public (1) or private (2)
 *           default: 1
 *           example: 1
 *
 *     GroupResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Group ID
 *         name:
 *           type: string
 *           description: Group name
 *         description:
 *           type: string
 *           description: Group description
 *         location:
 *           type: string
 *           description: Group location
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of group tags
 *         owners:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of owner user IDs
 *         members:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of member user IDs
 *         requests:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of pending request user IDs
 *         accountType:
 *           type: number
 *           enum: [1, 2]
 *           description: Whether the group is public (1) or private (2)
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
