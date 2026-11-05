import { getToken } from "../utils/auth";

const API_URL = "http://localhost:3000/api";

interface RequestOptions {
  token?: string;
}

/*
 * HEADERS
 *
 * Ako je token ručno prosleđen,
 * koristi njega.
 *
 * Ako nije, automatski uzima token
 * trenutno ulogovanog korisnika.
 */

const getHeaders = (token?: string): HeadersInit => {
  const authToken = token ?? getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  return headers;
};

/*
 * GET
 */

export const getRequest = async <T>(
  path: string,
  options?: RequestOptions,
): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, {
    method: "GET",
    headers: getHeaders(options?.token),
  });

  if (!response.ok) {
    const result = await response.json().catch(() => null);

    throw new Error(
      result?.message || `GET request failed: ${response.status}`,
    );
  }

  return response.json();
};

/*
 * POST
 */

export const postRequest = async <TResponse, TRequest>(
  path: string,
  body: TRequest,
  options?: RequestOptions,
): Promise<TResponse> => {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: getHeaders(options?.token),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const result = await response.json().catch(() => null);

    throw new Error(
      result?.message || `POST request failed: ${response.status}`,
    );
  }

  return response.json();
};

/*
 * PUT
 */

export const putRequest = async <TResponse, TRequest>(
  path: string,
  body: TRequest,
  options?: RequestOptions,
): Promise<TResponse> => {
  const response = await fetch(`${API_URL}${path}`, {
    method: "PUT",
    headers: getHeaders(options?.token),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const result = await response.json().catch(() => null);

    throw new Error(
      result?.message || `PUT request failed: ${response.status}`,
    );
  }

  return response.json();
};

/*
 * PATCH
 */

export const patchRequest = async <TResponse, TRequest>(
  path: string,
  body: TRequest,
  options?: RequestOptions,
): Promise<TResponse> => {
  const response = await fetch(`${API_URL}${path}`, {
    method: "PATCH",
    headers: getHeaders(options?.token),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const result = await response.json().catch(() => null);

    throw new Error(
      result?.message || `PATCH request failed: ${response.status}`,
    );
  }

  return response.json();
};

/*
 * DELETE
 */

export const deleteRequest = async (
  path: string,
  options?: RequestOptions,
): Promise<void> => {
  const response = await fetch(`${API_URL}${path}`, {
    method: "DELETE",
    headers: getHeaders(options?.token),
  });

  if (!response.ok) {
    const result = await response.json().catch(() => null);

    throw new Error(
      result?.message || `DELETE request failed: ${response.status}`,
    );
  }
};
