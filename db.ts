import { drizzle, BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

const sqlite = new Database("sqlite.db");
const db: BetterSQLite3Database = drizzle(sqlite);

migrate(db, { migrationsFolder: "./drizzle" });

export const records = sqliteTable("records", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name"),
  path: text("path").unique().notNull(),
  extension: text("extension"),
  size: integer("size"),
  type: text("type"),
  createdAt: text("createdAt"),
  updatedAt: text("updatedAt"),
  deletedAt: text("deletedAt"),
});

export default db;
