'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Trash2, ExternalLink, Plus, LogOut } from 'lucide-react';

interface Location {
    id: string;
    raw_address: string;
    display_name: string | null;
    latitude: number;
    longitude: number;
    created_at: string;
}

export default function Dashboard() {
    const [locations, setLocations] = useState<Location[]>([]);
    const [newAddress, setNewAddress] = useState('');
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        try {
            const res = await fetch('/api/locations');
            if (res.status === 401) {
                router.push('/login');
                return;
            }
            if (res.ok) {
                const data = await res.json();
                setLocations(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAddress.trim()) return;

        setAdding(true);
        setError('');

        try {
            const res = await fetch('/api/locations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ raw_address: newAddress }),
            });

            if (res.ok) {
                fetchLocations();
                setNewAddress('');
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to add address');
            }
        } catch (e) {
            setError('Error adding address');
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this location?')) return;

        // Optimistic update
        setLocations(locations.filter(l => l.id !== id));

        try {
            const res = await fetch(`/api/locations/${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) {
                // Revert or show error
                fetchLocations();
            }
        } catch (e) {
            fetchLocations();
        }
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
        router.refresh();
    };

    return (
        <div className="container animate-fade-in">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin color="var(--accent-primary)" /> My Locations
                </h2>
                <button onClick={handleLogout} className="btn" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                    <LogOut size={16} style={{ marginRight: '0.5rem' }} /> Logout
                </button>
            </header>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <form onSubmit={handleAdd} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <input
                        className="input"
                        style={{ flex: 1, minWidth: '200px' }}
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        placeholder="Enter an address (e.g. Tokyo Tower)"
                        disabled={adding}
                    />
                    <button type="submit" className="btn btn-primary" disabled={adding || !newAddress.trim()}>
                        {adding ? 'Adding...' : <div style={{ display: 'flex', alignItems: 'center' }}><Plus size={18} style={{ marginRight: '0.5rem' }} /> Add Place</div>}
                    </button>
                </form>
                {error && <p style={{ color: 'var(--danger)', marginTop: '0.5rem', fontSize: '0.9rem' }}>{error}</p>}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading locations...</div>
            ) : locations.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '4rem' }}>
                    <div style={{ background: 'var(--bg-secondary)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                        <MapPin size={32} />
                    </div>
                    <h3>No locations saved yet</h3>
                    <p>Add your first address above to get started.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                    {locations.map(loc => (
                        <div key={loc.id} className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', wordBreak: 'break-word', lineHeight: 1.4 }}>{loc.display_name || loc.raw_address}</h3>
                                <button
                                    onClick={() => handleDelete(loc.id)}
                                    className="btn-danger"
                                    style={{ border: 'none', padding: '0.4rem', cursor: 'pointer', borderRadius: '4px', marginLeft: '0.5rem' }}
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{loc.raw_address}</p>
                            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                <span style={{ fontFamily: 'monospace' }}>{loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}</span>
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${loc.latitude},${loc.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ display: 'flex', alignItems: 'center', color: 'var(--accent-primary)', marginLeft: 'auto', fontWeight: 500 }}
                                >
                                    Open Map <ExternalLink size={14} style={{ marginLeft: '0.25rem' }} />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
