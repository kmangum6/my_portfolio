import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from './api';

const label = (s) => s.replace('_', ' ');

export default function NewTicket() {
    const navigate = useNavigate();
    const [options, setOptions] = useState({ priorities: [], categories: [] });
    const [form, setForm] = useState({ title: '', detail: '', priority: 'medium', category_id: '' });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        api('/tickets/options').then(setOptions).catch((e) => setError(e.message));
    }, []);

    function setField(name, value) {
        setForm((f) => ({ ...f, [name]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const ticket = await api('/tickets', {
                method: 'POST',
                body: {
                    title: form.title,
                    detail: form.detail,
                    priority: form.priority,
                    category_id: form.category_id ? Number(form.category_id) : null,
                },
            });
            navigate(`/helpdesk/tickets/${ticket.id}`);
        } catch (err) {
            setError(err.message);
            setSubmitting(false);
        }
    }

    return (
        <div>
            <p><Link to="/helpdesk">&larr; Back to tickets</Link></p>
            <h2>New Ticket</h2>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem', maxWidth: 600 }}>
                <label>
                    Title<br />
                    <input
                        style={{ width: '100%' }}
                        value={form.title}
                        onChange={(e) => setField('title', e.target.value)}
                        maxLength={150}
                        required
                    />
                </label>

                <label>
                    Description<br />
                    <textarea
                        rows={6}
                        style={{ width: '100%' }}
                        value={form.detail}
                        onChange={(e) => setField('detail', e.target.value)}
                        required
                    />
                </label>

                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <label>
                        Priority<br />
                        <select value={form.priority} onChange={(e) => setField('priority', e.target.value)}>
                            {options.priorities.map((p) => (
                                <option key={p} value={p}>{label(p)}</option>
                            ))}
                        </select>
                    </label>

                    <label>
                        Category<br />
                        <select value={form.category_id} onChange={(e) => setField('category_id', e.target.value)}>
                            <option value="">None</option>
                            {options.categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </label>
                </div>

                {error && <p role="alert" style={{ color: 'crimson' }}>{error}</p>}

                <div>
                    <button type="submit" disabled={submitting}>
                        {submitting ? 'Creating…' : 'Create ticket'}
                    </button>{' '}
                    <Link to="/helpdesk">Cancel</Link>
                </div>
            </form>
        </div>
    );
}