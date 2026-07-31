const styles = {
  Paid: "border-emerald-600/60 bg-emerald-950/40 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]",
  Approved: "border-emerald-600/60 bg-emerald-950/40 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]",
  Accepted: "border-emerald-600/60 bg-emerald-950/40 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]",
  Active: "border-emerald-600/60 bg-emerald-950/40 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]",
  Pending: "border-amber-600/60 bg-amber-950/40 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]",
  "Pending Enrollment": "border-amber-600/60 bg-amber-950/40 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]",
  Disabled: "border-stone-600/60 bg-stone-900/50 text-stone-400",
  Rejected: "border-red-700/60 bg-red-950/40 text-red-400 shadow-[0_0_10px_rgba(185,28,28,0.2)]"
};

const StatusBadge = ({ status }) => (
  <span className={`badge ${styles[status] || styles.Pending} relative overflow-hidden font-display`}>
    <span className="h-1.5 w-1.5 rounded-full bg-current inline-block mr-1 opacity-80" />
    {status}
  </span>
);

export default StatusBadge;
