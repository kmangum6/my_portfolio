import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from './api';

const label = (s) => s.replace('_', ' ');

export default function TicketList() {
    const [options, setOptions] = useState({ statuses: [], priorities: [], categories: [] });
    const [filters, setFilters] = useState({ status: '', priority: '', category_id: '', search: '' });
    const [page, setPage] = useState(1);
    const [data, setData] = useState({ tickets: [], total: 0, limit: 20 });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api('/tickets/options').then(setOptions).catch((e) => setError(e.message));
    }, []);

    useEffect(() => {
        const params = new URLSearchParams({ page });
        for (const [key, value] of Object.entries(filters)) {
            if (value) params.set(key, value);
        }

        setLoading(true);
        api(`/tickets?${params}`)
            .then((d) => { setData(d); setError(''); })
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, [filters, page]);

    function updateFilter(name,value) {
        setFilters((f) => ({ ...f, [name]: value }));
        setPage(1);
    }

    const totalPages = Math.max(Math.ceil(data.total / data.limit), 1);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space=between', alignItems: 'center' }}>
                <h2>Tickets</h2>
                <Link to="/helpdesk/tickets/new">Create a Ticket</Link>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', margin: '1rem 0' }}>
                <input
                    type="search"
                    placeholder="Search tickets..."
                    value={filters.search}
                    onChange={(e) => updateFilter('search', e.target.value)}
                />

                <select value={filters.status} onChange={(e) => updateFilter('status', e.target.value)}> 
                    <option value="">All statuses</option>
                    {options.statuses.map((s) => (
                        <option key={s} value={s}>{label(s)}</option>
                    ))}               
                </select>

                <select value={filters.priority} onChange={(e) => updateFilter('priority', e.target.value)}>
                    <option value="">All priorities</option>
                    {options.priorities.map((p) => (
                        <option key={p} value={p}>{label(p)}</option>
                    ))}
                </select>

                <select value={filters.category_id} onChange={(e) => updateFilter('category_id', e.target.value)}>
                    <option value="">All categories</option>
                    {options.categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            {error && <p role="alert" style={{ color: 'crimson' }}>{error}</p>}

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ textAlign: 'left' }}>
                        <th>#</th><th>title</th><th>Status</th><th>Priority</th><th>Category</th><th>Assigned to</th><th>Created</th>
                    </tr>
                </thead>
                <tbody>
                    {data.tickets.map((t) => (
                        <tr key={t.id}>
                            <td><Link to={`/helpdesk/tickets/${t.id}`}>{t.title}</Link></td>
                            <td>{label(t.status)}</td>
                            <td>{t.priority}</td>
                            <td>{t.category_name ?? '-'}</td>
                            <td>{t.assigned_to_name ?? 'Unassigned'}</td>
                            <td>{t.created_at.slice(0, 10)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {!loading && data.tickets.length === 0 && <p>No tickets match these filters.</p>}

            <div style={{ marginTop: '1rem' }}>
                <button disabled={page <=1} onClick={() => setPage(page-1)}>Previous</button>
                <span style={{ margin: '0 0.75rem' }}> Page {page} of {totalPages} ({data.total} tickets)</span>
                <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
            </div>
        </div>
    );
}