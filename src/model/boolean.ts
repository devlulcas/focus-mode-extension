import { boolean, pipe, transform, unknown } from "valibot";

export const StoredBoolean = pipe(
  unknown(),
  transform((input) => !!input),
  boolean()
);
