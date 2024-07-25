import type { UpdateResult } from "mongodb";

export function did_update(result: UpdateResult): boolean {
  return result.modifiedCount > 0;
}

