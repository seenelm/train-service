/**
 * @swagger
 * components:
 *   schemas:
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Error message
 *         status:
 *           type: integer
 *           description: HTTP status code
 *         error:
 *           type: string
 *           description: Error name
 *       required:
 *         - message
 *         - status
 *     
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indicates if the operation was successful
 *           example: true
 *         message:
 *           type: string
 *           description: Success message
 *       required:
 *         - success
 */
