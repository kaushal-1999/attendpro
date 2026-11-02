import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../auth';

const NAV = [
    { to: '/', label: 'Dashboard', icon: 'M3 12l9-9 9 9M5 10v10h14V10' },
    { to: '/clients', label: 'Clients', icon: 'M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M16 3.13a4 4 0 010 7.75M12 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { to: '/clients/new', label: 'Create client', icon: 'M12 4v16m8-8H4' }
];

function Icon({ d }) {
    return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <path d={d} />
        </svg>
    );
}

export default function Layout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [open, setOpen] = useState(false);

    // Close drawer on route change
    useEffect(() => { setOpen(false); }, [location.pathname]);

    const navClass = ({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive
            ? 'bg-brand-50 text-brand-700'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`;

    const SidebarInner = () => (
        <>
            <div className="mb-8 flex items-center gap-2.5 px-2">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 font-bold text-white">
                    A
                </div>
                <div>
                    <p className="text-base font-bold leading-none">AttendPro</p>
                    <p className="mt-0.5 text-xs text-slate-500">Admin console</p>
                </div>
            </div>

            <nav className="flex flex-col gap-1">
                {NAV.map((item) => (
                    <NavLink key={item.to} to={item.to} end={item.to === '/'} className={navClass}>
                        <Icon d={item.icon} />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div className="mt-auto border-t border-slate-200 pt-4 text-sm">
                <p className="px-3 text-xs uppercase tracking-wide text-slate-400">Signed in as</p>
                <p className="px-3 font-medium text-slate-800">{user?.mobile}</p>
                <button
                    onClick={() => { logout(); navigate('/login'); }}
                    className="btn-secondary mt-3 w-full"
                >
                    Logout
                </button>
            </div>
        </>
    );

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Desktop sidebar */}
            <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white px-3 py-5 lg:flex">
                <SidebarInner />
            </aside>

            {/* Mobile drawer */}
            <div
                className={`fixed inset-0 z-40 lg:hidden ${open ? '' : 'pointer-events-none'}`}
                aria-hidden={!open}
            >
                <div
                    className={`absolute inset-0 bg-slate-900/40 transition-opacity ${open ? 'opacity-100' : 'opacity-0'
                        }`}
                    onClick={() => setOpen(false)}
                />
                <aside
                    className={`absolute inset-y-0 left-0 flex w-72 flex-col border-r border-slate-200 bg-white px-3 py-5 shadow-2xl transition-transform ${open ? 'translate-x-0' : '-translate-x-full'
                        }`}
                >
                    <SidebarInner />
                </aside>
            </div>

            {/* Main content */}
            <div className="flex min-w-0 flex-1 flex-col">
                {/* Mobile topbar */}
                <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
                    <button
                        onClick={() => setOpen(true)}
                        className="grid h-10 w-10 place-items-center rounded-xl text-slate-700 hover:bg-slate-100"
                        aria-label="Open menu"
                    >
                        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
                        </svg>
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white">
                            A
                        </div>
                        <span className="font-semibold">AttendPro</span>
                    </div>
                    <div className="w-10" />
                </header>

                <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                    <div className="mx-auto max-w-6xl">{children}</div>
                </main>
            </div>
        </div>
    );
}