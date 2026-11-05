import type { CVData, CVDesignConfig } from "../types/cv";
import { getToken } from "../utils/auth";

export interface StoredCV {
  id: number;
  data: CVData;
}

export interface GeneratedCVResponse {
  message: string;
  cvId: number;
  data: CVData;
  design: CVDesignConfig;
}

const API_URL = "http://localhost:3000/api/cvs";

const getAuthHeaders = () => {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const createCV = async (cvData: CVData): Promise<StoredCV> => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(cvData),
  });

  if (!response.ok) {
    throw new Error("Greška prilikom čuvanja CV-a.");
  }

  return response.json();
};

export const getCVs = async (): Promise<StoredCV[]> => {
  const response = await fetch(API_URL, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Greška prilikom učitavanja CV-jeva.");
  }

  return response.json();
};

export const getCVById = async (id: number): Promise<StoredCV> => {
  const response = await fetch(`${API_URL}/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("CV nije pronađen.");
  }

  return response.json();
};

export const updateCV = async (
  id: number,
  cvData: CVData,
): Promise<StoredCV> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(cvData),
  });

  if (!response.ok) {
    throw new Error("Greška prilikom izmene CV-a.");
  }

  return response.json();
};

export const deleteCV = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Greška prilikom brisanja CV-a.");
  }
};

export const generateCV = async (
  cvId: number,
  cvData: CVData,
): Promise<GeneratedCVResponse> => {
  const response = await fetch(`${API_URL}/generate`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      cvId,
      data: cvData,
    }),
  });

  const result = await response.json();

  console.log("GENERATE STATUS:", response.status);
  console.log("GENERATE RESPONSE:", result);

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        JSON.stringify(result) ||
        "Greška prilikom generisanja CV-a.",
    );
  }

  return result;
};

export const generateCVDesign = async (
  cvData: CVData,
): Promise<GeneratedCVDesignResponse> => {
  const response = await fetch(`${API_URL}/generate-design`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      cvData,
    }),
  });

  const result = await response.json();

  console.log("GENERATE DESIGN STATUS:", response.status);
  console.log("GENERATE DESIGN RESPONSE:", result);

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        JSON.stringify(result) ||
        "Greška prilikom generisanja CV dizajna.",
    );
  }

  return result;
};
