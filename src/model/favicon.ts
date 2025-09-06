import { pipe, string, transform, unknown } from "valibot";

export const defaultFavicon = `null`;

export const StoredFavicon = pipe(
  unknown(),
  transform((input) => input || defaultFavicon),
  string()
);
