export default function StatCard({ label, value, accent = 'brand', hint }) {
    const accents = {
        brand: 'from-brand-500 to-brand-700',
        emerald: 'from-emerald-500 to-emerald-700',
        amber: 'from-amber-500 to-amber-600',
        red: 'from-red-500 to-red-700'
    };

    return (
        <div className="card overflow-hidden">
            <div className={`h-1 w-full bg-gradient-to-r ${accents[accent]}`} />
            <div className="p-5">
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
                {hint && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>}
            </div>
        </div>
    );
}