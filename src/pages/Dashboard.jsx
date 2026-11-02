import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminAPI } from '../api';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';

const PLANS = [
    { value: 'demo', label: 'Demo (15 days)' },
    { value: '30d', label: '30 days' },
    { value: '90d', label: '90 days' },
    { value: '180d', label: '180 days' },
    { value: '365d', label: '365 days' }
];

export default function Clients() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [renewTarget, setRenewTarget] = useState(null);
    const [renewPlan, setRenewPlan] = useState('30d');
    const [resetTarget, setResetTarget] = useState(null);
    const [toast, setToast] = useState(null);
    const [busy, setBusy] = useState(false);

    const load = () => {
        setLoading(true);
        AdminAPI.clients()
            .then((r) => setClients(r.data))
            .finally(() => setLoading(false));
    };
    useEffect(load, []);

    const showToast = (msg, kind = 'success') => {
        setToast({ msg, kind });
        setTimeout(() => setToast(null), 4000);
    };

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return clients;
        return clients.filter(
            (c) => c.name.toLowerCase().includes(q) || c.mobile.includes(q)
        );
    }, [clients, query]);

    const now = new Date();
    const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const doRenew = async () => {
        setBusy(true);
        try {
            await AdminAPI.updateClient(renewTarget._id, { plan: renewPlan });
            setRenewTarget(null);
            load();
            showToast('Subscription renewed');
        } catch (e) {
            showToast(e?.response?.data?.error || 'Renew failed', 'error');
        } finally { setBusy(false); }
    };

    const doSuspend = async (client) => {
        const next = client.status === 'suspended' ? 'active' : 'suspended';
        if (!window.confirm(`${next === 'suspended' ? 'Suspend' : 'Activate'} ${client.name}?`)) return;
        try {
            await AdminAPI.updateClient(client._id, { status: next });
            load();
            showToast(`${client.name} ${next === 'suspended' ? 'suspended' : 'reactivated'}`);
        } catch (e) {
            showToast(e?.response?.data?.error || 'Update failed', 'error');
        }
    };

    const doResetPassword = async () => {
        setBusy(true);
        try {
            const { data } = await AdminAPI.resetClientPassword(resetTarget._id);
            setResetTarget(null);
            showToast(`Password reset. Login: ${data.credentials.mobile} / ${data.credentials.password}`);
        } catch (e) {
            showToast(e?.response?.data?.error || 'Reset failed', 'error');
        } finally { setBusy(false); }
    };

    const RowActions = ({ c }) => (
        <div className="flex flex-wrap gap-2">
            <button
                onClick={() => { setRenewTarget(c); setRenewPlan(c.plan); }}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
                Renew
            </button>
            <button
                onClick={() => setResetTarget(c)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
                Reset password
            </button>
            <button
                onClick={() => doSuspend(c)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium ${c.status === 'suspended'
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                    }`}
            >
                {c.status === 'suspended' ? 'Activate' : 'Suspend'}
            </button>
        </div>
    );

    return (
        <div className="space-y-5 sm:space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Clients</h1>
                    <p className="mt-1 text-sm text-slate-500 sm:text-base">Manage tenant subscriptions</p>
                </div>
                <Link to="/clients/new" className="btn-primary w-full sm:w-auto">
                    + Create client
                </Link>
            </div>

            <div className="relative">
                <svg
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                >
                    <circle cx="11" cy="11" r="7" />
                    <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
                </svg>
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by name or mobile…"
                    className="input pl-10"
                />
            </div>

            {loading && (
                <div className="card divide-y divide-slate-100">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-4">
                            <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />
                            <div className="flex-1 space-y-2">
                                <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200" />
                                <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && filtered.length === 0 && (
                <div className="card px-5 py-14 text-center">
                    <p className="text-slate-500">
                        {query ? 'No clients match your search.' : 'No clients yet.'}
                    </p>
                    {!query && (
                        <Link to="/clients/new" className="btn-primary mt-4">Create your first client</Link>
                    )}
                </div>
            )}

            {!loading && filtered.length > 0 && (
                <>
                    {/* Mobile cards */}
                    <ul className="space-y-3 sm:hidden">
                        {filtered.map((c) => {
                            const expired = new Date(c.endDate) < now;
                            const expiring = !expired && new Date(c.endDate) <= weekAhead;
                            return (
                                <li key={c._id} className="card p-4">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="truncate font-semibold text-slate-900">{c.name}</p>
                                            <p className="text-sm text-slate-500">{c.mobile}</p>
                                        </div>
                                        <StatusBadge status={expired ? 'expired' : c.status} expiring={expiring} />
                                    </div>
                                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium">{c.plan}</span>
                                        <span>Ends {new Date(c.endDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="mt-3 border-t border-slate-100 pt-3">
                                        <RowActions c={c} />
                                    </div>
                                </li>
                            );
                        })}
                    </ul>

                    {/* Desktop table */}
                    <div className="card hidden overflow-hidden sm:block">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th className="px-5 py-3 font-medium">Name</th>
                                        <th className="px-5 py-3 font-medium">Mobile</th>
                                        <th className="px-5 py-3 font-medium">Plan</th>
                                        <th className="px-5 py-3 font-medium">Ends</th>
                                        <th className="px-5 py-3 font-medium">Status</th>
                                        <th className="px-5 py-3 text-right font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filtered.map((c) => {
                                        const expired = new Date(c.endDate) < now;
                                        const expiring = !expired && new Date(c.endDate) <= weekAhead;
                                        return (
                                            <tr key={c._id} className="hover:bg-slate-50">
                                                <td className="px-5 py-3 font-medium">{c.name}</td>
                                                <td className="px-5 py-3 text-slate-600">{c.mobile}</td>
                                                <td className="px-5 py-3">{c.plan}</td>
                                                <td className="px-5 py-3 text-slate-600">{new Date(c.endDate).toLocaleDateString()}</td>
                                                <td className="px-5 py-3">
                                                    <StatusBadge status={expired ? 'expired' : c.status} expiring={expiring} />
                                                </td>
                                                <td className="px-5 py-3 text-right whitespace-nowrap">
                                                    <RowActions c={c} />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* Renew modal */}
            <Modal
                open={!!renewTarget}
                onClose={() => setRenewTarget(null)}
                title={`Renew ${renewTarget?.name || ''}`}
                footer={
                    <>
                        <button className="btn-secondary w-full sm:w-auto" onClick={() => setRenewTarget(null)}>
                            Cancel
                        </button>
                        <button className="btn-primary w-full sm:w-auto" disabled={busy} onClick={doRenew}>
                            {busy ? 'Renewing…' : 'Renew'}
                        </button>
                    </>
                }
            >
                <p className="mb-4 text-sm text-slate-600">
                    Current end date:{' '}
                    <span className="font-medium text-slate-900">
                        {renewTarget && new Date(renewTarget.endDate).toLocaleDateString()}
                    </span>
                </p>
                <label className="label">Extend by</label>
                <select value={renewPlan} onChange={(e) => setRenewPlan(e.target.value)} className="input">
                    {PLANS.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                </select>
            </Modal>

            {/* Reset password modal */}
            <Modal
                open={!!resetTarget}
                onClose={() => setResetTarget(null)}
                title="Reset password"
                footer={
                    <>
                        <button className="btn-secondary w-full sm:w-auto" onClick={() => setResetTarget(null)}>
                            Cancel
                        </button>
                        <button className="btn-danger w-full sm:w-auto" disabled={busy} onClick={doResetPassword}>
                            {busy ? 'Resetting…' : 'Reset to 123456'}
                        </button>
                    </>
                }
            >
                <p className="text-sm text-slate-600">
                    Reset password for <b>{resetTarget?.name}</b> ({resetTarget?.mobile}) to{' '}
                    <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">123456</code>?
                </p>
            </Modal>

            {/* Toast */}
            {toast && (
                <div
                    className={`fixed bottom-4 left-4 right-4 z-50 rounded-2xl px-4 py-3 text-sm font-medium text-white shadow-lg sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm ${toast.kind === 'error' ? 'bg-red-600' : 'bg-emerald-600'
                        }`}
                >
                    {toast.msg}
                </div>
            )}
        </div>
    );
}