import { Router } from 'express';
import db from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth); // every ticket route requires a logged-in, active user

const STATUSES = ['open', 'pending', 'in_progress', 'closed'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const isStaff = (user) => user.type === 'agent' || user.type === 'admin';

const TICKET_SELECT = `
  SELECT t.*,
         c.name  AS company_name,
         cat.name AS category_name,
         cu.name AS created_by_name,
         au.name AS assigned_to_name
  FROM ticket t
  JOIN company c       ON c.id = t.company_id
  LEFT JOIN category cat ON cat.id = t.category_id
  JOIN user cu         ON cu.id = t.created_by
  LEFT JOIN user au    ON au.id = t.assigned_to
`;

// Returns the ticket, or null if it doesn't exist OR the user isn't allowed to see it.
// Returning 404 for both avoids revealing which ticket IDs exist.
function getTicketForUser(id, user) {
  const ticket = db.prepare(`${TICKET_SELECT} WHERE t.id = ?`).get(id);
  if (!ticket) return null;
  if (!isStaff(user) && ticket.company_id !== user.company_id) return null;
  return ticket;
}

function logEvent(ticketId, actorId, type, oldValue, newValue) {
  db.prepare(`
    INSERT INTO ticket_event (ticket_id, actor_id, type, old_value, new_value)
    VALUES (?, ?, ?, ?, ?)
  `).run(ticketId, actorId, type, oldValue, newValue);
}

// ---------- LIST ----------
router.get('/', (req, res) => {
  const { status, priority, assigned_to, category_id, search } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);

  const where = [];
  const params = [];

  // Regular users only see their own company's tickets
  if (!isStaff(req.user)) {
    where.push('t.company_id = ?');
    params.push(req.user.company_id);
  }
  if (status)      { where.push('t.status = ?');      params.push(status); }
  if (priority)    { where.push('t.priority = ?');    params.push(priority); }
  if (category_id) { where.push('t.category_id = ?'); params.push(category_id); }
  if (assigned_to === 'unassigned') {
    where.push('t.assigned_to IS NULL');
  } else if (assigned_to) {
    where.push('t.assigned_to = ?');
    params.push(assigned_to);
  }
  if (search) {
    where.push('(t.title LIKE ? OR t.detail LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const total = db.prepare(`SELECT COUNT(*) AS n FROM ticket t ${whereSql}`).get(...params).n;
  const tickets = db.prepare(`
    ${TICKET_SELECT}
    ${whereSql}
    ORDER BY t.created_at DESC, t.id DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, (page - 1) * limit);

  res.json({ tickets, total, page, limit });
});

// ---------- CREATE ----------
router.post('/', (req, res) => {
  const { title, detail, priority = 'medium', category_id = null } = req.body ?? {};

  if (!title?.trim() || !detail?.trim()) {
    return res.status(400).json({ error: 'Title and detail are required' });
  }
  if (!PRIORITIES.includes(priority)) {
    return res.status(400).json({ error: 'Invalid priority' });
  }
  if (category_id !== null &&
      !db.prepare('SELECT 1 FROM category WHERE id = ?').get(category_id)) {
    return res.status(400).json({ error: 'Invalid category' });
  }

  const create = db.transaction(() => {
    const result = db.prepare(`
      INSERT INTO ticket (title, detail, priority, category_id, company_id, created_by, updated_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(title.trim(), detail.trim(), priority, category_id,
           req.user.company_id, req.user.id, req.user.id);

    logEvent(result.lastInsertRowid, req.user.id, 'created', null, null);
    return result.lastInsertRowid;
  });

  const id = create();
  res.status(201).json(getTicketForUser(id, req.user));
});

// ---------- DETAIL ----------
router.get('/:id', (req, res) => {
  const ticket = getTicketForUser(req.params.id, req.user);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  const staff = isStaff(req.user);

  // Internal notes (public = 'false') are hidden from regular users
  const comments = db.prepare(`
    SELECT cm.*, u.name AS author_name
    FROM comment cm
    JOIN user u ON u.id = cm.author_id
    WHERE cm.ticket_id = ? ${staff ? '' : "AND cm.public = 'true'"}
    ORDER BY cm.created_at, cm.id
  `).all(ticket.id);

  // The audit log is staff-only
  const events = staff
    ? db.prepare(`
        SELECT e.*, u.name AS actor_name
        FROM ticket_event e
        JOIN user u ON u.id = e.actor_id
        WHERE e.ticket_id = ?
        ORDER BY e.created_at, e.id
      `).all(ticket.id)
    : [];

  res.json({ ...ticket, comments, events });
});

// ---------- UPDATE (agents/admins only) ----------
router.patch('/:id', requireRole('agent', 'admin'), (req, res) => {
  const ticket = db.prepare('SELECT * FROM ticket WHERE id = ?').get(req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  const body = req.body ?? {};
  const changes = {}; // column -> new value (only things that actually changed)

  if ('status' in body) {
    if (!STATUSES.includes(body.status)) return res.status(400).json({ error: 'Invalid status' });
    if (body.status !== ticket.status) changes.status = body.status;
  }
  if ('priority' in body) {
    if (!PRIORITIES.includes(body.priority)) return res.status(400).json({ error: 'Invalid priority' });
    if (body.priority !== ticket.priority) changes.priority = body.priority;
  }
  if ('assigned_to' in body) {
    const target = body.assigned_to; // an id, or null to unassign
    if (target !== null) {
      const assignee = db.prepare('SELECT type, status FROM user WHERE id = ?').get(target);
      if (!assignee || assignee.status !== 'active' || !['agent', 'admin'].includes(assignee.type)) {
        return res.status(400).json({ error: 'Assignee must be an active agent or admin' });
      }
    }
    if (target !== ticket.assigned_to) changes.assigned_to = target;
  }
  if ('category_id' in body) {
    const target = body.category_id;
    if (target !== null && !db.prepare('SELECT 1 FROM category WHERE id = ?').get(target)) {
      return res.status(400).json({ error: 'Invalid category' });
    }
    if (target !== ticket.category_id) changes.category_id = target;
  }

  if (Object.keys(changes).length === 0) {
    return res.json(getTicketForUser(ticket.id, req.user)); // nothing to do
  }

  const apply = db.transaction(() => {
    // Column names come from the whitelist above, never from user input,
    // so building the SET clause this way is safe. Values still use placeholders.
    const sets = Object.keys(changes).map((col) => `${col} = ?`);
    const values = Object.values(changes);

    sets.push(`updated_at = datetime('now')`, 'updated_by = ?');
    values.push(req.user.id);

    if ('status' in changes) {
      if (changes.status === 'closed') {
        sets.push(`resolved_at = datetime('now')`, 'resolved_by = ?');
        values.push(req.user.id);
      } else {
        sets.push('resolved_at = NULL', 'resolved_by = NULL'); // reopened
      }
    }

    db.prepare(`UPDATE ticket SET ${sets.join(', ')} WHERE id = ?`).run(...values, ticket.id);

    const eventTypes = {
      status: 'status_changed',
      priority: 'priority_changed',
      assigned_to: 'assigned',
      category_id: 'category_changed',
    };
    for (const [col, newVal] of Object.entries(changes)) {
      logEvent(ticket.id, req.user.id, eventTypes[col],
               ticket[col] == null ? null : String(ticket[col]),
               newVal == null ? null : String(newVal));
    }
  });

  apply();
  res.json(getTicketForUser(ticket.id, req.user));
});

// ---------- ADD COMMENT ----------
router.post('/:id/comments', (req, res) => {
  const ticket = getTicketForUser(req.params.id, req.user);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  const { body, public: isPublic = true } = req.body ?? {};
  if (!body?.trim()) return res.status(400).json({ error: 'Comment body is required' });

  // Regular users can only post public comments. Staff can choose.
  const publicValue = isStaff(req.user) && isPublic === false ? 'false' : 'true';

  const result = db.prepare(`
    INSERT INTO comment (ticket_id, author_id, body, public) VALUES (?, ?, ?, ?)
  `).run(ticket.id, req.user.id, body.trim(), publicValue);

  db.prepare(`UPDATE ticket SET updated_at = datetime('now'), updated_by = ? WHERE id = ?`)
    .run(req.user.id, ticket.id);

  const comment = db.prepare(`
    SELECT cm.*, u.name AS author_name
    FROM comment cm JOIN user u ON u.id = cm.author_id
    WHERE cm.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json(comment);
});

export default router;