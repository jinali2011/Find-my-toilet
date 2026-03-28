import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";

import { searchRestroomsInArea } from "./services/geminiService";

const db = new Database("loolocate.db");

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS restrooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    type TEXT NOT NULL, -- public, commercial, paid
    is_verified INTEGER DEFAULT 0,
    is_accessible INTEGER DEFAULT 0,
    has_baby_changing INTEGER DEFAULT 0,
    is_gender_neutral INTEGER DEFAULT 0,
    is_free INTEGER DEFAULT 1,
    access_type TEXT DEFAULT 'open', -- open, customer, key
    access_code TEXT,
    rating REAL DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    restroom_id INTEGER NOT NULL,
    rating INTEGER NOT NULL,
    cleanliness INTEGER NOT NULL,
    safety INTEGER NOT NULL,
    ease_of_access INTEGER NOT NULL,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restroom_id) REFERENCES restrooms(id)
  );

  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    restroom_id INTEGER NOT NULL,
    issue_type TEXT NOT NULL,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restroom_id) REFERENCES restrooms(id)
  );
`);

// Seed some initial data if empty
const count = db.prepare("SELECT COUNT(*) as count FROM restrooms").get() as { count: number };
const insert = db.prepare(`
  INSERT INTO restrooms (name, latitude, longitude, type, is_verified, is_accessible, has_baby_changing, is_gender_neutral, is_free, access_type, rating, review_count)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const checkExists = db.prepare("SELECT COUNT(*) as count FROM restrooms WHERE name = ?");

const seedData = [
  ["Hyde Park Public Toilets", 51.5074, -0.1657, "public", 1, 1, 1, 1, 1, "open", 4.2, 15],
  ["Starbucks Coffee", 51.5085, -0.1630, "commercial", 0, 1, 0, 0, 0, "customer", 3.8, 8],
  ["Victoria Station Paid Toilets", 51.4952, -0.1439, "paid", 1, 1, 1, 0, 0, "open", 4.5, 45],
  ["Skovlunde Center Toilets", 55.7215, 12.4012, "public", 1, 1, 1, 1, 1, "open", 4.0, 5],
  ["Netto Skovlunde", 55.7198, 12.3985, "commercial", 0, 1, 0, 0, 0, "customer", 3.5, 3],
  ["Copenhagen Central Station", 55.6727, 12.5645, "public", 1, 1, 1, 0, 0, "open", 4.3, 120],
  ["Skovlunde Bypark (Park)", 55.7230, 12.3950, "public", 0, 1, 1, 1, 1, "open", 3.9, 4],
  ["Ballerup Centret Mall", 55.7305, 12.3645, "public", 1, 1, 1, 1, 1, "open", 4.6, 85],
  ["Joe & The Juice (Skovlunde)", 55.7210, 12.4020, "commercial", 0, 1, 0, 1, 0, "customer", 4.1, 12],
  ["McDonald's Ballerup", 55.7320, 12.3680, "commercial", 1, 1, 1, 0, 0, "customer", 3.7, 24],
  ["Skovlunde Library", 55.7205, 12.3995, "public", 1, 1, 1, 1, 1, "open", 4.4, 18],
  ["The Laundromat Cafe", 55.6885, 12.5590, "commercial", 0, 1, 1, 1, 0, "customer", 4.2, 32],
  ["Magasin du Nord (Mall)", 55.6795, 12.5845, "commercial", 1, 1, 1, 1, 0, "open", 4.7, 56],
  ["Frederiksberg Have (Park)", 55.6750, 12.5250, "public", 1, 1, 1, 1, 1, "open", 4.0, 42],
  ["King's Garden (Kongens Have)", 55.6850, 12.5800, "public", 1, 1, 1, 1, 1, "open", 4.1, 28],
  ["Illum Department Store", 55.6790, 12.5790, "commercial", 1, 1, 1, 1, 0, "open", 4.5, 39],
  ["Espresso House (Ballerup)", 55.7310, 12.3650, "commercial", 0, 1, 0, 1, 0, "customer", 3.8, 15],
  ["Skovlunde Pizzeria", 55.7200, 12.4010, "commercial", 0, 0, 0, 0, 0, "customer", 3.2, 6],
  ["Public Toilet - Town Square", 55.7210, 12.4005, "public", 1, 1, 0, 1, 1, "open", 3.5, 10]
];

for (const data of seedData) {
  const exists = checkExists.get(data[0]) as { count: number };
  if (exists.count === 0) {
    insert.run(...data);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes
  app.get("/api/restrooms", (req, res) => {
    const restrooms = db.prepare("SELECT * FROM restrooms").all();
    res.json(restrooms);
  });

  app.post("/api/restrooms", (req, res) => {
    const { name, latitude, longitude, type, is_accessible, has_baby_changing, is_gender_neutral, is_free, access_type, access_code } = req.body;
    const result = db.prepare(`
      INSERT INTO restrooms (name, latitude, longitude, type, is_accessible, has_baby_changing, is_gender_neutral, is_free, access_type, access_code)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, latitude, longitude, type, is_accessible ? 1 : 0, has_baby_changing ? 1 : 0, is_gender_neutral ? 1 : 0, is_free ? 1 : 0, access_type, access_code);
    
    res.json({ id: result.lastInsertRowid });
  });

  app.post("/api/restrooms/:id/reviews", (req, res) => {
    const { id } = req.params;
    const { rating, cleanliness, safety, ease_of_access, comment } = req.body;
    
    db.transaction(() => {
      db.prepare(`
        INSERT INTO reviews (restroom_id, rating, cleanliness, safety, ease_of_access, comment)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(id, rating, cleanliness, safety, ease_of_access, comment);
      
      // Update average rating
      const stats = db.prepare("SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM reviews WHERE restroom_id = ?").get(id) as { avg_rating: number, count: number };
      db.prepare("UPDATE restrooms SET rating = ?, review_count = ? WHERE id = ?").run(stats.avg_rating, stats.count, id);
    })();
    
    res.json({ success: true });
  });

  app.post("/api/restrooms/:id/reports", (req, res) => {
    const { id } = req.params;
    const { issue_type, comment } = req.body;
    db.prepare("INSERT INTO reports (restroom_id, issue_type, comment) VALUES (?, ?, ?)").run(id, issue_type, comment);
    res.json({ success: true });
  });

  app.post("/api/restrooms/search", async (req, res) => {
    const { latitude, longitude } = req.body;
    try {
      const results = await searchRestroomsInArea(latitude, longitude);
      res.json(results);
    } catch (error) {
      console.error('Error searching area:', error);
      res.status(500).json({ error: 'Failed to search area' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve("dist/index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
