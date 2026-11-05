import type { UserResponse } from "../api/authApi";

const TOKEN_KEY = "ai_career_token";
const USER_KEY = "ai_career_user";

/* =========================
   TOKEN
========================= */

export const saveToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

/* =========================
   USER
========================= */

export const saveUser = (user: UserResponse) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = (): UserResponse | null => {
  const user = localStorage.getItem(USER_KEY);

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user) as UserResponse;
  } catch {
    return null;
  }
};

export const removeUser = () => {
  localStorage.removeItem(USER_KEY);
};

/* =========================
   AUTH
========================= */

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export const logout = () => {
  removeToken();
  removeUser();
};
