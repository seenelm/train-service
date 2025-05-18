import {
  UserRequest,
  UserLoginRequest,
  RefreshTokenRequest,
  LogoutRequest,
} from "../../../src/app/user/userDto.js";
import {
  ValidateRegisterUser,
  ValidateLoginUser,
  RegisterUserAPIError,
  LoginUserAPIError,
  APIErrorType,
} from "../../../src/common/enums.js";
import UserTestFixture from "../../fixtures/UserTestFixture.js";
import { StatusCodes as HttpStatusCode } from "http-status-codes";
import { ErrorResponse } from "../../../src/common/errors/types.js";

interface ErrorTestCase<T> {
  description: string;
  request: Partial<T>;
  status: number;
  expectedErrorResponse: Partial<ErrorResponse>;
}

export default class AuthDataProvider {
  static registerUserErrorCases(): ErrorTestCase<UserRequest>[] {
    return [
      {
        description:
          "should return 409 status code when user already exists with the same email",
        request: UserTestFixture.createUserRequest({
          email: "ryanReynolds1@gmail.com",
          password: "Soccer98!",
          name: "Ryan Reynolds",
        }),
        status: HttpStatusCode.CONFLICT,
        expectedErrorResponse: {
          message: RegisterUserAPIError.UserAlreadyExists,
          errorCode: "CONFLICT",
        },
      },
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
        description: "should return 500 status code when password is invalid",
        request: UserTestFixture.createUserLoginRequest({
          email: "ryanReynolds98@gmail.com",
          password: "Soccer98!",
        }),
        status: HttpStatusCode.INTERNAL_SERVER_ERROR,
        expectedErrorResponse: {
          message: LoginUserAPIError.InvalidPassword,
          errorCode: "INVALID_PASSWORD",
        },
      },
      {
        description:
          "should return 404 status code when user is not found by email",
        request: UserTestFixture.createUserLoginRequest({
          email: "ryanReynolds98@gmail.com",
          password: "Password98!",
        }),
        status: HttpStatusCode.NOT_FOUND,
        expectedErrorResponse: {
          message: LoginUserAPIError.UserNotFound,
          errorCode: "NOT_FOUND",
        },
      },
      {
        description: "should return error when email is missing",
        request: UserTestFixture.createUserLoginRequest({
          email: undefined,
          password: "Password98!",
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

  static refreshTokenErrorCases(): ErrorTestCase<RefreshTokenRequest>[] {}
}
