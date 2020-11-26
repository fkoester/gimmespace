/* eslint-disable max-classes-per-file */

export class HttpError extends Error {
  constructor(message, status = 500, url) {
    super(message)

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HttpError)
    }

    this.status = status
    this.url = url
  }
}

export class BadRequestError extends HttpError {
  constructor(message) {
    super(message, 400)
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message) {
    super(message, 401)
  }
}

export class ForbiddenError extends HttpError {
  constructor(message) {
    super(message, 403)
  }
}

export class NotFoundError extends HttpError {
  constructor(message) {
    super(message, 404)
  }
}

export class MethodNotAllowedError extends HttpError {
  constructor(message) {
    super(message, 405)
  }
}

export class ConflictError extends HttpError {
  constructor(message) {
    super(message, 409)
  }
}

export class LockedError extends HttpError {
  constructor(message) {
    super(message, 423)
  }
}

export class TooManyRequestsError extends HttpError {
  constructor(message) {
    super(message, 429)
  }
}

export class UnexpectedError extends HttpError {
  constructor(message) {
    super(message, 500)
  }
}

export class ServiceUnavailableError extends HttpError {
  constructor(message) {
    super(message, 503)
  }
}

export default {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  MethodNotAllowedError,
  ConflictError,
  LockedError,
  TooManyRequestsError,
  UnexpectedError,
  ServiceUnavailableError,
}
