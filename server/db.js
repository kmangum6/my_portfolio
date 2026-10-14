import Database from 'better-sqlite3';
import fs from 'fs';

const db = new Database('tickets.db');
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(fs.readFileSync(new URL('./schema.sql', import.meta.url), 'utf8'));

export default db;