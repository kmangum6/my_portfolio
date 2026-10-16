import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from './api';
import { useAuth } from './AuthContext';

const label = (s) => s.replace('_', ' ');

export default function TicketDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const staff = user.type === 'agent' || user.type === 'admin';

    const [ticket, setTicket] = useState(null);
    const [options, setOptions] = useState({ statuses: [], priorities: [], categories: [], agents: [] });
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [commentBody, setCommentBody] = useState('');
    const [internal, setInternal] = useState(false);

    async function load() {
        try {
            setTicket(await api(`/tickets/${id}`));
            setError('');
        } catch (e) {
            setError(e.message);
        }
    }

    useEffect(() => { load(); }, [id]);

    useEffect(() => {
        api('/tickets/options').then(setOptions).catch((e) => setError(e.message));
    }, []);

    async function update(changes) {
        setSaving(true);
        try {
            await api(`/tickets/${id}`, { method: 'PATCH', body: changes });
            await load();
        } catch (e) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    }

    async function addComment(e) {
        e.preventDefault();
        try {
            await api(`/tickets/${id}/comments`, {
                method: 'POST',
                body: { body: commentBody, public: !internal },
            });
            setCommentBody('');
            setInternal(false);
            await load();
        } catch (err) {
            setError(err.message);
        }
    }

    if (!ticket) {
        return (
            <div>
                <p><Link to="/helpdesk">&larr; Back to tickets</Link></p>
                {error ? <p role="alert" style={{ color: 'crimson' }}>{error}</p> : <p>Loading…</p>}
            </div>
        );
    }

    return (
        <div>
            <p><Link to="/helpdesk">&larr; Back to tickets</Link></p>

            <h2>#{ticket.id} {ticket.title}</h2>
            <p style={{ color: 'gray' }}>
                {ticket.company_name} · opened by {ticket.created_by_name} on {ticket.created_at.slice(0, 10)}
            </p>

            {error && <p role="alert" style={{ color: 'crimson' }}>{error}</p>}

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', margin: '1rem 0' }}>
                <label>
                    Status<br />
                    {staff ? (
                        <select value={ticket.status} disabled={saving}
                            onChange={(e) => update({ status: e.target.value })}>
                            {options.statuses.map((s) => <option key={s} value={s}>{label(s)}</option>)}
                        </select>
                    ) : <strong>{label(ticket.status)}</strong>}
                </label>

                <label>
                    Priority<br />
                    {staff ? (
                        <select value={ticket.priority} disabled={saving}
                            onChange={(e) => update({ priority: e.target.value })}>
                            {options.priorities.map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>
                    ) : <strong>{ticket.priority}</strong>}
                </label>

                <label>
                    Category<br />
                    {staff ? (
                        <select value={ticket.category_id ?? ''} disabled={saving}
                            onChange={(e) => update({ category_id: e.target.value ? Number(e.target.value) : null })}>
                            <option value="">None</option>
                            {options.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    ) : <strong>{ticket.category_name ?? '-'}</strong>}
                </label>

                <label>
                    Assigned to<br />
                    {staff ? (
                        <select value={ticket.assigned_to ?? ''} disabled={saving}
                            onChange={(e) => update({ assigned_to: e.target.value ? Number(e.target.value) : null })}>
                            <option value="">Unassigned</option>
                            {options.agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                    ) : <strong>{ticket.assigned_to_name ?? 'Unassigned'}</strong>}
                </label>
            </div>

            <h3>Description</h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{ticket.detail}</p>

            <h3>Conversation</h3>
            {ticket.comments.length === 0 && <p>No comments yet.</p>}
            {ticket.comments.map((c) => (
                <div key={c.id} style={{
                    border: '1px solid #ccc', borderRadius: 6, padding: '0.5rem 0.75rem', margin: '0.5rem 0',
                    background: c.public === 'false' ? '#fff8e1' : 'transparent',
                }}>
                    <strong>{c.author_name}</strong>{' '}
                    <span style={{ color: 'gray' }}>{c.created_at.slice(0, 16)}</span>
                    {c.public === 'false' && <em style={{ marginLeft: '0.5rem' }}>(internal note)</em>}
                    <p style={{ whiteSpace: 'pre-wrap', margin: '0.25rem 0 0' }}>{c.body}</p>
                </div>
            ))}

            <form onSubmit={addComment} style={{ marginTop: '1rem' }}>
                <textarea
                    rows={3}
                    style={{ width: '100%' }}
                    placeholder="Write a reply…"
                    value={commentBody}
                    onChange={(e) => setCommentBody(e.target.value)}
                    required
                />
                {staff && (
                    <label style={{ display: 'block' }}>
                        <input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} />
                        {' '}Internal note (hidden from customer)
                    </label>
                )}
                <button type="submit">{internal ? 'Add internal note' : 'Send reply'}</button>
            </form>

            {staff && (
                <>
                    <h3>Activity log</h3>
                    <ul>
                        {ticket.events.map((ev) => (
                            <li key={ev.id}>
                                {ev.created_at.slice(0, 16)} — {ev.actor_name}: {label(ev.type)}
                                {(ev.old_value || ev.new_value) && ` (${ev.old_value ?? 'none'} → ${ev.new_value ?? 'none'})`}
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
}