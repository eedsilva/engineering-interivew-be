import { HttpError } from './http-error';

export class ConflictError extends HttpError {
  constructor(
    detail: string = 'A resource with the same properties already exists.'
  ) {
    super(409, 'https://example.com/probs/conflict', 'Conflict', detail);
    this.name = 'ConflictError';
  }
}
