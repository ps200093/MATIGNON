import { DatabaseSync } from "node:sqlite";
import { resolve } from "node:path";
const db = new DatabaseSync(
  resolve(process.env.DATA_DIR || "./data", "rsvp.sqlite"),
  { readOnly: true },
);
console.log(
  JSON.stringify(
    db
      .prepare(
        "SELECT id, name, attendance, guests, created_at FROM responses ORDER BY created_at",
      )
      .all(),
    null,
    2,
  ),
);
db.close();
