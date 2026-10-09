import type { ApiResponse, Page, RefDto } from "./types";

// Domain api modules call these so components never see Mongo-shaped data.

export function refId(ref: RefDto | undefined): string | undefined {
  if (!ref) return undefined;
  return typeof ref === "string" ? ref : ref._id;
}

export function toPage<Dto, Model>(
  response: ApiResponse<Dto[]>,
  map: (dto: Dto) => Model,
): Page<Model> {
  if (!response.meta) {
    throw new Error("List response is missing pagination metadata");
  }
  return { items: response.data.map(map), meta: response.meta };
}
