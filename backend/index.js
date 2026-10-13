const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3");
const { authenticateToken, authorizeRole, checkRoleHierarchy } = require("./auth.middleware");

const app = express();
const PORT = process.env.PORT || 4000;

// ═══════════════════════════════════════════════════════════════
// SECURITY HEADERS
// ═══════════════════════════════════════════════════════════════
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; img-src 'self' data: blob:; connect-src 'self'; frame-ancestors 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests"
  );
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// ═══════════════════════════════════════════════════════════════
// CORS CONFIGURATION
// ═══════════════════════════════════════════════════════════════
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
      if (
        process.env.NODE_ENV !== "production" && origin.includes("localhost")
      )
        return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ═══════════════════════════════════════════════════════════════
// REQUEST PARSING
// ═══════════════════════════════════════════════════════════════
app.use(express.json({ limit: "1mb" }));

// ═══════════════════════════════════════════════════════════════
// AUTHENTICATION MIDDLEWARE
// ═══════════════════════════════════════════════════════════════
// In production, validate JWT token here
// For demo: attach user role via x-user-role header

// ════════════════════════════════════════════════════════════════
// DATABASE INITIALIZATION
// ═══════════════════════════════════════════════════════════════
let db;

(async () => {
  db = new sqlite3.Database("./dev.db");

  await new Promise((resolve, reject) => {
    db.exec(
      `
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
    `,
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });

  console.log("Database connected and tables ensured");
})();

// ═══════════════════════════════════════════════════════════════
// API ROUTES
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// PUBLIC ROUTES (no auth required)
// ═══════════════════════════════════════════════════════════════

// GET /api/events - list all events (public)
app.get("/api/events", async (req, res) => {
  try {
    const events = await new Promise((resolve, reject) => {
      db.all(
        "SELECT id, slug, tag, title, category, prize_pool, venue, format, schedule, featured, created_at, poster_url FROM events ORDER BY featured DESC, title ASC",
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// GET /api/events/:slug - single event (public)
app.get("/api/events/:slug", async (req, res) => {
  try {
    const event = await new Promise((resolve, reject) => {
      db.get(
        "SELECT id, slug, tag, title, category, description, image, prize_pool, venue, format, schedule, team_size, cta, featured, created_at, poster_url FROM events WHERE slug = ?",
        [req.params.slug],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch event" });
  }
});

// ═══════════════════════════════════════════════════════════════
// AUTHENTICATED ROUTES (token required)
// ═══════════════════════════════════════════════════════════════

// POST /api/auth/login - login with credentials
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const user = await new Promise((resolve, _) => {
      db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Simple password check (compare with stored plaintext)
    // In production: use bcrypt.compare()
    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Return user info and a simple token for demo
    const token = `demo-token-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

// ═══════════════════════════════════════════════════════════════
// ADMIN & MODERATOR ROUTES (protected)
// ═══════════════════════════════════════════════════════════════

// MIDDLEWARE: protect all routes after this point
app.use(authenticateToken);

// GET /api/user - current user info
app.get("/api/user", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  res.json({ user: req.user });
});

// ═══════════════════════════════════════════════════════════════
// OWNER-ONLY ROUTES
// ═══════════════════════════════════════════════════════════════
// Owner can: manage users, add admin/moderator

// GET /api/admin/users - list all users (owner only)
app.get(
  "/api/admin/users",
  authorizeRole("owner"),
  async (req, res) => {
    try {
      const users = await new Promise((resolve, _) => {
        db.all("SELECT id, email, name, role, created_at FROM users", (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  }
);

// POST /api/admin/users - create new user (owner only)
// Can create admins and moderators, but NOT new owners
app.post(
  "/api/admin/users",
  authorizeRole("owner"),
  async (req, res) => {
    try {
      const { email, name, password, role } = req.body;

      if (!email || !name || !role) {
        return res
          .status(400)
          .json({ error: "Email, name, and role are required" });
      }

      // Validate role
      const validRoles = ["owner", "admin", "moderator"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: "Invalid role specified" });
      }

      // Prevent creating new owners via API (only the initial setup)
      if (role === "owner") {
        return res
          .status(403)
          .json({ error: "Cannot create new owner via API" });
      }

      // Check if user already exists
      const existing = await new Promise((resolve, _) => {
        db.get("SELECT id FROM users WHERE email = ?", [email], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (existing) {
        return res.status(409).json({ error: "User with this email already exists" });
      }

      // In production: hash password with bcrypt
      // For demo: store plaintext with strong warning
      const safeRole = role === "owner" ? "moderator" : role; // Never store new owner

      const result = await new Promise((resolve, _) => {
        db.run(
          "INSERT INTO users (email, name, password, role) VALUES (?, ?, ?, ?)",
          [email, name, password, safeRole],
          function (err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID });
          }
        );
      });

      res.status(201).json({
        message: "User created successfully",
        user: { id: result.lastID, email, name, role: safeRole },
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to create user" });
    }
  }
);

// ═══════════════════════════════════════════════════════════════
// ADMIN ROUTES (admin can manage moderators and events)
// ═══════════════════════════════════════════════════════════════
// Admin can: promote/demote moderators, view/modify moderators

// GET /api/admin/moderators - list all moderators (admin only)
app.get(
  "/api/admin/moderators",
  authorizeRole("admin"),
  async (req, res) => {
    try {
      const moderators = await new Promise((resolve, _) => {
        db.all(
          "SELECT id, email, name, role, created_at FROM users WHERE role = 'moderator'",
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          }
        );
      });
      res.json(moderators);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch moderators" });
    }
  }
);

// POST /api/admin/moderators - promote user to moderator (admin only)
// Note: admin cannot add new moderators if we strictly follow the rules
// But admin can promote existing users to moderator role
app.post(
  "/api/admin/moderators/promote",
  authorizeRole("admin"),
  async (req, res) => {
    try {
      const { targetUserId } = req.body;

      if (!targetUserId) {
        return res.status(400).json({ error: "Target user ID required" });
      }

      // Update user role to moderator
      const result = await new Promise((resolve, _) => {
        db.run(
          "UPDATE users SET role = 'moderator' WHERE id = ?",
          [targetUserId],
          function (err) {
            if (err) reject(err);
            else resolve({ changes: this.changes });
          }
        );
      });

      if (result.changes === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        message: "User promoted to moderator successfully",
        userId: targetUserId,
        newRole: "moderator",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to promote user" });
    }
  }
);

// ═══════════════════════════════════════════════════════════════
// MODERATOR ROUTES (manage events, descriptions, posters)
// ═══════════════════════════════════════════════════════════════
// Moderator can: edit event descriptions, upload posters (1350x1080)
// Moderator CANNOT: add new moderators, add new admins

// GET /api/moderator/events - list events assigned to moderator
app.get("/api/moderator/events", async (req, res) => {
  try {
    // In a full system, events would have a moderator_id owner
    // For now, return all featured events moderators can manage
    const events = await new Promise((resolve, _) => {
      db.all(
        "SELECT id, slug, tag, title, category, description, image, prize_pool, venue, format, schedule, featured, poster_url FROM events WHERE featured = 1 ORDER BY title ASC",
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// PUT /api/moderator/events/:slug - update event description/poster (moderator only)
// Poster must be 1350x1080
app.put(
  "/api/moderator/events/:slug",
  async (req, res) => {
    try {
      const { slug } = req.params;
      const { description, poster_url } = req.body;

      // Validate poster dimensions (1350x1080)
      if (poster_url) {
        // Basic validation - in production, verify actual image dimensions
        const validFormats = [".jpg", ".jpeg", ".png", ".webp"];
        const lowerUrl = poster_url.toLowerCase();
        const validFormat = validFormats.some((fmt) => lowerUrl.endsWith(fmt));

        if (!validFormat) {
          return res.status(400).json({
            error: "Invalid poster format. Use JPG, PNG, or WebP",
          });
        }
        // Note: Actual dimension validation would require image analysis
        // For demo, accept any valid-looking URL
      }

      const result = await new Promise((resolve, _) => {
        db.run(
          "UPDATE events SET description = ?, poster_url = ?, updated_at = CURRENT_TIMESTAMP WHERE slug = ?",
          [description || "", poster_url || "", slug],
          function (err) {
            if (err) reject(err);
            else {
              // Return updated event
              db.get(
                "SELECT id, slug, tag, title, category, description, image, prize_pool, venue, format, schedule, featured, poster_url FROM events WHERE slug = ?",
                [slug],
                (err2, row) => {
                  if (err2) reject(err2);
                  else {
                    // Add changes info
                    row.changes = this.changes;
                    resolve(row);
                  }
                }
              );
            }
          }
        );
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to update event" });
    }
  }
);

// ═══════════════════════════════════════════════════════════════
// EVENT REGISTRATION ROUTES
// ═══════════════════════════════════════════════════════════════

// POST /api/support - user registration
app.post("/api/support", async (req, res) => {
  try {
    const { email, name, eventSlug } = req.body;

    if (!email || !eventSlug) {
      return res.status(400).json({ error: "Email and event slug required" });
    }

    // Validate event exists
    const event = await new Promise((resolve, _) => {
      db.get("SELECT id FROM events WHERE slug = ?", [eventSlug], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    const result = await new Promise((resolve, _) => {
      db.run(
        "INSERT INTO registrations (event_id, email, name) VALUES ((SELECT id FROM events WHERE slug = ?), ?, ?)",
        [eventSlug, email, name || null],
        function (err) {
          if (err) reject(err);
          else resolve({ lastID: this.lastID });
        }
      );
    });

    res.status(201).json({
      id: result.lastID,
      event_id: event.id,
      email,
      name,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to process registration" });
  }
});

// GET /api/support - list registrations (limited, auth required)
app.get("/api/support", authenticateToken, async (req, res) => {
  try {
    const registrations = await new Promise((resolve, _) => {
      db.all(
        "SELECT id, event_id, email, name, created_at FROM registrations ORDER BY created_at DESC LIMIT 50",
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch registrations" });
  }
});

// ═══════════════════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════════════════

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Generic error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ═══════════════════════════════════════════════════════════════
// SERVER START
// ═══════════════════════════════════════════════════════════════

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});