import TrainClient from "./client/TrainClient.js";

import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  MockedObject,
  afterEach,
} from "vitest";
import UserTestFixture from "../fixtures/UserTestFixture.js";

describe("Train Service Integration Tests", () => {
  let trainClient: TrainClient;

  beforeEach(() => {
    trainClient = new TrainClient();
  });

  it("should register a user successfully", async () => {
    const userRequest = UserTestFixture.createUserRequest({
      username: undefined,
      name: "Ryan Reynolds",
      password: "Password98!",
      isActive: undefined,
      email: "ryanReynolds1@gmail.com",
      authProvider: "local",
    });

    const response = await trainClient.register(userRequest);
    console.log("Response from register: ", response);

    expect(response.username).toBeDefined();
    expect(response.name).toBe(userRequest.name);
    expect(response.userId).toBeDefined();
    expect(response.token).toBeDefined();
  });
});
