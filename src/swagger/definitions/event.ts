/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - startDate
 *         - endDate
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
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: Event start date and time
 *         endDate:
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
 *         - startDate
 *         - endDate
 *       properties:
 *         title:
 *           type: string
 *           description: Event title
 *         description:
 *           type: string
 *           description: Event description
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: Event start date and time
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: Event end date and time
 *         location:
 *           type: string
 *           description: Event location
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
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: Event start date and time
 *         endDate:
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
