import { UserRequest } from "../../../src/app/user/userDto.js";
import { ValidateRegisterUser } from "../../../src/common/enums.js";
import UserTestFixture from "../../fixtures/UserTestFixture.js";

interface RegisterErrorTestCase {
  description: string;
  request: Partial<UserRequest>;
  expectedErrors: string[];
}

export default class AuthDataProvider {
  static registerUserErrorCases(): RegisterErrorTestCase[] {
    return [
      {
        description: "should return error when email is missing",
        request: UserTestFixture.createUserRequest({
          email: undefined,
          password: "Password98!",
          name: "Ryan Reynolds",
        }),
        expectedErrors: [ValidateRegisterUser.EmailRequired],
      },
      {
        description: "should return error when password is missing",
        request: UserTestFixture.createUserRequest({
          email: "ryanReynolds1@gmail.com",
          password: undefined,
          name: "Ryan Reynolds",
        }),
        expectedErrors: [ValidateRegisterUser.PasswordRequired],
      },
      {
        description: "should return error when name is missing",
        request: UserTestFixture.createUserRequest({
          email: "ryanReynolds1@gmail.com",
          password: "Password98!",
          name: undefined,
        }),
        expectedErrors: [ValidateRegisterUser.NameRequired],
      },
      {
        description:
          "should return error when all registration fields are missing",
        request: UserTestFixture.createUserRequest({
          email: undefined,
          password: undefined,
          name: undefined,
        }),
        expectedErrors: [
          ValidateRegisterUser.EmailRequired,
          ValidateRegisterUser.NameRequired,
          ValidateRegisterUser.PasswordRequired,
        ],
      },
    ];
  }
}
