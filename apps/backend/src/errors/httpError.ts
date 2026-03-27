export class HttpError extends Error {
  public readonly statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}
export class ValidationError extends HttpError {
  constructor(message: string) {
    super(400, message);
  }
}
export class UnauthorizedError extends HttpError {
  constructor(message = "Unauthorized") {
    super(401, message);
  }
}
export class ForbiddenError extends HttpError {
  constructor(message = "Forbidden") {
    super(403, message);
  }
}
export class NotFoundError extends HttpError {
  constructor(message = "Not Found") {
    super(404, message);
  }
}
export class ConflictError extends HttpError {
  constructor(message = "Conflict") {
    super(409, message);
  }
}
