/*User details and login info */
CREATE TABLE IF NOT EXISTS user (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT NOT NULL,
    email           TEXT NOT NULL UNIQUE,
    prim_phone      TEXT NOT NULL,
    sec_phone       TEXT,
    phone_type      TEXT NOT NULL DEFAULT 'work' CHECK(phone_type IN('home','work','mobile','other')),
    password_hash   TEXT NOT NULL,
    type            TEXT NOT NULL DEFAULT 'user' CHECK (type IN('user','agent','admin')),
    status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN('active','inactive')),
    company_id      INTEGER NOT NULL,
    prim_contact    TEXT NOT NULL DEFAULT 'true' CHECK (prim_contact IN('true','false')),
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (company_id) REFERENCES company(id)
);

CREATE TABLE IF NOT EXISTS ticket (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    title           TEXT NOT NULL,
    detail          TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'open' CHECK (status IN('open','pending','in_progress','closed')),
    priority        TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN('low','medium','high','urgent')),
    category_id     INTEGER,
    company_id      INTEGER NOT NULL,
    created_by      INTEGER NOT NULL,
    assigned_to     INTEGER,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_by      INTEGER NOT NULL,
    resolved_at     TEXT,
    resolved_by     INTEGER,
    FOREIGN KEY (category_id) REFERENCES category(id),
    FOREIGN KEY (company_id) REFERENCES company(id),
    FOREIGN KEY (created_by) REFERENCES user(id),
    FOREIGN KEY (assigned_to) REFERENCES user(id),
    FOREIGN KEY (updated_by) REFERENCES user(id),
    FOREIGN KEY (resolved_by) REFERENCES user(id)
);

/* Categories for tickets to be put into */
CREATE TABLE IF NOT EXISTS category (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS company (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
    type            TEXT NOT NULL,
    prim_phone      TEXT NOT NULL,
    sec_phone       TEXT,
    address         TEXT,
    detail          TEXT
);

/* Comments to be put onto tickets */
CREATE TABLE IF NOT EXISTS comment (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id       INTEGER NOT NULL,
    author_id       INTEGER NOT NULL,
    body            TEXT NOT NULL,
    public          TEXT NOT NULL DEFAULT 'false' CHECK (public IN('true','false')),
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (ticket_id) REFERENCES ticket(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES user(id)
);

/* Events and changes made to tickets, recorded */
CREATE TABLE IF NOT EXISTS ticket_event (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id       INTEGER NOT NULL,
    actor_id        INTEGER NOT NULL,
    type            TEXT NOT NULL, 
    old_value       TEXT,
    new_value       TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (ticket_id) REFERENCES ticket(id) ON DELETE CASCADE,
    FOREIGN KEY (actor_id) REFERENCES user(id)
);

CREATE INDEX IF NOT EXISTS idx_tickets_status ON ticket(status); /* search for tickets with a specific status like 'open'*/
CREATE INDEX IF NOT EXISTS idx_tickets_assigned ON ticket(assigned_to); /*search for tickets assigned to a specific user */
CREATE INDEX IF NOT EXISTS idx_tickets_created ON ticket(created_by); /* seach for tickets created by a specific user */
CREATE INDEX IF NOT EXISTS idx_comments_on_ticket ON comment(ticket_id); /*search for comments on a specific ticket */
CREATE INDEX IF NOT EXISTS idx_events_ticket_id ON ticket_event(ticket_id); /*search for events on a specific ticket */
CREATE INDEX IF NOT EXISTS idx_ticket_created ON ticket(created_at); /*search for tickets created on a specific date */
CREATE INDEX IF NOT EXISTS idx_user_created ON user(created_at); /*search for users created on a specific date */
CREATE INDEX IF NOT EXISTS idx_user_in_comp ON user(company_id); /*search for users connected to a specific company */
CREATE INDEX IF NOT EXISTS idx_ticket_company ON ticket(company_id); /*search for tickets undera  specific company */
