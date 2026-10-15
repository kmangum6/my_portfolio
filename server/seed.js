import bcrypt from 'bcrypt';
import db from './db.js';

db.exec(`
    DELETE FROM ticket_event;
    DELETE FROM comment;
    DELETE FROM ticket;
    DELETE FROM user;
    DELETE FROM category;
    DELETE FROM company;
    DELETE FROM sqlite_sequence;
`);

const hash = bcrypt.hashSync('demo1234', 10);

// Companies
const insertCompany = db.prepare(`
  INSERT INTO company (name, type, prim_phone, address)
  VALUES (?, ?, ?, ?)
`);
const support = insertCompany.run('Support Team', 'internal', '555-0100', '1 Help Desk Way').lastInsertRowid;
const acme = insertCompany.run('Acme Corp', 'customer', '555-0200', '42 Industrial Blvd').lastInsertRowid;

// Categories
const insertCategory = db.prepare('INSERT INTO category (name) VALUES (?)');
const [general, billing, bug, feature] = ['General', 'Billing', 'Bug', 'Feature Request']
  .map(n => insertCategory.run(n).lastInsertRowid);

// Users
const insertUser = db.prepare(`
    INSERT INTO user (name, email, prim_phone, password_hash, type, company_id, prim_contact)
    VALUES (?, ?, ?, ?, ?, ?, ?)
`);
const admin = insertUser.run('Alex Admin', 'admin@demo.com', '555-0101', hash, 'admin', support, 'false').lastInsertRowid;
const agent = insertUser.run('Riley Agent', 'agent@demo.com', '555-0102', hash, 'agent', support, 'false').lastInsertRowid;
const user  = insertUser.run('Jordan User', 'user@demo.com', '555-0201', hash, 'user', acme, 'true').lastInsertRowid;

// Tickets
const insertTicket = db.prepare(`
  INSERT INTO ticket (title, detail, status, priority, category_id, company_id, created_by, assigned_to, updated_by)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
const t1 = insertTicket.run('Cannot log in to portal', 'Password reset email never arrives.', 'open', 'high', general, acme, user, null, user).lastInsertRowid;
const t2 = insertTicket.run('Invoice shows wrong amount', 'March invoice is $200 higher than quoted.', 'in_progress', 'medium', billing, acme, user, agent, agent).lastInsertRowid;
const t3 = insertTicket.run('Export button throws error', 'Clicking Export on reports gives a blank page.', 'closed', 'urgent', bug, acme, user, agent, agent).lastInsertRowid;

// Comments
const insertComment = db.prepare(`
  INSERT INTO comment (ticket_id, author_id, body, public) VALUES (?, ?, ?, ?)
`);
insertComment.run(t2, agent, 'Looking into this now, thanks for the details.', 'true');
insertComment.run(t2, agent, 'Checked with billing, quote was missing a line item.', 'false');
insertComment.run(t3, agent, 'Fixed in the latest release.', 'true');

// Events
const insertEvent = db.prepare(`
  INSERT INTO ticket_event (ticket_id, actor_id, type, old_value, new_value)
  VALUES (?, ?, ?, ?, ?)
`);
insertEvent.run(t2, agent, 'assigned', null, 'Riley Agent');
insertEvent.run(t3, agent, 'status_changed', 'open', 'closed');

console.log('Seeded: 2 companies, 4 categories, 3 users, 3 tickets.');
