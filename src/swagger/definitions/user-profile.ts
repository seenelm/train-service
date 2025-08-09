/**
 * @swagger
 * components:
 *   schemas:
 *     UserProfile:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           description: User ID associated with this profile
 *         bio:
 *           type: string
 *           description: User's biography
 *         profilePicture:
 *           type: string
 *           description: URL to user's profile picture
 *         customSections:
 *           type: array
 *           description: Custom sections in the user profile
 *           items:
 *             $ref: '#/components/schemas/CustomSection'
 *         isPrivate:
 *           type: boolean
 *           description: Whether the profile is private
 *           default: false
 *
 *     CustomSection:
 *       type: object
 *       required:
 *         - title
 *         - content
 *       properties:
 *         title:
 *           type: string
 *           description: Title of the custom section
 *         content:
 *           type: string
 *           description: Content of the custom section
 *
 *     BasicProfileUpdate:
 *       type: object
 *       properties:
 *         bio:
 *           type: string
 *           description: User's biography
 *         profilePicture:
 *           type: string
 *           description: URL to user's profile picture
 *         isPrivate:
 *           type: boolean
 *           description: Whether the profile is private
 *
 *     FollowRequest:
 *       type: object
 *       properties:
 *         followerId:
 *           type: string
 *           description: ID of the user making the follow request
 *         followeeId:
 *           type: string
 *           description: ID of the user receiving the follow request
 *
 *     FollowResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Whether the follow operation was successful
 *         message:
 *           type: string
 *           description: Success or error message
 *         followId:
 *           type: string
 *           description: ID of the follow relationship
 */
