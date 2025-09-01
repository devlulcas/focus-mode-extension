import { object, safeParse, string, type InferOutput } from "valibot";

export const Website = object({
  domain: string(),
  title: string(),
  favicon: string(),
});

export type Website = InferOutput<typeof Website>;

export function fromJSON(json: unknown) {
  return safeParse(Website, json);
}
