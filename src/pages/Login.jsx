import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import applogo from '../assets/applogo.png';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(mobile.trim(), password);
            navigate('/');
        } catch (err) {
            setError(err?.response?.data?.error || err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-950">
            {/* Background gradient orbs */}
            <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />

            {/* Content */}
            <div className="relative z-10 grid min-h-screen place-items-center px-4 py-10">
                <div className="w-full max-w-md">

                    {/* Brand header */}
                    <div className="mb-8 flex flex-col items-center text-center">
                        <div className="mb-5 grid h-24 w-24 place-items-center overflow-hidden rounded-3xl bg-white shadow-2xl shadow-brand-900/40 ring-4 ring-white/10">
                            <img
                                src={applogo}
                                alt="Patil Broadband Service"
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement.innerHTML =
                                        '<span class="text-3xl font-bold text-brand-600">PBS</span>';
                                }}
                            />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                            AttendPro
                        </h1>
                        <p className="mt-1.5 text-sm text-slate-400">
                            Patil Broadband Service
                        </p>
                    </div>

                    {/* Login card */}
                    <form
                        onSubmit={submit}
                        className="rounded-3xl bg-white/5 p-6 shadow-2xl ring-1 ring-white/10 backdrop-blur sm:p-8"
                    >
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-white">Sign in</h2>
                            <p className="mt-1 text-sm text-slate-400">
                                Enter your admin mobile and password
                            </p>
                        </div>

                        {/* Mobile */}
                        <div className="mb-4">
                            <label className="mb-1.5 block text-sm font-medium text-slate-300">
                                Mobile number
                            </label>
                            <div className="relative">
                                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="7" y="2" width="10" height="20" rx="2" />
                                        <path d="M11 18h2" strokeLinecap="round" />
                                    </svg>
                                </span>
                                <input
                                    type="tel"
                                    inputMode="numeric"
                                    autoComplete="username"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    placeholder="10-digit mobile"
                                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-base text-white placeholder:text-slate-500 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/20"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="mb-5">
                            <label className="mb-1.5 block text-sm font-medium text-slate-300">
                                Password
                            </label>
                            <div className="relative">
                                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="4" y="11" width="16" height="10" rx="2" />
                                        <path d="M8 11V7a4 4 0 018 0v4" strokeLinecap="round" />
                                    </svg>
                                </span>
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password"
                                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-12 text-base text-white placeholder:text-slate-500 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/20"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass((v) => !v)}
                                    className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white"
                                    aria-label={showPass ? 'Hide password' : 'Show password'}
                                >
                                    {showPass ? (
                                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    ) : (
                                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-4 rounded-xl bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300 ring-1 ring-red-500/20">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-brand-600 py-3 font-semibold text-white shadow-lg shadow-brand-900/50 transition hover:bg-brand-500 disabled:opacity-60"
                        >
                            {loading ? 'Signing in…' : 'Sign in'}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-xs text-slate-500">
                            © {new Date().getFullYear()} Patil Broadband Service
                        </p>
                        <p className="mt-1 text-xs text-slate-600">
                            Powered by AttendPro v1.0
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}