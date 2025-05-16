import axios from "axios";
import {
  UserRequest,
  UserResponse,
  UserLoginRequest,
  RefreshTokenResponse,
} from "../../../src/app/user/userDto.js";

export default class TrainClient {
  private baseUrl: string;
  constructor() {
    this.baseUrl = "http://train-test:3000/api";
  }

  public async register(request: UserRequest): Promise<UserResponse> {
    try {
      const response = await axios.post<UserResponse>(
        `${this.baseUrl}/user/register`,
        request
      );
      return response.data;
    } catch (error) {
      console.error("Error registering a user: ", error);
      throw error;
    }
  }

  public async login(request: UserLoginRequest): Promise<UserResponse> {
    try {
      const response = await axios.post<UserResponse>(
        `${this.baseUrl}/user/login`,
        request
      );
      return response.data;
    } catch (error) {
      console.error("Error logging in a user: ", error);
      throw error;
    }
  }

  public async refreshTokens(
    refreshToken: string,
    deviceId: string
  ): Promise<RefreshTokenResponse> {
    try {
      const response = await axios.post<RefreshTokenResponse>(
        `${this.baseUrl}/user/refresh`,
        { refreshToken, deviceId }
      );
      return response.data;
    } catch (error) {
      console.error("Error refreshing token: ", error);
      throw error;
    }
  }

  public async logout(refreshToken: string, deviceId: string): Promise<string> {
    try {
      const response = await axios.post<string>(`${this.baseUrl}/user/logout`, {
        refreshToken,
        deviceId,
      });
      return response.data;
    } catch (error) {
      console.error("Logout error: ", error);
      throw error;
    }
  }
}
