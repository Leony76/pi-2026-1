import { Platform } from "react-native";

type ApiErrorPayload = {
  message?: string;
};

export class ApiError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = "ApiError";
  }
}

const defaultBaseUrl = Platform.select({
  android: "http://10.0.2.2:3333",
  ios: "http://localhost:3333",
  default: "http://localhost:3333",
});

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? defaultBaseUrl;

export async function apiPost<TResponse>(path: string, body: unknown): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const rawPayload = await response.text();
  const parsedPayload = rawPayload ? (JSON.parse(rawPayload) as ApiErrorPayload | TResponse) : null;

  if (!response.ok) {
    const message =
      parsedPayload && typeof parsedPayload === "object" && "message" in parsedPayload
        ? (parsedPayload.message ?? "Erro na requisição")
        : "Erro na requisição";

    throw new ApiError(message, response.status);
  }

  return parsedPayload as TResponse;
}
