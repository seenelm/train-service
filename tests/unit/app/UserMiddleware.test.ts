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
} from "../../../src/common/enums.js";
import { CreateValidator } from "../../../src/common/utils/requestValidation.js";
import UserTestFixture from "../../fixtures/UserTestFixture.js";
import UserRequestRules from "../../../src/app/user/UserRequestRules.js";

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
      const validUserRequest = UserTestFixture.createUserRequest({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      });

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
        password: "password123",
        name: "Test User",
      });

      mockRequest.body = userRequest;

      // Mock the validation to return an error
      vi.mocked(CreateValidator.validate).mockReturnValueOnce([
        ValidateRegisterUser.EmailRequired,
      ]);

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
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatusCode.BAD_REQUEST
      );
      expect(mockResponse.json).toHaveBeenCalledWith([
        ValidateRegisterUser.EmailRequired,
      ]);
    });

    it("should return 400 when password is missing", async () => {
      // Arrange
      const userRequest = UserTestFixture.createUserRequest({
        email: "test@example.com",
        name: "Test User",
      });

      mockRequest.body = userRequest;

      vi.mocked(CreateValidator.validate).mockReturnValueOnce([
        ValidateRegisterUser.PasswordRequired,
      ]);

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
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatusCode.BAD_REQUEST
      );
      expect(mockResponse.json).toHaveBeenCalledWith([
        ValidateRegisterUser.PasswordRequired,
      ]);
    });

    it("should return 400 when name is missing", async () => {
      // Arrange
      const userRequest = UserTestFixture.createUserRequest({
        email: "test@example.com",
        password: "password123",
      });

      mockRequest.body = userRequest;

      // Mock the validation to return an error
      vi.mocked(CreateValidator.validate).mockReturnValueOnce([
        ValidateRegisterUser.NameRequired,
      ]);

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
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatusCode.BAD_REQUEST
      );
      expect(mockResponse.json).toHaveBeenCalledWith([
        ValidateRegisterUser.NameRequired,
      ]);
    });

    it("should return 400 with multiple errors when multiple fields are missing", async () => {
      // Arrange
      const userRequest = {};

      mockRequest.body = userRequest;

      // Mock the validation to return multiple errors
      vi.mocked(CreateValidator.validate).mockReturnValueOnce([
        ValidateRegisterUser.EmailRequired,
        ValidateRegisterUser.PasswordRequired,
        ValidateRegisterUser.NameRequired,
      ]);

      // Act
      await userMiddleware.validateRegisterUser(
        mockRequest as Request<{}, {}, UserRequest>,
        mockResponse as Response,
        mockNext as NextFunction
      );

      // Assert
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatusCode.BAD_REQUEST
      );
      expect(mockResponse.json).toHaveBeenCalledWith([
        ValidateRegisterUser.EmailRequired,
        ValidateRegisterUser.PasswordRequired,
        ValidateRegisterUser.NameRequired,
      ]);
    });
  });

  describe("validateLoginUser", () => {
    it("should call next() when all required fields are provided", async () => {
      // Arrange
      const userLoginRequest = UserTestFixture.createUserLoginRequest({
        email: "test@example.com",
        password: "password123",
      });

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
        password: "password123",
      });

      mockRequest.body = userLoginRequest;

      // Mock the validation to return an error
      vi.mocked(CreateValidator.validate).mockReturnValueOnce([
        ValidateLoginUser.EmailRequired,
      ]);

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
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatusCode.BAD_REQUEST
      );
      expect(mockResponse.json).toHaveBeenCalledWith([
        ValidateLoginUser.EmailRequired,
      ]);
    });

    it("should return 400 when password is missing", async () => {
      // Arrange
      const userLoginRequest = UserTestFixture.createUserLoginRequest({
        email: "test@example.com",
      });

      mockRequest.body = userLoginRequest;

      vi.mocked(CreateValidator.validate).mockReturnValueOnce([
        ValidateLoginUser.PasswordRequired,
      ]);

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
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatusCode.BAD_REQUEST
      );
      expect(mockResponse.json).toHaveBeenCalledWith([
        ValidateLoginUser.PasswordRequired,
      ]);
    });

    it("should return 400 with multiple errors when multiple fields are missing", async () => {
      // Arrange
      const userLoginRequest = {};

      mockRequest.body = userLoginRequest;

      // Mock the validation to return multiple errors
      vi.mocked(CreateValidator.validate).mockReturnValueOnce([
        ValidateLoginUser.EmailRequired,
        ValidateLoginUser.PasswordRequired,
      ]);

      // Act
      await userMiddleware.validateLoginUser(
        mockRequest as Request<{}, {}, UserLoginRequest>,
        mockResponse as Response,
        mockNext as NextFunction
      );

      // Assert
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatusCode.BAD_REQUEST
      );
      expect(mockResponse.json).toHaveBeenCalledWith([
        ValidateLoginUser.EmailRequired,
        ValidateLoginUser.PasswordRequired,
      ]);
    });
  });
});
