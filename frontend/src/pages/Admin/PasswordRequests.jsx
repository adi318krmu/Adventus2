import { useEffect, useState } from "react";
import { Check, X, ShieldAlert, Key, CheckCircle, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import Shell from "../../components/Shell";
import JapaneseDivider from "../../components/JapaneseDivider";
import api from "../../utils/api";

const PasswordRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [tempPassword, setTempPassword] = useState("");
  const [approvedPassword, setApprovedPassword] = useState("");

  const loadRequests = async () => {
    try {
      const { data } = await api.get("/password-request");
      setRequests(data);
    } catch {
      toast.error("Failed to load password requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const openApproveModal = (req) => {
    const generated = `ADV-${Math.floor(100000 + Math.random() * 900000)}`;
    setTempPassword(generated);
    setSelectedRequest(req);
    setApprovedPassword("");
  };

  const handleApprove = async (e) => {
    e.preventDefault();
    if (!tempPassword || tempPassword.length < 6) {
      return toast.error("Temporary password must be at least 6 characters");
    }

    try {
      await api.put(`/password-request/${selectedRequest._id}/approve`, {
        tempPassword
      });
      toast.success("Password Reset Approved");
      setApprovedPassword(tempPassword);
      loadRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve request");
      setSelectedRequest(null);
    }
  };

  const handleReject = async (id) => {
    if (!confirm("Are you sure you want to reject this request?")) return;
    try {
      await api.put(`/password-request/${id}/reject`);
      toast.success("Request Rejected");
      loadRequests();
    } catch {
      toast.error("Failed to reject request");
    }
  };

  const pending = requests.filter((r) => r.status === "Pending");
  const resolved = requests.filter((r) => r.status !== "Pending");

  return (
    <Shell type="admin">
      <div className="border-b border-amber-500/30 pb-5">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-400 font-display flex items-center gap-1.5">
          <ShieldCheck size={14} /> Security Chamber
        </p>
        <h1 className="mt-1 text-3xl font-black font-display text-white">Password Recovery Petitions</h1>
        <p className="mt-1 text-xs text-stone-300">Authorize or dismiss student login key recovery petitions.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mt-6">
        <section className="card lg:col-span-2 border-amber-500/30 p-6 shadow-samuraiGold">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black font-display text-white">Pending Petitions</h2>
            <span className="badge border-amber-500/40 bg-amber-500/10 text-amber-400 font-display text-xs tracking-wider">
              {pending.length} Pending
            </span>
          </div>

          <JapaneseDivider className="my-5" />

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-xs">
              <thead className="font-display uppercase tracking-wider text-amber-400/90 border-b border-amber-500/30">
                <tr>
                  <th className="py-3 px-4">Student Details</th>
                  <th className="px-4">Petition Date</th>
                  <th className="px-4">Status</th>
                  <th className="px-4">Grandmaster Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-stone-400">
                      Loading petitions...
                    </td>
                  </tr>
                ) : pending.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-stone-400">
                      No pending password reset petitions.
                    </td>
                  </tr>
                ) : (
                  pending.map((req) => (
                    <tr key={req._id} className="border-t border-amber-500/10 hover:bg-amber-500/5 transition">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-white text-xs">{req.name}</p>
                        <p className="text-[11px] text-stone-400 font-mono">
                          {req.email} | {req.phone}
                        </p>
                      </td>
                      <td className="px-4 text-stone-300">{new Date(req.requestedAt).toLocaleString()}</td>
                      <td className="px-4">
                        <span className="badge border-amber-500/40 bg-amber-500/10 text-amber-400 font-display text-[10px] tracking-widest">
                          Pending
                        </span>
                      </td>
                      <td className="px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openApproveModal(req)}
                            className="btn-primary !p-2 text-xs"
                            title="Approve Petition"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => handleReject(req._id)}
                            className="rounded-xl border border-red-700/60 bg-red-950/40 p-2 text-red-300 hover:bg-red-900/60"
                            title="Reject Petition"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="card border-amber-500/30 p-6 shadow-samurai h-fit">
          <h2 className="text-lg font-black font-display text-white">Resolved History</h2>
          <JapaneseDivider className="my-4" />
          <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
            {resolved.map((req) => (
              <div key={req._id} className="border-b border-amber-500/20 pb-3">
                <p className="font-bold text-white text-xs">{req.name}</p>
                <p className="text-[11px] text-stone-400 font-mono">{req.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`badge ${
                      req.status === "Approved"
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                        : "border-red-500/40 bg-red-500/10 text-red-400"
                    } font-display text-[10px] tracking-widest`}
                  >
                    {req.status}
                  </span>
                  <span className="text-[10px] text-stone-500 ml-auto font-mono">
                    {new Date(req.resolvedAt || req.requestedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
            {!loading && resolved.length === 0 && (
              <p className="text-xs text-stone-400 py-4 text-center">No resolved petitions yet.</p>
            )}
          </div>
        </aside>
      </div>

      {/* Approve Request Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md grid place-items-center p-5">
          <div className="card w-full max-w-lg border-amber-500/50 p-8 shadow-samuraiGold">
            {!approvedPassword ? (
              <form onSubmit={handleApprove}>
                <h3 className="text-xl font-black font-display text-white flex items-center gap-2">
                  <ShieldAlert className="text-amber-400" size={20} /> Grant Password Reset Hanko
                </h3>
                <p className="text-xs text-stone-300 mt-2">
                  Approving password reset petition for <strong className="text-amber-400">{selectedRequest.name}</strong>.
                </p>

                <div className="mt-5 space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-amber-400/90 font-display mb-1.5">
                      Temporary Key Password
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3 text-stone-500" size={16} />
                      <input
                        className="input pl-9 text-xs font-mono"
                        value={tempPassword}
                        onChange={(e) => setTempPassword(e.target.value)}
                        required
                      />
                    </div>
                    <p className="text-[11px] text-stone-400 mt-1.5">
                      You can use the generated temporary key above or enter a custom one.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button className="btn-primary flex-1 font-display uppercase tracking-wider text-xs py-3">Approve Key</button>
                  <button
                    type="button"
                    onClick={() => setSelectedRequest(null)}
                    className="btn-outline flex-1 font-display uppercase tracking-wider text-xs py-3"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-4">
                <CheckCircle className="text-amber-400 mx-auto mb-4" size={48} />
                <h3 className="text-xl font-black font-display text-white">Reset Approved & Sealed!</h3>
                <p className="text-stone-300 text-xs mt-2">
                  The password key for <strong className="text-amber-400">{selectedRequest.name}</strong> has been updated.
                </p>

                <div className="mt-6 bg-stone-950 border border-amber-500/40 rounded-xl p-4 shadow-inner">
                  <p className="text-[10px] text-stone-400 font-display uppercase tracking-widest font-bold">Temporary Password Key</p>
                  <p className="text-2xl font-mono text-amber-400 mt-1 tracking-wider select-all font-bold">{approvedPassword}</p>
                </div>
                <p className="text-xs text-amber-300 mt-3 font-semibold">
                  * Provide this temporary password key to the apprentice student. They will update it on next login.
                </p>

                <button
                  onClick={() => setSelectedRequest(null)}
                  className="btn-primary mt-6 w-full font-display uppercase tracking-wider text-xs py-3"
                >
                  Close & Return
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </Shell>
  );
};

export default PasswordRequests;
