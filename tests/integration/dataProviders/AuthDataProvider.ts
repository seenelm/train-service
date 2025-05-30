import {
  UserRequest,
  UserLoginRequest,
  RefreshTokenRequest,
  LogoutRequest,
  RequestPasswordResetRequest,
  ResetPasswordWithCodeRequest,
} from "../../../src/app/user/userDto.js";
import {
  ValidateRegisterUser,
  ValidateLoginUser,
  RegisterUserAPIError,
  LoginUserAPIError,
  APIErrorType,
  ValidateRefreshTokens,
  AuthErrorType,
  ValidateLogout,
  ValidatePasswordReset,
} from "../../../src/common/enums.js";
import UserTestFixture from "../../fixtures/UserTestFixture.js";
import { StatusCodes as HttpStatusCode } from "http-status-codes";
import { ErrorResponse } from "../../../src/common/errors/types.js";
import { v4 as uuidv4 } from "uuid";

interface ErrorTestCase<T> {
  description: string;
  request: Partial<T> | (() => Promise<Partial<T>>);
  status: number;
  expectedErrorResponse: Partial<ErrorResponse>;
}

export default class AuthDataProvider {
  static registerUserErrorCases(): ErrorTestCase<UserRequest>[] {
    return [
      {
        description: "should return error when email is missing",
        request: UserTestFixture.createUserRequest({
          email: undefined,
          password: "Password98!",
          name: "Ryan Reynolds",
        }),
        status: HttpStatusCode.BAD_REQUEST,
        expectedErrorResponse: {
          message: "Validation failed",
          errorCode: "BAD_REQUEST",
          details: [ValidateRegisterUser.EmailRequired],
        },
      },
      {
        description: "should return error when password is missing",
        request: UserTestFixture.createUserRequest({
          email: "ryanReynolds1@gmail.com",
          password: undefined,
          name: "Ryan Reynolds",
        }),
        status: HttpStatusCode.BAD_REQUEST,
        expectedErrorResponse: {
          message: "Validation failed",
          errorCode: "BAD_REQUEST",
          details: [ValidateRegisterUser.PasswordRequired],
        },
      },
      {
        description: "should return error when name is missing",
        request: UserTestFixture.createUserRequest({
          email: "ryanReynolds1@gmail.com",
          password: "Password98!",
          name: undefined,
        }),
        status: HttpStatusCode.BAD_REQUEST,
        expectedErrorResponse: {
          message: "Validation failed",
          errorCode: "BAD_REQUEST",
          details: [ValidateRegisterUser.NameRequired],
        },
      },
      {
        description: "should return error when deviceId is missing",
        request: UserTestFixture.createUserRequest({
          email: "ryanReynolds1@gmail.com",
          password: "Password98!",
          name: "Ryan Reynolds",
          deviceId: undefined,
        }),
        status: HttpStatusCode.BAD_REQUEST,
        expectedErrorResponse: {
          message: "Validation failed",
          errorCode: "BAD_REQUEST",
          details: [ValidateRegisterUser.DeviceIdRequired],
        },
      },
      {
        description:
          "should return error when all registration fields are missing",
        request: UserTestFixture.createUserRequest({
          email: undefined,
          password: undefined,
          name: undefined,
          deviceId: undefined,
        }),
        status: HttpStatusCode.BAD_REQUEST,
        expectedErrorResponse: {
          message: "Validation failed",
          errorCode: "BAD_REQUEST",
          details: [
            ValidateRegisterUser.EmailRequired,
            ValidateRegisterUser.PasswordRequired,
            ValidateRegisterUser.NameRequired,
            ValidateRegisterUser.DeviceIdRequired,
          ],
        },
      },
    ];
  }

  static loginUserErrorCases(): ErrorTestCase<UserLoginRequest>[] {
    return [
      {
        description: "should return error when email is missing",
        request: UserTestFixture.createUserLoginRequest({
          email: undefined,
          password: "Password98!",
          deviceId: UserTestFixture.DEVICE_ID,
        }),
        status: HttpStatusCode.BAD_REQUEST,
        expectedErrorResponse: {
          message: "Validation failed",
          errorCode: "BAD_REQUEST",
          details: [ValidateLoginUser.EmailRequired],
        },
      },
      {
        description: "should return error when password is missing",
        request: UserTestFixture.createUserLoginRequest({
          email: "ryanReynolds1@gmail.com",
          password: undefined,
          deviceId: UserTestFixture.DEVICE_ID,
        }),
        status: HttpStatusCode.BAD_REQUEST,
        expectedErrorResponse: {
          message: "Validation failed",
          errorCode: "BAD_REQUEST",
          details: [ValidateLoginUser.PasswordRequired],
        },
      },
      {
        description: "should return error when deviceId is missing",
        request: UserTestFixture.createUserLoginRequest({
          email: "ryanReynolds1@gmail.com",
          password: "Password98!",
          deviceId: undefined,
        }),
        status: HttpStatusCode.BAD_REQUEST,
        expectedErrorResponse: {
          message: "Validation failed",
          errorCode: "BAD_REQUEST",
          details: [ValidateLoginUser.DeviceIdRequired],
        },
      },
      {
        description: "should return error when all login fields are missing",
        request: UserTestFixture.createUserLoginRequest({
          email: undefined,
          password: undefined,
          deviceId: undefined,
        }),
        status: HttpStatusCode.BAD_REQUEST,
        expectedErrorResponse: {
          message: "Validation failed",
          errorCode: "BAD_REQUEST",
          details: [
            ValidateLoginUser.EmailRequired,
            ValidateLoginUser.PasswordRequired,
            ValidateLoginUser.DeviceIdRequired,
          ],
        },
      },
    ];
  }

  static logoutErrorCases(): ErrorTestCase<LogoutRequest>[] {
    return [
      {
        description: "should return 404 status code when user was not found",
        request: UserTestFixture.createLogoutRequest(),
        status: HttpStatusCode.NOT_FOUND,
        expectedErrorResponse: {
          message: APIErrorType.UserNotFound,
          errorCode: "NOT_FOUND",
        },
      },
    ];
  }

  static refreshTokenErrorCases(
    getValidTokens: () => Promise<{ refreshToken: string; deviceId: string }>
  ): ErrorTestCase<RefreshTokenRequest>[] {
    return [
      {
        description: "should return 400 when refresh token is missing",
        request: UserTestFixture.createRefreshTokenRequest({
          refreshToken: undefined,
          deviceId: UserTestFixture.DEVICE_ID,
        }),
        status: HttpStatusCode.BAD_REQUEST,
        expectedErrorResponse: {
          message: "Validation failed",
          errorCode: "BAD_REQUEST",
          details: [ValidateRefreshTokens.RefreshTokenRequired],
        },
      },
      {
        description: "should return 400 when device ID is missing",
        request: UserTestFixture.createRefreshTokenRequest({
          refreshToken: "some-token",
          deviceId: undefined,
        }),
        status: HttpStatusCode.BAD_REQUEST,
        expectedErrorResponse: {
          message: "Validation failed",
          errorCode: "BAD_REQUEST",
          details: [ValidateRefreshTokens.DeviceIdRequired],
        },
      },
      {
        description:
          "should return 400 status code when all token refresh fields are missing",
        request: UserTestFixture.createRefreshTokenRequest({
          refreshToken: undefined,
          deviceId: undefined,
        }),
        status: HttpStatusCode.BAD_REQUEST,
        expectedErrorResponse: {
          message: "Validation failed",
          errorCode: "BAD_REQUEST",
          details: [
            ValidateRefreshTokens.RefreshTokenRequired,
            ValidateRefreshTokens.DeviceIdRequired,
          ],
        },
      },
      {
        description: "should return 403 when refresh token is invalid",
        request: async () => {
          const { deviceId } = await getValidTokens();
          return UserTestFixture.createRefreshTokenRequest({
            refreshToken: "invalid-refresh-token",
            deviceId: deviceId,
          });
        },
        status: HttpStatusCode.FORBIDDEN,
        expectedErrorResponse: {
          message: AuthErrorType.InvalidRefreshToken,
          errorCode: "FORBIDDEN",
        },
      },
      {
        description:
          "should return 403 when refresh token is from a different device",
        request: async () => {
          const { refreshToken } = await getValidTokens();
          return UserTestFixture.createRefreshTokenRequest({
            refreshToken,
            deviceId: uuidv4(),
          });
        },
        status: HttpStatusCode.FORBIDDEN,
        expectedErrorResponse: {
          message: AuthErrorType.InvalidRefreshToken,
          errorCode: "FORBIDDEN",
        },
      },
    ];
  }

  static logoutUserErrorCases(): ErrorTestCase<LogoutRequest>[] {
    return [
      {
        description: "should return 404 when user was not found",
        request: UserTestFixture.createLogoutRequest(),
        status: HttpStatusCode.NOT_FOUND,
        expectedErrorResponse: {
          message: APIErrorType.UserNotFound,
          errorCode: "NOT_FOUND",
        },
      },
      {
        description: "should return 400 when refresh token is missing",
        request: UserTestFixture.createLogoutRequest({
          refreshToken: undefined,
          deviceId: UserTestFixture.DEVICE_ID,
        }),
        status: HttpStatusCode.BAD_REQUEST,
        expectedErrorResponse: {
          message: "Validation failed",
          errorCode: "BAD_REQUEST",
          details: [ValidateLogout.RefreshTokenRequired],
        },
      },
      {
        description: "should return 400 when deviceId is missing",
        request: UserTestFixture.createLogoutRequest({
          refreshToken: UserTestFixture.REFRESH_TOKEN,
          deviceId: undefined,
        }),
        status: HttpStatusCode.BAD_REQUEST,
        expectedErrorResponse: {
          message: "Validation failed",
          errorCode: "BAD_REQUEST",
          details: [ValidateLogout.DeviceIdRequired],
        },
      },
      {
        description: "should return 400 when all fields are missing",
        request: UserTestFixture.createLogoutRequest({
          refreshToken: undefined,
          deviceId: undefined,
        }),
        status: HttpStatusCode.BAD_REQUEST,
        expectedErrorResponse: {
          message: "Validation failed",
          errorCode: "BAD_REQUEST",
          details: [
            ValidateLogout.RefreshTokenRequired,
            ValidateLogout.DeviceIdRequired,
          ],
        },
      },
    ];
  }

  static resetPasswordWithCodeErrorCases(): ErrorTestCase<ResetPasswordWithCodeRequest>[] {
    return [
      {
        description: "should return 400 when email is missing",
        request: UserTestFixture.createResetPasswordWithCodeRequest({
          email: undefined,
        }),
        status: HttpStatusCode.BAD_REQUEST,
        expectedErrorResponse: {
          message: "Validation failed",
          errorCode: "BAD_REQUEST",
          details: [ValidatePasswordReset.EmailRequired],
        },
      },
      {
        description: "should return 400 when reset code is missing",
        request: UserTestFixture.createResetPasswordWithCodeRequest({
          resetCode: undefined,
        }),
        status: HttpStatusCode.BAD_REQUEST,
        expectedErrorResponse: {
          message: "Validation failed",
          errorCode: "BAD_REQUEST",
          details: [ValidatePasswordReset.ResetCodeRequired],
        },
      },
      {
        description: "should return 400 when new password is missing",
        request: UserTestFixture.createResetPasswordWithCodeRequest({
          newPassword: undefined,
        }),
        status: HttpStatusCode.BAD_REQUEST,
        expectedErrorResponse: {
          message: "Validation failed",
          errorCode: "BAD_REQUEST",
          details: [ValidatePasswordReset.NewPasswordRequired],
        },
      },
      {
        description: "should return 400 when all fields are missing",
        request: UserTestFixture.createResetPasswordWithCodeRequest({
          email: undefined,
          resetCode: undefined,
          newPassword: undefined,
        }),
        status: HttpStatusCode.BAD_REQUEST,
        expectedErrorResponse: {
          message: "Validation failed",
          errorCode: "BAD_REQUEST",
          details: [
            ValidatePasswordReset.EmailRequired,
            ValidatePasswordReset.ResetCodeRequired,
            ValidatePasswordReset.NewPasswordRequired,
          ],
        },
      },
    ];
  }
}
