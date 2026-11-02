const MAP = {
    active: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Active' },
    expired: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', label: 'Expired' },
    suspended: { bg: 'bg-amber-50', text: 'text-amber-800', dot: 'bg-amber-500', label: 'Suspended' },
    expiring: { bg: 'bg-yellow-50', text: 'text-yellow-800', dot: 'bg-yellow-500', label: 'Expiring soon' }
};

export default function StatusBadge({ status, expiring }) {
    const key = expiring ? 'expiring' : status;
    const conf = MAP[key] || { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-400', label: status };

    return (
        <span className={`badge ${conf.bg} ${conf.text}`}>
            <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${conf.dot}`} />
            {conf.label}
        </span>
    );
}