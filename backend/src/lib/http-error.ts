export type HttpErrorCode =
  | "bad_request"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "too_many_requests"
  | "internal_server_error";

export class HttpError extends Error {
  constructor(
    public statusCode: number,
    public code: HttpErrorCode,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export function createHttpError(
  statusCode: number,
  code: HttpErrorCode,
  message: string,
  details?: unknown,
): HttpError {
  return new HttpError(statusCode, code, message, details);
}
