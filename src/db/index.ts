import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function createDb(env: unknown) {
  return drizzle((env as Record<string, D1Database>).DB, {
    schema,
  });
}

export type { schema };
