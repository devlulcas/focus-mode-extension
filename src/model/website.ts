import { object, string, type InferOutput } from "valibot";
import { StoredBoolean } from "./boolean.js";
import { StoredFavicon } from "./favicon.js";

export const Website = object({
  domain: string(),
  title: string(),
  favicon: StoredFavicon,
  blocked: StoredBoolean,
});

export type Website = InferOutput<typeof Website>;

export function removeDuplicates(websites: Website[]) {
  return websites.filter(
    (website, index, self) =>
      index === self.findIndex((t) => t.domain === website.domain)
  );
}
