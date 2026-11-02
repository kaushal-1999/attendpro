import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminAPI } from '../api';

const PLANS = [
    { value: 'demo', label: 'Demo (15 days)' },
    { value: '30d', label: '30 days' },
    { value: '90d', label: '90 days' },
    { value: '180d', label: '180 days' },
    { value: '365d', label: '365 days' }
];

export default function CreateClient() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', mobile: '', plan: '30d' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [created, setCreated] = useState(null);

    const submit = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            const { data } = await AdminAPI.createClient(form);
            setCreated(data);
        } catch (err) {
            setError(err?.response?.data?.error || 'Create failed');
        } finally {
            setLoading(false);
        }
    };

    if (created) {
        return (
            <div className="mx-auto max-w-lg">
                <div className="card p-6 sm:p-8">
                    <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <h2 className="mt-4 text-center text-xl font-bold text-slate-900">Client created</h2>
                    <p className="mt-2 text-center text-sm text-slate-600">
                        Share these credentials with <b>{created.client.name}</b>
                    </p>

                    <div className="mt-5 space-y-2 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Mobile</span>
                            <span className="font-mono font-semibold text-slate-900">{created.credentials.mobile}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Password</span>
                            <span className="font-mono font-semibold text-slate-900">{created.credentials.password}</span>
                        </div>
                    </div>

                    <p className="mt-3 text-center text-xs text-slate-500">
                        The client can change this password later from the Android app.
                    </p>

                    <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                        <button onClick={() => navigate('/clients')} className="btn-primary flex-1">
                            Back to clients
                        </button>
                        <button
                            onClick={() => { setCreated(null); setForm({ name: '', mobile: '', plan: '30d' }); }}
                            className="btn-secondary flex-1"
                        >
                            Create another
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-lg">
            <header className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Create client</h1>
                <p className="mt-1 text-sm text-slate-500 sm:text-base">
                    Provision a new tenant with a subscription plan
                </p>
            </header>

            <form onSubmit={submit} className="card space-y-5 p-6 sm:p-8">
                <div>
                    <label className="label">Business name</label>
                    <input
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. Sharma Sweets"
                        className="input"
                    />
                </div>

                <div>
                    <label className="label">Owner mobile</label>
                    <input
                        required
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]{10}"
                        value={form.mobile}
                        onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                        placeholder="10-digit mobile"
                        className="input"
                    />
                    <p className="mt-1.5 text-xs text-slate-500">This becomes the client's login mobile.</p>
                </div>

                <div>
                    <label className="label">Subscription plan</label>
                    <select
                        value={form.plan}
                        onChange={(e) => setForm({ ...form, plan: e.target.value })}
                        className="input"
                    >
                        {PLANS.map((p) => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                    </select>
                </div>

                {error && (
                    <div className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700 ring-1 ring-red-100">
                        {error}
                    </div>
                )}

                <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                    {loading ? 'Creating…' : 'Create client'}
                </button>
            </form>
        </div>
    );
}