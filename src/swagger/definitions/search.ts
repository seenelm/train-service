/**
 * @swagger
 * components:
 *   schemas:
 *     SearchCertificationsQuery:
 *       type: object
 *       properties:
 *         query:
 *           type: string
 *           description: Search query string
 *         page:
 *           type: integer
 *           description: Page number for pagination
 *           default: 1
 *         limit:
 *           type: integer
 *           description: Number of results per page
 *           default: 10
 *
 *     SearchProfilesQuery:
 *       type: object
 *       properties:
 *         query:
 *           type: string
 *           description: Search query string
 *         page:
 *           type: integer
 *           description: Page number for pagination
 *           default: 1
 *         limit:
 *           type: integer
 *           description: Number of results per page
 *           default: 10
 *
 *     Certification:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the certification
 *         name:
 *           type: string
 *           description: Certification name
 *         organization:
 *           type: string
 *           description: Organization that issued the certification
 *         issueDate:
 *           type: string
 *           format: date
 *           description: Date when the certification was issued
 *         expiryDate:
 *           type: string
 *           format: date
 *           description: Date when the certification expires
 *         credentialId:
 *           type: string
 *           description: Unique credential ID for the certification
 *         credentialUrl:
 *           type: string
 *           description: URL to verify the certification
 *
 *     SearchCertificationsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         certifications:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Certification'
 *         total:
 *           type: integer
 *           description: Total number of results
 *         page:
 *           type: integer
 *           description: Current page number
 *         limit:
 *           type: integer
 *           description: Number of results per page
 *
 *     SearchProfilesResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         profiles:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/UserProfile'
 *         groups:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Group'
 *         total:
 *           type: integer
 *           description: Total number of results
 *         page:
 *           type: integer
 *           description: Current page number
 *         limit:
 *           type: integer
 *           description: Number of results per page
 */
