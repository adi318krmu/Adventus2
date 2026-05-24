const styles = {
  Paid: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  Accepted: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  Pending: "border-amber-400/40 bg-amber-400/10 text-amber-200",
  Rejected: "border-rose-400/40 bg-rose-400/10 text-rose-200"
};

const StatusBadge = ({ status }) => <span className={`badge ${styles[status] || styles.Pending}`}>{status}</span>;

export default StatusBadge;
