const EmptyOk = Symbol("OK_VALUE");
const EmptyError = Symbol("ERR_VALUE");

type EmptyOkType = typeof EmptyOk;
type EmptyValueType = typeof EmptyError;

export class Result<T, E extends Error> {
  #ok: T | EmptyOkType = EmptyOk; // value
  #err: E | EmptyValueType = EmptyError; // error

  constructor(ok: T | EmptyOkType, err: E | EmptyValueType) {
    if (ok === EmptyOk && err === EmptyError) {
      throw new Error("Result must have a value or an error");
    }
    if (ok !== EmptyOk && err !== EmptyError) {
      throw new Error("Result cannot have both a value and and error");
    }

    if (ok !== EmptyOk) {
      this.#ok = ok;
    } else {
      this.#err = err as E;
    }
  }

  unwrap(): T {
    if (this.isOk()) {
      return this.#ok as T;
    }

    if (this.isErr()) {
      console.error(this.#err);
      throw this.#err as E;
    }

    throw new Error("Unknown error");
  }

  unwrapOr(defaultValue: T): T {
    if (this.isOk()) {
      return this.#ok as T;
    }

    if (this.isErr()) {
      console.error(this.#err);
      return defaultValue;
    }

    throw new Error("Unknown error");
  }

  expect(msg: string): T {
    if (this.isOk()) {
      return this.#ok as T;
    }

    if (this.isErr()) {
      const err = this.#err as E;
      throw (err.message = msg + ":\n " + err.message);
    }

    throw new Error(msg);
  }

  isOk(): this is Result<T, never> {
    return this.#ok !== EmptyOk;
  }

  isErr(): this is Result<never, E> {
    return this.#err !== EmptyError;
  }

  getErr(): this extends Result<never, E> ? E : E | null {
    return this.#err as E;
  }
}

export function Ok<T>(value: T): Result<T, never> {
  return new Result(value, EmptyError as never);
}

export function Err<E extends Error>(error: E): Result<never, E> {
  console.log(error);
  return new Result(EmptyOk as never, error);
}

export async function wrapAsync<T, E extends Error>(
  func: () => Promise<T>
): Promise<Result<T, E>> {
  try {
    const result = await func();
    return Ok(result);
  } catch (error) {
    return Err(error as E);
  }
}
