import express from "express";
import sqlite3 from "sqlite3";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const { verbose } = sqlite3;
const db_sqlite = verbose();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(bodyParser.json());

const dbPath = path.join(__dirname, "tasks.db");
const db = new db_sqlite.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('admin', 'user')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      completed BOOLEAN DEFAULT 0,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users (id)      
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tarefa_id INTEGER NOT NULL,
      nome_usuario VARCHAR(100) NOT NULL,
      texto TEXT NOT NULL,
      data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tarefa_id) REFERENCES tarefas(id)
    )
  `);

  const defaultAdminEmail = "admin@todolist.com";
  const defaultAdminPassword = "admin123";

  db.get(
    "SELECT id FROM users WHERE email = ?",
    [defaultAdminEmail],
    async (err, row) => {
      if (!row) {
        const hashedPassword = await bcrypt.hash(defaultAdminPassword, 10);
        db.run(
          "INSERT INTO users (email, name, password, type) VALUES (?, ?, ?, ?)",
          [defaultAdminEmail, "Admin User", hashedPassword, "admin"],
          function (err) {
            if (err) {
              console.error("Error creating default admin:", err);
            } else {
              console.log(
                "Default admin created - Email: admin@todolist.com, Password: admin123"
              );
            }
          }
        );
      }
    }
  );
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user.type !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, name, password, type = "user" } = req.body;

    if (!email || !name || !password) {
      return res
        .status(400)
        .json({ error: "Email, name, and password are required" });
    }

    if (!["admin", "user"].includes(type)) {
      return res
        .status(400)
        .json({ error: 'Type must be either "admin" or "user"' });
    }

    db.get(
      "SELECT id FROM users WHERE email = ?",
      [email],
      async (err, row) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        if (row) {
          return res.status(400).json({ error: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        db.run(
          "INSERT INTO users (email, name, password, type) VALUES (?, ?, ?, ?)",
          [email, name, hashedPassword, type],
          function (err) {
            if (err) {
              return res.status(500).json({ error: err.message });
            }

            res.json({
              message: "User created successfully",
              data: {
                id: this.lastID,
                email,
                name,
                type,
              },
            });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    db.get(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, user) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        if (!user) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign(
          { id: user.id, email: user.email, type: user.type },
          JWT_SECRET,
          { expiresIn: "24h" }
        );

        res.json({
          message: "Login successful",
          data: {
            token,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              type: user.type,
            },
          },
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/auth/me", authenticateToken, (req, res) => {
  db.get(
    "SELECT id, email, name, type FROM users WHERE id = ?",
    [req.user.id],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        message: "success",
        data: user,
      });
    }
  );
});

app.get("/api/tasks", authenticateToken, (req, res) => {
  db.all("SELECT * FROM tasks ORDER BY created_at DESC", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      data: rows,
    });
  });
});

app.get("/api/tasks/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM tasks WHERE id = ?", [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (row) {
      res.json({
        message: "success",
        data: row,
      });
    } else {
      res.status(404).json({
        message: "Task not found",
      });
    }
  });
});

app.post("/api/tasks", authenticateToken, (req, res) => {
  console.log("Creating task request:", req.body);
  console.log("User:", req.user);

  const { title, description, completed = false } = req.body;

  if (!title) {
    console.log("Missing title");
    return res.status(400).json({
      error: "Title is required",
    });
  }

  const sql =
    "INSERT INTO tasks (title, description, completed, user_id) VALUES (?, ?, ?, ?)";
  const params = [title, description, completed ? 1 : 0, req.user.id];

  console.log("SQL params:", params);

  db.run(sql, params, function (err) {
    if (err) {
      console.error("Database error:", err);
      res.status(500).json({ error: err.message });
      return;
    }

    const newTask = {
      id: this.lastID,
      title,
      description,
      completed,
      user_id: req.user.id,
    };

    console.log("Task created successfully:", newTask);

    res.json({
      message: "Task created successfully",
      data: newTask,
    });
  });
});

app.put("/api/tasks/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, description, completed } = req.body;

  if (!title) {
    return res.status(400).json({
      error: "Title is required",
    });
  }

  const sql = `
    UPDATE tasks 
    SET title = ?, description = ?, completed = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `;
  const params = [title, description, completed ? 1 : 0, id];

  db.run(sql, params, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({
        message: "Task not found",
      });
    } else {
      res.json({
        message: "Task updated successfully",
        data: {
          id: parseInt(id),
          title,
          description,
          completed,
        },
      });
    }
  });
});

app.patch("/api/tasks/:id/toggle", authenticateToken, (req, res) => {
  const { id } = req.params;

  const sql = `
    UPDATE tasks 
    SET completed = CASE WHEN completed = 1 THEN 0 ELSE 1 END,
        updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `;

  db.run(sql, [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({
        message: "Task not found",
      });
    } else {
      db.get("SELECT * FROM tasks WHERE id = ?", [id], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({
          message: "Task status toggled successfully",
          data: row,
        });
      });
    }
  });
});

app.delete("/api/tasks/:id", authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM tasks WHERE id = ?", [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({
        message: "Task not found",
      });
    } else {
      res.json({
        message: "Task deleted successfully",
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on("SIGINT", () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log("Database connection closed.");
    process.exit(0);
  });
});
