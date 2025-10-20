import { HttpError } from './http-error';

export class BadRequestError extends HttpError {
  constructor(detail: string = 'The request is invalid.') {
    super(400, 'https://example.com/probs/bad-request', 'Bad Request', detail);
    this.name = 'BadRequestError';
  }
}
