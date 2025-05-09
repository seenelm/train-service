import axios from "axios";
import {
  UserRequest,
  UserResponse,
  UserLoginRequest,
} from "../../../src/app/user/userDto.js";

export default class TrainClient {
  private baseUrl: string;
  constructor() {
    // Use localhost when running tests locally, or container name in Docker
    const host = process.env.TEST_ENV === 'docker' ? 'train-test' : 'localhost';
    this.baseUrl = `http://${host}:3000/api`;
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
  
  public async deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/user/delete-user`,
        { userId }
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting a user: ", error);
      throw error;
    }
  }
}
