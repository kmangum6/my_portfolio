export async function api(path, { method = 'GET', body } = {}) {
    const res = await fetch(`/api${path}`, {
        method, 
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error || 'REquest failed');
    return data;
}
