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
            .then(r => setClients(r.data))
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
        return clients.filter(c =>
            c.name.toLowerCase().includes(q) || c.mobile.includes(q)
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

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">Clients</h1>
                    <p className="text-slate-500">Manage tenant subscriptions</p>
                </div>
                <Link to="/clients/new"
                    className="rounded-lg bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700">
                    + Create client
                </Link>
            </div>

            <input
                value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or mobile…"
                className="w-full max-w-md rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />

            <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-left text-slate-500">
                        <tr>
                            <th className="px-4 py-3 font-medium">Name</th>
                            <th className="px-4 py-3 font-medium">Mobile</th>
                            <th className="px-4 py-3 font-medium">Plan</th>
                            <th className="px-4 py-3 font-medium">Ends</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                            <th className="px-4 py-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {loading && (
                            <tr><td colSpan="6" className="px-4 py-6 text-center text-slate-500">Loading…</td></tr>
                        )}
                        {!loading && filtered.length === 0 && (
                            <tr><td colSpan="6" className="px-4 py-6 text-center text-slate-500">No clients match.</td></tr>
                        )}
                        {filtered.map(c => {
                            const expired = new Date(c.endDate) < now;
                            const expiring = !expired && new Date(c.endDate) <= weekAhead;
                            return (
                                <tr key={c._id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium">{c.name}</td>
                                    <td className="px-4 py-3 text-slate-600">{c.mobile}</td>
                                    <td className="px-4 py-3">{c.plan}</td>
                                    <td className="px-4 py-3 text-slate-600">{new Date(c.endDate).toLocaleDateString()}</td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={expired ? 'expired' : c.status} expiring={expiring} />
                                    </td>
                                    <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                                        <button
                                            onClick={() => { setRenewTarget(c); setRenewPlan(c.plan); }}
                                            className="rounded-md border border-slate-300 px-2.5 py-1 text-xs hover:bg-slate-100"
                                        >Renew</button>
                                        <button
                                            onClick={() => setResetTarget(c)}
                                            className="rounded-md border border-slate-300 px-2.5 py-1 text-xs hover:bg-slate-100"
                                        >Reset password</button>
                                        <button
                                            onClick={() => doSuspend(c)}
                                            className={`rounded-md px-2.5 py-1 text-xs ${c.status === 'suspended'
                                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                                    : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                                }`}
                                        >{c.status === 'suspended' ? 'Activate' : 'Suspend'}</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <Modal
                open={!!renewTarget} onClose={() => setRenewTarget(null)}
                title={`Renew ${renewTarget?.name || ''}`}
                footer={
                    <>
                        <button className="rounded-lg px-3 py-2 text-sm hover:bg-slate-100"
                            onClick={() => setRenewTarget(null)}>Cancel</button>
                        <button disabled={busy}
                            className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
                            onClick={doRenew}>
                            {busy ? 'Renewing…' : 'Renew'}
                        </button>
                    </>
                }
            >
                <p className="mb-3 text-sm text-slate-600">
                    Current end date:{' '}
                    <span className="font-medium text-slate-900">
                        {renewTarget && new Date(renewTarget.endDate).toLocaleDateString()}
                    </span>
                </p>
                <label className="block text-sm font-medium text-slate-700">Extend by</label>
                <select
                    value={renewPlan} onChange={(e) => setRenewPlan(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                    {PLANS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
            </Modal>

            <Modal
                open={!!resetTarget} onClose={() => setResetTarget(null)}
                title="Reset password"
                footer={
                    <>
                        <button className="rounded-lg px-3 py-2 text-sm hover:bg-slate-100"
                            onClick={() => setResetTarget(null)}>Cancel</button>
                        <button disabled={busy}
                            className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                            onClick={doResetPassword}>
                            {busy ? 'Resetting…' : 'Reset to 123456'}
                        </button>
                    </>
                }
            >
                <p className="text-sm text-slate-600">
                    Reset password for <b>{resetTarget?.name}</b> ({resetTarget?.mobile}) to{' '}
                    <code className="rounded bg-slate-100 px-1">123456</code>?
                </p>
            </Modal>

            {toast && (
                <div className={`fixed bottom-6 right-6 max-w-sm rounded-lg px-4 py-3 text-sm text-white shadow-lg ${toast.kind === 'error' ? 'bg-red-600' : 'bg-emerald-600'
                    }`}>{toast.msg}</div>
            )}
        </div>
    );
}