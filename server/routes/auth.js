import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { JWT_SECRET, requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }

    const user = db.prepare('SELECT * FROM user WHERE email = ?').get(email);

    if (!user || user.status !== 'active' || !bcrypt.compareSync(password, user.password_hash)) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '8h' });

    res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 8 * 60 * 60 * 1000,
    });

    res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.type,
        company_id: user.company_id,
    });
});

router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ ok: true });
});

router.get('/me', requireAuth, (req, res) => {
    res.json(req.user);
});

export default router;