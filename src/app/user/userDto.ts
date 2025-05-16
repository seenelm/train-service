export interface UserRequest {
  username?: string;
  name: string;
  password: string;
  isActive?: boolean;
  email: string;
  authProvider?: string;
  deviceId: string;
}

export function updateUserRequest(
  userRequest: UserRequest,
  updatedData: Partial<UserRequest>
): UserRequest {
  return { ...userRequest, ...updatedData };
}

export interface UserLoginRequest {
  email: string;
  password: string;
  deviceId: string;
}

export interface UserResponse {
  userId: string;
  accessToken: string;
  refreshToken: string;
  username: string;
  name: string;
}

export interface GoogleAuthRequest {
  idToken: string;
  name?: string;
  deviceId: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}
