import { HttpError } from './http-error';

export class NotFoundError extends HttpError {
  constructor(detail: string = 'The requested resource was not found.') {
    super(404, 'https://example.com/probs/not-found', 'Not Found', detail);
    this.name = 'NotFoundError';
  }
}
