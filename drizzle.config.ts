import type { Config } from "drizzle-kit";

export default {
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL || "file:./data/paperclip.db",
  },
} satisfies Config;
