const sqlite3 = require("sqlite3");

async function setup() {
  const db = new sqlite3.Database("./dev.db");

  await new Promise((resolve, reject) => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        name TEXT,
        password TEXT,
        role TEXT CHECK(role IN ('owner', 'admin', 'moderator')) DEFAULT 'moderator',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT UNIQUE,
        tag TEXT,
        title TEXT,
        category TEXT,
        description TEXT,
        image TEXT,
        prize_pool TEXT,
        venue TEXT,
        format TEXT,
        schedule TEXT,
        team_size TEXT,
        cta TEXT,
        featured INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        poster_url TEXT
      );

      CREATE TABLE IF NOT EXISTS registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER,
        email TEXT,
        name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events(id)
      );
    `, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  console.log("Database tables ensured");

  // Insert default owner user - password stored as plaintext for demo
  // In production, use proper password hashing (bcrypt, argon2)
  const ownerEmail = "convenor@xordium.ignite.bit.in";
  const ownerName = "System Owner";
  const ownerPassword = "OwnerPass123!"; // MUST CHANGE in production!
  const ownerRole = "owner";

  try {
    const result = await new Promise((resolve, _) => {
      db.run(
        "INSERT INTO users (email, name, password, role) VALUES (?, ?, ?, ?)",
        [ownerEmail, ownerName, ownerPassword, ownerRole],
        function (err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });
    console.log("Default owner user created");
    console.log("Owner email:", ownerEmail);
    console.log("Owner password:", ownerPassword, "(CHANGE IMMEDIATELY in production!)");
    console.log("Role:", ownerRole);
  } catch (e) {
    // Owner might already exist from previous run
    console.log("Owner setup complete (or already exists)");
  }
}

setup().catch(console.error);