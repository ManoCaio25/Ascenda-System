export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.details = details;
  }
}

export function notFound(message = "Resource not found") {
  return new HttpError(404, message);
}

export function forbidden(message = "Forbidden") {
  return new HttpError(403, message);
}

export function badRequest(message = "Bad request", details) {
  return new HttpError(400, message, details);
}
