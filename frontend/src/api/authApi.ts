import { postRequest } from "./ApiFunctions";

/* =========================
   TYPES
========================= */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
}

/* =========================
   LOGIN
========================= */

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  return await postRequest<AuthResponse, LoginRequest>("/auth/login", data);
};

/* =========================
   REGISTER
========================= */

export const register = async (
  data: RegisterRequest,
): Promise<AuthResponse> => {
  return await postRequest<AuthResponse, RegisterRequest>(
    "/auth/register",
    data,
  );
};
