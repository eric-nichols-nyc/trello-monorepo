/** Shared error type for board HTTP failures; safe to import from client code. */
export class BoardApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "BoardApiError";
    this.status = status;
  }
}
