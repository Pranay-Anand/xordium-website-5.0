const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

(async () => {
  const db = await open({ filename: "./dev.db", driver: sqlite3.Database });

  const users = await new Promise((resolve, _) => {
    db.all("SELECT id, email, name, role FROM users", (err, rows) => resolve(rows));
  });
  console.log("Users:", JSON.stringify(users, null, 2));

  const events = await new Promise((resolve, _) => {
    db.all("SELECT id, slug, title, poster_url FROM events", (err, rows) => resolve(rows));
  });
  console.log("Events:", JSON.stringify(events, null, 2));

  await db.close();
})();