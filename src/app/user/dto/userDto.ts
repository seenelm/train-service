export interface UserRegisterRequest {
  username?: string;
  name: string;
  password: string;
  isActive?: boolean;
  email: string;
  authProvider?: string;
}

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface UserResponse {
  userId: string;
  token: string;
  username: string;
  name: string;
}

export interface GoogleAuthRequest {
  idToken: string;
  name?: string;
}
