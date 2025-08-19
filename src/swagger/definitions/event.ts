/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - startTime
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the event
 *         title:
 *           type: string
 *           description: Event title
 *         description:
 *           type: string
 *           description: Event description
 *         startTime:
 *           type: string
 *           format: date-time
 *           description: Event start date and time
 *         endTime:
 *           type: string
 *           format: date-time
 *           description: Event end date and time
 *         location:
 *           type: string
 *           description: Event location
 *         creatorId:
 *           type: string
 *           description: ID of the event creator
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the event was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the event was last updated
 *
 *     EventCreateRequest:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - startTime
 *         - admin
 *       properties:
 *         title:
 *           type: string
 *           description: Event title
 *         description:
 *           type: string
 *           description: Event description
 *         admin:
 *           type: array
 *           description: Array of admin user IDs
 *           items:
 *             type: string
 *           example: ["65750dbedc7f22a38934ae3d"]
 *         startTime:
 *           type: string
 *           format: date-time
 *           description: Event start date and time
 *         endTime:
 *           type: string
 *           format: date-time
 *           description: Event end date and time (optional)
 *         location:
 *           type: string
 *           description: Event location (optional)
 *
 *     EventUpdateRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Event title
 *         description:
 *           type: string
 *           description: Event description
 *         admin:
 *           type: array
 *           description: Array of admin user IDs
 *           items:
 *             type: string
 *         startTime:
 *           type: string
 *           format: date-time
 *           description: Event start date and time
 *         endTime:
 *           type: string
 *           format: date-time
 *           description: Event end date and time
 *         location:
 *           type: string
 *           description: Event location
 *
 *     UserEventStatus:
 *       type: object
 *       required:
 *         - eventId
 *         - status
 *       properties:
 *         eventId:
 *           type: string
 *           description: ID of the event
 *         status:
 *           type: string
 *           enum: [going, maybe, not_going]
 *           description: User's status for the event
 *
 *     UserEventResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the user event relationship
 *         userId:
 *           type: string
 *           description: ID of the user
 *         eventId:
 *           type: string
 *           description: ID of the event
 *         status:
 *           type: string
 *           enum: [accepted, pending, declined]
 *           description: User's status for the event
 *         event:
 *           $ref: '#/components/schemas/Event'
 *           description: The event details
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the user event was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the user event was last updated
 *
 *     EventResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *         event:
 *           $ref: '#/components/schemas/Event'
 */
