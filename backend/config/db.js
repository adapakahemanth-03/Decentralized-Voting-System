const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "../evoting.db");

let dbInstance = null;

function saveToFile(db) {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

async function initDb() {
  const SQL = await initSqlJs();

  let db;
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS voters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      voter_id_hash TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      door_number TEXT NOT NULL,
      aadhar_id TEXT NOT NULL,
      address TEXT NOT NULL,
      state TEXT NOT NULL,
      district_id INTEGER NOT NULL,
      district_name TEXT NOT NULL
    )
  `);

  try {
    db.run("ALTER TABLE voters ADD COLUMN door_number TEXT DEFAULT ''");
  } catch (e) {}
  try {
    db.run("ALTER TABLE voters ADD COLUMN aadhar_id TEXT DEFAULT ''");
  } catch (e) {}
  try {
    db.run("ALTER TABLE voters ADD COLUMN address TEXT DEFAULT ''");
  } catch (e) {}

  saveToFile(db);

  const wrapper = {
    get(sql, ...params) {
      const stmt = db.prepare(sql);
      if (params.length > 0) {
        stmt.bind(params);
      }
      const hasRow = stmt.step();
      if (!hasRow) {
        stmt.free();
        return undefined;
      }
      const row = stmt.getAsObject();
      stmt.free();
      return row;
    },

    all(sql, ...params) {
      const stmt = db.prepare(sql);
      if (params.length > 0) {
        stmt.bind(params);
      }
      const rows = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();
      return rows;
    },

    run(sql, ...params) {
      db.run(sql, params.length > 0 ? params : []);
      saveToFile(db);
      const result = db.exec("SELECT last_insert_rowid()");
      const lastId = result[0] ? result[0].values[0][0] : null;
      return { lastID: lastId };
    },

    exec(sql) {
      db.run(sql);
      saveToFile(db);
    },
  };

  return wrapper;
}

async function getDb() {
  if (!dbInstance) {
    dbInstance = await initDb();
  }
  return dbInstance;
}

module.exports = getDb;
