const styles = {
  Paid: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  Approved: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  Accepted: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  Pending: "border-amber-400/40 bg-amber-400/10 text-amber-200",
  "Pending Enrollment": "border-amber-400/40 bg-amber-400/10 text-amber-200",
  Disabled: "border-slate-400/40 bg-slate-400/10 text-slate-300",
  Rejected: "border-rose-400/40 bg-rose-400/10 text-rose-200"
};

const StatusBadge = ({ status }) => <span className={`badge ${styles[status] || styles.Pending}`}>{status}</span>;

export default StatusBadge;
