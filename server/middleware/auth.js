import jwt from 'jsonwebtoken';
import db from '../db.js';

export const JWT_SECRET = process.env.JWT_SECRET || (
    process.env.NODE_ENV === 'production'
        ? (() => { throw new Error('JWT_SECRET must be set'); })()
        : 'dev-secret-change-me'
);

export function requireAuth(req, res, next) {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Not logged in' });

    try {
        const { id } = jwt.verify(token, JWT_SECRET);

        const user = db.prepare(
            'SELECT id, name, email, type, company_id, status FROM user WHERE id = ?'
        ).get(id);

        if (!user || user.status !== 'active') return res.status(401).json({ error: 'Not logged in' });
        req.user = user;
        next();
    } catch {
        res.status(401).json({ error: 'Not logged in'});
    }
}

export function requireRole(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.type)) {
            return res.status(403).json({ error: 'Forbidden' });
        };
        next();
    }
}