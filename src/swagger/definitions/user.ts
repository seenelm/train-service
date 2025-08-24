/**
 * @swagger
 * components:
 *   schemas:
 *     UserRequest:
 *       type: object
 *       required:
 *         - name
 *         - password
 *         - email
 *         - deviceId
 *         - agreeToTerms
 *       properties:
 *         username:
 *           type: string
 *           description: User's username
 *         name:
 *           type: string
 *           description: User's full name
 *         password:
 *           type: string
 *           description: User's password
 *           format: password
 *         isActive:
 *           type: boolean
 *           description: Whether the user is active
 *           default: true
 *         email:
 *           type: string
 *           description: User's email address
 *           format: email
 *         authProvider:
 *           type: string
 *           description: Authentication provider (e.g., 'local', 'google')
 *           default: 'local'
 *         deviceId:
 *           type: string
 *           description: Unique identifier for the user's device
 *         agreeToTerms:
 *           type: boolean
 *           description: Whether the user agrees to the terms and conditions
 *           example: true
 *
 *     UserLoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - deviceId
 *       properties:
 *         email:
 *           type: string
 *           description: User's email address
 *           format: email
 *         password:
 *           type: string
 *           description: User's password
 *           format: password
 *         deviceId:
 *           type: string
 *           description: Unique identifier for the user's device
 *
 *     UserResponse:
 *       type: object
 *       required:
 *         - userId
 *         - accessToken
 *         - refreshToken
 *         - username
 *         - name
 *       properties:
 *         userId:
 *           type: string
 *           description: Unique identifier for the user
 *         accessToken:
 *           type: string
 *           description: JWT access token
 *         refreshToken:
 *           type: string
 *           description: JWT refresh token
 *         username:
 *           type: string
 *           description: User's username
 *         name:
 *           type: string
 *           description: User's full name
 *
 *     GoogleAuthRequest:
 *       type: object
 *       required:
 *         - idToken
 *         - deviceId
 *       properties:
 *         idToken:
 *           type: string
 *           description: Google ID token
 *         name:
 *           type: string
 *           description: User's name (optional)
 *         deviceId:
 *           type: string
 *           description: Unique identifier for the user's device
 *
 *     RefreshTokenRequest:
 *       type: object
 *       required:
 *         - refreshToken
 *         - deviceId
 *       properties:
 *         refreshToken:
 *           type: string
 *           description: JWT refresh token
 *         deviceId:
 *           type: string
 *           description: Unique identifier for the user's device
 *
 *     RefreshTokenResponse:
 *       type: object
 *       required:
 *         - accessToken
 *         - refreshToken
 *       properties:
 *         accessToken:
 *           type: string
 *           description: New JWT access token
 *         refreshToken:
 *           type: string
 *           description: New JWT refresh token
 *
 *     LogoutRequest:
 *       type: object
 *       required:
 *         - refreshToken
 *         - deviceId
 *       properties:
 *         refreshToken:
 *           type: string
 *           description: JWT refresh token to invalidate
 *         deviceId:
 *           type: string
 *           description: Unique identifier for the user's device
 *
 *     RequestPasswordResetRequest:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           description: User's email address
 *           format: email
 *
 *     ResetPasswordWithCodeRequest:
 *       type: object
 *       required:
 *         - email
 *         - resetCode
 *         - newPassword
 *       properties:
 *         email:
 *           type: string
 *           description: User's email address
 *           format: email
 *         resetCode:
 *           type: string
 *           description: Password reset code sent to user's email
 *         newPassword:
 *           type: string
 *           description: New password
 *           format: password
 */
