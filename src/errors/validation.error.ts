import { HttpError } from './http-error';
import { ZodError, ZodIssue, ZodIssueCode } from 'zod';

// Custom type guard to check if a ZodIssue is of type 'invalid_type'
function isZodIssueInvalidType(issue: ZodIssue): issue is ZodIssue & {
  code: 'invalid_type';
  expected: string;
  received: string;
} {
  return issue.code === ZodIssueCode.invalid_type;
}

export class ValidationError extends HttpError {
  public issues: unknown[];

  constructor(error: ZodError) {
    super(
      400,
      'https://example.com/probs/validation-error',
      'Validation Error',
      'The request body or parameters are invalid.'
    );
    this.name = 'ValidationError';

    this.issues = error.issues.map((issue: ZodIssue) => {
      if (isZodIssueInvalidType(issue)) {
        // Use the custom type guard
        if (issue.expected === 'string' && issue.received === 'undefined') {
          return { ...issue, message: `${issue.path.join('.')} is required` };
        }
      }
      if (
        issue.code === ZodIssueCode.too_small &&
        issue.path.includes('description')
      ) {
        return { ...issue, message: 'Description is required' };
      }
      return issue;
    });
  }
}
