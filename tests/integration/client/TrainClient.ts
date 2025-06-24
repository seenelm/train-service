import axios, { AxiosError } from "axios";
import {
  UserRequest,
  UserResponse,
  RefreshTokenResponse,
  RefreshTokenRequest,
  LogoutRequest,
  RequestPasswordResetRequest,
  ResetPasswordWithCodeRequest,
} from "../../../src/app/user/userDto.js";
import { v4 as uuidv4 } from "uuid";
import { StatusCodes as HttpStatusCode } from "http-status-codes";
import {
  CustomSectionRequest,
  UserLoginRequest,
  CustomSectionResponse,
} from "@seenelm/train-core";

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
    request: RefreshTokenRequest
  ): Promise<RefreshTokenResponse> {
    try {
      const response = await axios.post<RefreshTokenResponse>(
        `${this.baseUrl}/user/refresh`,
        request
      );
      return response.data;
    } catch (error) {
      console.error("Error refreshing token: ", error);
      throw error;
    }
  }

  public async logout(request: LogoutRequest): Promise<string> {
    try {
      const response = await axios.post<string>(
        `${this.baseUrl}/user/logout`,
        request
      );
      return response.data;
    } catch (error) {
      console.error("Logout error: ", error);
      throw error;
    }
  }

  public async requestPasswordReset(
    request: RequestPasswordResetRequest
  ): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/user/request-password-reset`, request);
    } catch (error) {
      console.error("Error requesting password reset: ", error);
      throw error;
    }
  }

  public async resetPasswordWithCode(
    request: ResetPasswordWithCodeRequest
  ): Promise<void> {
    try {
      await axios.post(
        `${this.baseUrl}/user/reset-password-with-code`,
        request
      );
    } catch (error) {
      console.error("Error resetting password with code: ", error);
      throw error;
    }
  }

  public async expireRefreshToken(request: RefreshTokenRequest): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/user/expire-refresh-token`, request);
    } catch (error) {
      console.error("Error expiring refresh token: ", error);
      throw error;
    }
  }

  public async getResetCode(userId: string): Promise<string> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/user/reset-code/${userId}`
      );
      return response.data.resetCode;
    } catch (error) {
      console.error("Error getting reset code: ", error);
      throw error;
    }
  }

  public async createCustomSection(
    userId: string,
    section: CustomSectionRequest
  ): Promise<{ success: boolean }> {
    try {
      const response = await axios.post<{ success: boolean }>(
        `${this.baseUrl}/user-profile/${userId}/custom-section`,
        section
      );
      return response.data;
    } catch (error) {
      console.error("Error creating custom section: ", error);
      throw error;
    }
  }

  public async getCustomSections(
    userId: string,
    accessToken?: string
  ): Promise<CustomSectionResponse[]> {
    try {
      // const headers: Record<string, string> = {};
      // if (accessToken) {
      //   headers.Authorization = `Bearer ${accessToken}`;
      // }

      const response = await axios.get<CustomSectionResponse[]>(
        `${this.baseUrl}/user-profile/${userId}/custom-sections`
      );
      return response.data;
    } catch (error) {
      console.error("Error getting custom sections: ", error);
      throw error;
    }
  }

  public async deleteCustomSection(
    userId: string,
    sectionTitle: string,
    accessToken?: string
  ): Promise<{ success: boolean }> {
    try {
      // const headers: Record<string, string> = {};
      // if (accessToken) {
      //   headers.Authorization = `Bearer ${accessToken}`;
      // }

      const response = await axios.delete<{ success: boolean }>(
        `${this.baseUrl}/user-profile/${userId}/custom-section/${sectionTitle}`
        // { headers }
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting custom section: ", error);
      throw error;
    }
  }

  public async updateCustomSection(
    userId: string,
    section: CustomSectionRequest
  ): Promise<{ success: boolean }> {
    try {
      const response = await axios.patch<{ success: boolean }>(
        `${this.baseUrl}/user-profile/${userId}/custom-section`,
        section
      );
      return response.data;
    } catch (error) {
      console.error("Error updating custom section: ", error);
      throw error;
    }
  }

  public generateDeviceId(): string {
    return uuidv4();
  }
}
