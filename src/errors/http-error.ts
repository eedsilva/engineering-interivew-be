export class HttpError extends Error {
  public status: number;
  public type: string;
  public detail: string;

  constructor(status: number, type: string, title: string, detail: string) {
    super(title);
    this.status = status;
    this.type = type;
    this.detail = detail;
    this.name = 'HttpError';
  }
}
