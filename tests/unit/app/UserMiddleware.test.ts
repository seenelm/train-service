import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  MockedObject,
  afterEach,
} from "vitest";
import { NextFunction, Request, Response } from "express";
import UserMiddleware from "../../../src/app/user/UserMiddleware.js";
import { StatusCodes as HttpStatusCode } from "http-status-codes";
import {
  UserRequest,
  UserLoginRequest,
} from "../../../src/app/user/userDto.js";
import {
  ValidateRegisterUser,
  ValidateLoginUser,
  ValidateLogout,
  ValidateRefreshTokens,
} from "../../../src/common/enums.js";
import { CreateValidator } from "../../../src/common/utils/requestValidation.js";
import UserTestFixture from "../../fixtures/UserTestFixture.js";
import UserRequestRules from "../../../src/app/user/UserRequestRules.js";
import { APIError } from "../../../src/common/errors/APIError.js";

describe("UserMiddleware", () => {
  let userMiddleware: UserMiddleware;
  let mockRequest: MockedObject<Request>;
  let mockResponse: MockedObject<Response>;
  let mockNext: MockedObject<NextFunction>;

  beforeEach(() => {
    userMiddleware = new UserMiddleware();
    mockRequest = {
      body: {},
    } as unknown as MockedObject<Request>;
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as MockedObject<Response>;
    mockNext = vi.fn() as unknown as MockedObject<NextFunction>;

    vi.spyOn(CreateValidator, "validate");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("validateRegisterUser", () => {
    it("should call next() when all required fields are provided", async () => {
      // Arrange
      const validUserRequest = UserTestFixture.createUserRequest();

      mockRequest.body = validUserRequest;

      // Mock the validation to return empty array (no errors)
      vi.mocked(CreateValidator.validate).mockReturnValueOnce([]);

      // Act
      await userMiddleware.validateRegisterUser(
        mockRequest as Request<{}, {}, UserRequest>,
        mockResponse as Response,
        mockNext as NextFunction
      );

      // Assert
      expect(CreateValidator.validate).toHaveBeenCalledWith(
        validUserRequest,
        UserRequestRules.registerRules
      );
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it("should return 400 when email is missing", async () => {
      // Arrange
      const userRequest = UserTestFixture.createUserRequest({
        email: undefined,
      });

      mockRequest.body = userRequest;

      const validationErrors = [ValidateRegisterUser.EmailRequired];

      // Mock the validation to return an error
      vi.mocked(CreateValidator.validate).mockReturnValueOnce(validationErrors);

      // Act
      await userMiddleware.validateRegisterUser(
        mockRequest as Request<{}, {}, UserRequest>,
        mockResponse as Response,
        mockNext as NextFunction
      );

      // Assert
      expect(CreateValidator.validate).toHaveBeenCalledWith(
        userRequest,
        UserRequestRules.registerRules
      );
      expect(mockNext).toHaveBeenCalledWith(
        APIError.BadRequest("Validation failed", validationErrors)
      );
    });

    it("should return 400 when password is missing", async () => {
      // Arrange
      const userRequest = UserTestFixture.createUserRequest({
        password: undefined,
      });

      mockRequest.body = userRequest;

      const validationErrors = [ValidateRegisterUser.PasswordRequired];

      vi.mocked(CreateValidator.validate).mockReturnValueOnce(validationErrors);

      // Act
      await userMiddleware.validateRegisterUser(
        mockRequest as Request<{}, {}, UserRequest>,
        mockResponse as Response,
        mockNext as NextFunction
      );

      // Assert
      expect(CreateValidator.validate).toHaveBeenCalledWith(
        userRequest,
        UserRequestRules.registerRules
      );
      expect(mockNext).toHaveBeenCalledWith(
        APIError.BadRequest("Validation failed", validationErrors)
      );
    });

    it("should return 400 when name is missing", async () => {
      // Arrange
      const userRequest = UserTestFixture.createUserRequest({
        name: undefined,
      });

      mockRequest.body = userRequest;
      const validationErrors = [ValidateRegisterUser.NameRequired];

      // Mock the validation to return an error
      vi.mocked(CreateValidator.validate).mockReturnValueOnce(validationErrors);

      // Act
      await userMiddleware.validateRegisterUser(
        mockRequest as Request<{}, {}, UserRequest>,
        mockResponse as Response,
        mockNext as NextFunction
      );

      // Assert
      expect(CreateValidator.validate).toHaveBeenCalledWith(
        userRequest,
        UserRequestRules.registerRules
      );
      expect(mockNext).toHaveBeenCalledWith(
        APIError.BadRequest("Validation failed", validationErrors)
      );
    });

    it("should return 400 when deviceId is missing", async () => {
      // Arrange
      const userRequest = UserTestFixture.createUserRequest({
        deviceId: undefined,
      });

      mockRequest.body = userRequest;
      const validationErrors = [ValidateRegisterUser.DeviceIdRequired];

      // Mock the validation to return an error
      vi.mocked(CreateValidator.validate).mockReturnValueOnce(validationErrors);

      // Act
      await userMiddleware.validateRegisterUser(
        mockRequest as Request<{}, {}, UserRequest>,
        mockResponse as Response,
        mockNext as NextFunction
      );

      // Assert
      expect(CreateValidator.validate).toHaveBeenCalledWith(
        userRequest,
        UserRequestRules.registerRules
      );
      expect(mockNext).toHaveBeenCalledWith(
        APIError.BadRequest("Validation failed", validationErrors)
      );
    });

    it("should return 400 with multiple errors when multiple fields are missing", async () => {
      // Arrange
      const userRequest = {};

      mockRequest.body = userRequest;

      const validationErrors = [
        ValidateRegisterUser.EmailRequired,
        ValidateRegisterUser.PasswordRequired,
        ValidateRegisterUser.NameRequired,
        ValidateRegisterUser.DeviceIdRequired,
      ];

      // Mock the validation to return multiple errors
      vi.mocked(CreateValidator.validate).mockReturnValueOnce(validationErrors);

      // Act
      await userMiddleware.validateRegisterUser(
        mockRequest as Request<{}, {}, UserRequest>,
        mockResponse as Response,
        mockNext as NextFunction
      );

      // Assert
      expect(CreateValidator.validate).toHaveBeenCalledWith(
        userRequest,
        UserRequestRules.registerRules
      );
      expect(mockNext).toHaveBeenCalledWith(
        APIError.BadRequest("Validation failed", validationErrors)
      );
    });
  });

  describe("validateLoginUser", () => {
    it("should call next() when all required fields are provided", async () => {
      // Arrange
      const userLoginRequest = UserTestFixture.createUserLoginRequest();

      mockRequest.body = userLoginRequest;

      // Mock the validation to return empty array (no errors)
      vi.mocked(CreateValidator.validate).mockReturnValueOnce([]);

      // Act
      await userMiddleware.validateLoginUser(
        mockRequest as Request<{}, {}, UserLoginRequest>,
        mockResponse as Response,
        mockNext as NextFunction
      );

      // Assert
      expect(CreateValidator.validate).toHaveBeenCalledWith(
        userLoginRequest,
        UserRequestRules.loginRules
      );
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it("should return 400 when email is missing", async () => {
      // Arrange
      const userLoginRequest = UserTestFixture.createUserLoginRequest({
        email: undefined,
      });

      mockRequest.body = userLoginRequest;
      const validationErrors = [ValidateLoginUser.EmailRequired];

      // Mock the validation to return an error
      vi.mocked(CreateValidator.validate).mockReturnValueOnce(validationErrors);

      // Act
      await userMiddleware.validateLoginUser(
        mockRequest as Request<{}, {}, UserLoginRequest>,
        mockResponse as Response,
        mockNext as NextFunction
      );

      // Assert
      expect(CreateValidator.validate).toHaveBeenCalledWith(
        userLoginRequest,
        UserRequestRules.loginRules
      );
      expect(mockNext).toHaveBeenCalledWith(
        APIError.BadRequest("Validation failed", validationErrors)
      );
    });

    it("should return 400 when password is missing", async () => {
      // Arrange
      const userLoginRequest = UserTestFixture.createUserLoginRequest({
        password: undefined,
      });

      mockRequest.body = userLoginRequest;
      const validationErrors = [ValidateLoginUser.PasswordRequired];

      // Mock the validation to return an error
      vi.mocked(CreateValidator.validate).mockReturnValueOnce(validationErrors);

      // Act
      await userMiddleware.validateLoginUser(
        mockRequest as Request<{}, {}, UserLoginRequest>,
        mockResponse as Response,
        mockNext as NextFunction
      );

      // Assert
      expect(CreateValidator.validate).toHaveBeenCalledWith(
        userLoginRequest,
        UserRequestRules.loginRules
      );
      expect(mockNext).toHaveBeenCalledWith(
        APIError.BadRequest("Validation failed", validationErrors)
      );
    });

    it("should return 400 when deviceId is missing", async () => {
      // Arrange
      const userLoginRequest = UserTestFixture.createUserLoginRequest({
        deviceId: undefined,
      });

      mockRequest.body = userLoginRequest;
      const validationErrors = [ValidateLoginUser.DeviceIdRequired];

      // Mock the validation to return an error
      vi.mocked(CreateValidator.validate).mockReturnValueOnce(validationErrors);

      // Act
      await userMiddleware.validateLoginUser(
        mockRequest as Request<{}, {}, UserLoginRequest>,
        mockResponse as Response,
        mockNext as NextFunction
      );

      // Assert
      expect(CreateValidator.validate).toHaveBeenCalledWith(
        userLoginRequest,
        UserRequestRules.loginRules
      );
      expect(mockNext).toHaveBeenCalledWith(
        APIError.BadRequest("Validation failed", validationErrors)
      );
    });

    it("should return 400 with multiple errors when multiple fields are missing", async () => {
      // Arrange
      const userLoginRequest = {};

      mockRequest.body = userLoginRequest;
      const validationErrors = [
        ValidateLoginUser.EmailRequired,
        ValidateLoginUser.PasswordRequired,
        ValidateLoginUser.DeviceIdRequired,
      ];

      // Mock the validation to return multiple errors
      vi.mocked(CreateValidator.validate).mockReturnValueOnce(validationErrors);

      // Act
      await userMiddleware.validateLoginUser(
        mockRequest as Request<{}, {}, UserLoginRequest>,
        mockResponse as Response,
        mockNext as NextFunction
      );

      // Assert
      expect(CreateValidator.validate).toHaveBeenCalledWith(
        userLoginRequest,
        UserRequestRules.loginRules
      );
      expect(mockNext).toHaveBeenCalledWith(
        APIError.BadRequest("Validation failed", validationErrors)
      );
    });
  });

  describe("validateRefreshToken", () => {
    it("should call next() when all required fields are provided", async () => {
      // Arrange
      const refreshTokenRequest = {
        refreshToken: UserTestFixture.REFRESH_TOKEN,
        deviceId: UserTestFixture.DEVICE_ID,
      };

      mockRequest.body = refreshTokenRequest;

      // Mock the validation to return empty array (no errors)
      vi.mocked(CreateValidator.validate).mockReturnValueOnce([]);

      // Act
      await userMiddleware.validateRefreshToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      // Assert
      expect(CreateValidator.validate).toHaveBeenCalledWith(
        refreshTokenRequest,
        UserRequestRules.refreshTokenRules
      );
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it("should return 400 when refreshToken is missing", async () => {
      // Arrange
      const refreshTokenRequest = {
        refreshToken: undefined,
        deviceId: UserTestFixture.DEVICE_ID,
      };

      mockRequest.body = refreshTokenRequest;
      const validationErrors = [ValidateRefreshTokens.RefreshTokenRequired];

      // Mock the validation to return an error
      vi.mocked(CreateValidator.validate).mockReturnValueOnce(validationErrors);

      // Act
      await userMiddleware.validateRefreshToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      // Assert
      expect(CreateValidator.validate).toHaveBeenCalledWith(
        refreshTokenRequest,
        UserRequestRules.refreshTokenRules
      );
      expect(mockNext).toHaveBeenCalledWith(
        APIError.BadRequest("Validation failed", validationErrors)
      );
    });

    it("should return 400 when deviceId is missing", async () => {
      // Arrange
      const refreshTokenRequest = {
        refreshToken: UserTestFixture.REFRESH_TOKEN,
        deviceId: undefined,
      };

      mockRequest.body = refreshTokenRequest;
      const validationErrors = [ValidateRefreshTokens.DeviceIdRequired];

      // Mock the validation to return an error
      vi.mocked(CreateValidator.validate).mockReturnValueOnce(validationErrors);

      // Act
      await userMiddleware.validateRefreshToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      // Assert
      expect(CreateValidator.validate).toHaveBeenCalledWith(
        refreshTokenRequest,
        UserRequestRules.refreshTokenRules
      );
      expect(mockNext).toHaveBeenCalledWith(
        APIError.BadRequest("Validation failed", validationErrors)
      );
    });

    it("should return 400 with multiple errors when multiple fields are missing", async () => {
      // Arrange
      const refreshTokenRequest = {};

      mockRequest.body = refreshTokenRequest;
      const validationErrors = [
        ValidateRefreshTokens.DeviceIdRequired,
        ValidateRefreshTokens.RefreshTokenRequired,
      ];

      // Mock the validation to return an error
      vi.mocked(CreateValidator.validate).mockReturnValueOnce(validationErrors);

      // Act
      await userMiddleware.validateRefreshToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      // Assert
      expect(CreateValidator.validate).toHaveBeenCalledWith(
        refreshTokenRequest,
        UserRequestRules.refreshTokenRules
      );
      expect(mockNext).toHaveBeenCalledWith(
        APIError.BadRequest("Validation failed", validationErrors)
      );
    });
  });

  describe("validateLogout", () => {
    it("should call next() when all required fields are provided", async () => {
      // Arrange
      const logoutRequest = {
        refreshToken: UserTestFixture.REFRESH_TOKEN,
        deviceId: UserTestFixture.DEVICE_ID,
      };

      mockRequest.body = logoutRequest;

      // Mock the validation to return empty array (no errors)
      vi.mocked(CreateValidator.validate).mockReturnValueOnce([]);

      // Act
      await userMiddleware.validateLogout(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      // Assert
      expect(CreateValidator.validate).toHaveBeenCalledWith(
        logoutRequest,
        UserRequestRules.logoutRules
      );
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it("should return 400 when refreshToken is missing", async () => {
      // Arrange
      const logoutRequest = {
        refreshToken: undefined,
        deviceId: UserTestFixture.DEVICE_ID,
      };

      mockRequest.body = logoutRequest;
      const validationErrors = [ValidateLogout.RefreshTokenRequired];

      // Mock the validation to return an error
      vi.mocked(CreateValidator.validate).mockReturnValueOnce(validationErrors);

      // Act
      await userMiddleware.validateLogout(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      // Assert
      expect(CreateValidator.validate).toHaveBeenCalledWith(
        logoutRequest,
        UserRequestRules.logoutRules
      );
      expect(mockNext).toHaveBeenCalledWith(
        APIError.BadRequest("Validation failed", validationErrors)
      );
    });

    it("should return 400 when deviceId is missing", async () => {
      // Arrange
      const logoutRequest = {
        refreshToken: UserTestFixture.REFRESH_TOKEN,
        deviceId: undefined,
      };

      mockRequest.body = logoutRequest;
      const validationErrors = [ValidateLogout.DeviceIdRequired];

      // Mock the validation to return an error
      vi.mocked(CreateValidator.validate).mockReturnValueOnce(validationErrors);

      // Act
      await userMiddleware.validateLogout(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      // Assert
      expect(CreateValidator.validate).toHaveBeenCalledWith(
        logoutRequest,
        UserRequestRules.logoutRules
      );
      expect(mockNext).toHaveBeenCalledWith(
        APIError.BadRequest("Validation failed", validationErrors)
      );
    });

    it("should return 400 with multiple errors when multiple fields are missing", async () => {
      // Arrange
      const logoutRequest = {};

      mockRequest.body = logoutRequest;
      const validationErrors = [
        ValidateLogout.DeviceIdRequired,
        ValidateLogout.RefreshTokenRequired,
      ];

      // Mock the validation to return an error
      vi.mocked(CreateValidator.validate).mockReturnValueOnce(validationErrors);

      // Act
      await userMiddleware.validateLogout(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      // Assert
      expect(CreateValidator.validate).toHaveBeenCalledWith(
        logoutRequest,
        UserRequestRules.logoutRules
      );
      expect(mockNext).toHaveBeenCalledWith(
        APIError.BadRequest("Validation failed", validationErrors)
      );
    });
  });
});
