import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";

const directory = dirname(fileURLToPath(import.meta.url));
const dataDirectory = join(directory, "data");
mkdirSync(dataDirectory, { recursive: true });

const database = new DatabaseSync(join(dataDirectory, "disasterlens.db"));
database.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    area TEXT NOT NULL,
    language TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

export function createUser({ name, phone, area, language }) {
  const result = database
    .prepare(
      "INSERT INTO users (name, phone, area, language) VALUES (?, ?, ?, ?)",
    )
    .run(name, phone, area, language);
  return Number(result.lastInsertRowid);
}

export function closeDatabase() {
  database.close();
}
